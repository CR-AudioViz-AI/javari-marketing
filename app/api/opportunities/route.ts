// ============================================================================
// CR AUDIOVIZ AI - OPPORTUNITY MONITOR API
// Scans Reddit, HN, Twitter for marketing opportunities
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  findRedditOpportunities, 
  findHNOpportunities, 
  searchTwitter,
  comprehensiveMarketResearch,
  getNicheRecommendations 
} from '@/lib/free-apis-comprehensive';
import { NICHE_CONFIGS } from '@/lib/campaign-engine';

// ============================================================================
// GET - Find opportunities based on keywords/niche
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nicheSlug = searchParams.get('niche');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const sources = searchParams.get('sources')?.split(',') || ['reddit', 'hackernews'];
    const limit = parseInt(searchParams.get('limit') || '20');

    // Return API info if no params
    if (!nicheSlug && keywords.length === 0) {
      return NextResponse.json({
        service: 'Opportunity Monitor API',
        description: 'Find marketing opportunities across Reddit, Hacker News, and Twitter',
        endpoints: {
          'GET /api/opportunities?niche=crochet': 'Find opportunities for a niche',
          'GET /api/opportunities?keywords=tool,app,help': 'Search by keywords',
          'GET /api/opportunities?niche=saas&sources=reddit,hackernews': 'Filter sources',
          'POST /api/opportunities': 'Comprehensive market research',
        },
        availableNiches: Object.keys(NICHE_CONFIGS),
        availableSources: ['reddit', 'hackernews', 'twitter'],
      });
    }

    // Get niche config
    let searchKeywords = keywords;
    let subreddits: string[] = [];
    
    if (nicheSlug && NICHE_CONFIGS[nicheSlug]) {
      const config = NICHE_CONFIGS[nicheSlug];
      searchKeywords = [...new Set([...keywords, ...config.keywords.slice(0, 5)])];
      subreddits = config.recommendedSubreddits;
    }

    const opportunities: any[] = [];
    const errors: string[] = [];

    // Search Reddit
    if (sources.includes('reddit') && searchKeywords.length > 0) {
      const redditResult = await findRedditOpportunities(
        searchKeywords.slice(0, 5),
        subreddits.length > 0 ? subreddits : ['Entrepreneur', 'smallbusiness', 'startups']
      );
      
      if (redditResult.success && redditResult.data) {
        opportunities.push(...redditResult.data);
      } else if (redditResult.error) {
        errors.push(`Reddit: ${redditResult.error}`);
      }
    }

    // Search Hacker News
    if (sources.includes('hackernews') && searchKeywords.length > 0) {
      const hnResult = await findHNOpportunities(searchKeywords.slice(0, 5));
      
      if (hnResult.success && hnResult.data) {
        opportunities.push(...hnResult.data);
      } else if (hnResult.error) {
        errors.push(`HN: ${hnResult.error}`);
      }
    }

    // Search Twitter (if configured)
    if (sources.includes('twitter') && searchKeywords.length > 0) {
      const twitterResult = await searchTwitter(searchKeywords.join(' OR '));
      
      if (twitterResult.success && twitterResult.data) {
        const twitterOpps = twitterResult.data.map((tweet: any) => ({
          id: `twitter_${tweet.id}`,
          source: 'twitter',
          title: tweet.text.slice(0, 100),
          content: tweet.text,
          url: tweet.url,
          relevanceScore: 0.5,
          nicheMatch: searchKeywords.filter(k => 
            tweet.text.toLowerCase().includes(k.toLowerCase())
          ),
          engagement: {
            likes: tweet.metrics?.like_count || 0,
            comments: tweet.metrics?.reply_count || 0,
          },
          createdAt: tweet.createdAt,
        }));
        opportunities.push(...twitterOpps);
      } else if (twitterResult.error) {
        errors.push(`Twitter: ${twitterResult.error}`);
      }
    }

    // Sort by relevance and limit
    opportunities.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const limitedOpportunities = opportunities.slice(0, limit);

    // Generate suggested responses for top opportunities
    const withResponses = limitedOpportunities.slice(0, 5).map(opp => ({
      ...opp,
      suggestedResponse: generateSuggestedResponse(opp, nicheSlug),
    }));

    // Replace top 5 with response-enhanced versions
    limitedOpportunities.splice(0, 5, ...withResponses);

    return NextResponse.json({
      success: true,
      data: {
        opportunities: limitedOpportunities,
        meta: {
          totalFound: opportunities.length,
          returned: limitedOpportunities.length,
          sources: sources,
          keywords: searchKeywords,
          niche: nicheSlug || null,
        },
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Opportunity API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Comprehensive market research
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      keywords,
      niche,
      includeNews = true,
      includeReddit = true,
      includeHN = true,
      includeTwitter = false,
      subreddits,
    } = body;

    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keywords array required' },
        { status: 400 }
      );
    }

    // Get niche-specific subreddits
    let targetSubreddits = subreddits || [];
    if (niche && NICHE_CONFIGS[niche]) {
      targetSubreddits = [...targetSubreddits, ...NICHE_CONFIGS[niche].recommendedSubreddits];
    }

    const result = await comprehensiveMarketResearch(keywords, {
      includeNews,
      includeReddit,
      includeHN,
      includeTwitter,
      subreddits: targetSubreddits,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Add niche recommendations
    const recommendations = niche 
      ? getNicheRecommendations(niche, keywords.join(' '))
      : null;

    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        recommendations,
        actionItems: generateActionItems(result.data?.opportunities || [], niche),
      },
    });
  } catch (error) {
    console.error('Market research error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSuggestedResponse(opportunity: any, niche?: string | null): string {
  const templates = {
    question: [
      `Great question! I've been researching this too. For {{topic}}, I've found that {{approach}} works well. What specific features are most important to you?`,
      `I was just dealing with this! Here's what I've learned: {{insight}}. Have you tried {{suggestion}}?`,
      `This is something a lot of people ask about. The key things to consider are {{factors}}. What's your current setup like?`,
    ],
    discussion: [
      `Interesting perspective! I've seen {{observation}} in my experience. What led you to this conclusion?`,
      `This resonates with me. I've been exploring {{related_topic}} and found some overlap. Would love to hear more about your approach.`,
    ],
    recommendation: [
      `I've been testing a few options for this. {{tool_mention}} has been interesting - {{specific_feature}}. What's your budget/requirements?`,
      `Have you looked into {{alternative}}? I've heard good things, though I'm also comparing other options.`,
    ],
  };

  // Determine post type
  const isQuestion = opportunity.title?.includes('?') || 
                    opportunity.content?.toLowerCase().includes('anyone') ||
                    opportunity.content?.toLowerCase().includes('recommend');

  const templateList = isQuestion ? templates.question : templates.discussion;
  const template = templateList[Math.floor(Math.random() * templateList.length)];

  // Basic placeholder replacement
  let response = template
    .replace('{{topic}}', 'this')
    .replace('{{approach}}', 'starting simple and iterating')
    .replace('{{insight}}', 'the basics matter most')
    .replace('{{suggestion}}', 'breaking it down into smaller steps')
    .replace('{{factors}}', 'ease of use, pricing, and support')
    .replace('{{observation}}', 'similar patterns')
    .replace('{{related_topic}}', 'related approaches')
    .replace('{{tool_mention}}', 'a few different tools')
    .replace('{{specific_feature}}', 'the simplicity is nice')
    .replace('{{alternative}}', 'some alternatives');

  return response;
}

function generateActionItems(opportunities: any[], niche?: string | null): string[] {
  const items: string[] = [];

  // High-relevance opportunities
  const highRelevance = opportunities.filter(o => o.relevanceScore > 0.7);
  if (highRelevance.length > 0) {
    items.push(`🔥 ${highRelevance.length} high-relevance opportunities found - respond within 24 hours`);
  }

  // Question opportunities
  const questions = opportunities.filter(o => 
    o.title?.includes('?') || o.content?.toLowerCase().includes('recommend')
  );
  if (questions.length > 0) {
    items.push(`❓ ${questions.length} questions you can answer - great for establishing expertise`);
  }

  // Low competition
  const lowComp = opportunities.filter(o => 
    (o.engagement?.comments || 0) < 10
  );
  if (lowComp.length > 0) {
    items.push(`🎯 ${lowComp.length} low-competition posts - early engagement = visibility`);
  }

  // Platform-specific
  const redditOpps = opportunities.filter(o => o.source === 'reddit');
  const hnOpps = opportunities.filter(o => o.source === 'hackernews');
  
  if (redditOpps.length > 0) {
    items.push(`📱 ${redditOpps.length} Reddit opportunities - remember: helpful first, promotional never`);
  }
  if (hnOpps.length > 0) {
    items.push(`💻 ${hnOpps.length} Hacker News opportunities - technical depth appreciated`);
  }

  // General advice
  items.push('📝 Review suggested responses and personalize before posting');
  items.push('⏰ Best response time: within 2-6 hours of original post');

  return items;
}
