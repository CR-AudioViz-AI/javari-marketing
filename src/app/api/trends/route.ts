// ============================================================================
// CR AUDIOVIZ AI - MARKET TRENDS API
// GET /api/trends - Get market research from Reddit, HN, and News
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  searchReddit,
  searchHackerNews,
  searchNews,
  getHackerNewsTopStories,
  getNewsHeadlines,
  conductMarketResearch,
  type RedditPost,
  type HackerNewsStory,
  type NewsArticle,
} from '@/lib/free-apis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const source = searchParams.get('source'); // reddit, hackernews, news, all
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '10');

  // If no query, return trending topics
  if (!query) {
    try {
      const [hnTop, newsHeadlines] = await Promise.all([
        getHackerNewsTopStories(10),
        getNewsHeadlines(category as 'business' | 'technology' | undefined),
      ]);

      return NextResponse.json({
        success: true,
        trending: {
          hackerNews: hnTop.map((s) => ({
            title: s.title,
            score: s.score,
            url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
            comments: s.descendants,
          })),
          news: newsHeadlines.slice(0, 10).map((a) => ({
            title: a.title,
            source: a.source,
            url: a.url,
            publishedAt: a.publishedAt,
          })),
        },
        meta: {
          category,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Trending fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch trending topics' },
        { status: 500 }
      );
    }
  }

  // Search specific source
  if (source && source !== 'all') {
    try {
      let results: RedditPost[] | HackerNewsStory[] | NewsArticle[] = [];

      switch (source) {
        case 'reddit':
          results = await searchReddit(query, { limit, sort: 'top', time: 'month' });
          break;
        case 'hackernews':
          results = await searchHackerNews(query, limit);
          break;
        case 'news':
          results = await searchNews(query, { sortBy: 'relevancy' });
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid source. Use: reddit, hackernews, news, or all' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        source,
        results,
        count: results.length,
        meta: {
          query,
          limit,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(`${source} search error:`, error);
      return NextResponse.json(
        { success: false, error: `Failed to search ${source}` },
        { status: 500 }
      );
    }
  }

  // Comprehensive market research (all sources)
  try {
    const research = await conductMarketResearch(query);

    return NextResponse.json({
      success: true,
      research: {
        query: research.query,
        reddit: {
          posts: research.reddit.posts.slice(0, limit),
          topSubreddits: research.reddit.topSubreddits,
          avgEngagement: research.reddit.averageEngagement,
        },
        hackerNews: {
          stories: research.hackerNews.stories.slice(0, limit),
          avgScore: research.hackerNews.averageScore,
        },
        news: {
          articles: research.news.articles.slice(0, limit),
          topSources: research.news.topSources,
        },
        insights: research.insights,
      },
      meta: {
        query,
        sourcesQueried: ['reddit', 'hackernews', 'news'],
        timestamp: research.timestamp.toISOString(),
      },
    });
  } catch (error) {
    console.error('Market research error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to conduct market research' },
      { status: 500 }
    );
  }
}

// POST endpoint for detailed research request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, competitors, industry, timeframe } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Main query research
    const mainResearch = await conductMarketResearch(query);

    // Competitor research (if provided)
    let competitorResearch: Record<string, Awaited<ReturnType<typeof conductMarketResearch>>> = {};
    if (competitors && competitors.length > 0) {
      const competitorResults = await Promise.all(
        competitors.slice(0, 3).map(async (comp: string) => ({
          name: comp,
          research: await conductMarketResearch(comp),
        }))
      );
      
      competitorResearch = Object.fromEntries(
        competitorResults.map((r) => [r.name, r.research])
      );
    }

    // Generate comparative insights
    const insights: string[] = [...mainResearch.insights];

    if (Object.keys(competitorResearch).length > 0) {
      const yourEngagement = mainResearch.reddit.averageEngagement;
      for (const [comp, research] of Object.entries(competitorResearch)) {
        const compEngagement = research.reddit.averageEngagement;
        if (compEngagement > yourEngagement) {
          insights.push(`${comp} has ${Math.round((compEngagement / yourEngagement - 1) * 100)}% more Reddit engagement than your topic`);
        } else {
          insights.push(`Your topic has ${Math.round((yourEngagement / compEngagement - 1) * 100)}% more Reddit engagement than ${comp}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      mainTopic: {
        query,
        ...mainResearch,
      },
      competitors: competitorResearch,
      comparativeInsights: insights,
      recommendations: generateRecommendations(mainResearch, industry),
      meta: {
        query,
        competitorsAnalyzed: Object.keys(competitorResearch).length,
        timeframe: timeframe || '30 days',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Detailed research error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to conduct detailed research' },
      { status: 500 }
    );
  }
}

// Generate actionable recommendations
function generateRecommendations(
  research: Awaited<ReturnType<typeof conductMarketResearch>>,
  industry?: string
): string[] {
  const recommendations: string[] = [];

  // Reddit recommendations
  if (research.reddit.posts.length > 5) {
    recommendations.push(
      `High Reddit activity detected. Consider posting in: ${research.reddit.topSubreddits.slice(0, 3).map((s) => `r/${s}`).join(', ')}`
    );
  }

  if (research.reddit.averageEngagement > 100) {
    recommendations.push(
      'Strong Reddit engagement - community marketing should be a priority'
    );
  }

  // Hacker News recommendations
  if (research.hackerNews.averageScore > 50) {
    recommendations.push(
      'Hacker News interest is high - consider a "Show HN" launch'
    );
  }

  // News recommendations
  if (research.news.articles.length > 5) {
    recommendations.push(
      `Active press coverage from: ${research.news.topSources.slice(0, 3).join(', ')} - PR outreach recommended`
    );
  }

  // Industry-specific recommendations
  if (industry === 'saas' || industry === 'software') {
    recommendations.push(
      'For SaaS: Focus on Product Hunt, Hacker News, and developer communities'
    );
  }

  if (industry === 'ecommerce') {
    recommendations.push(
      'For E-commerce: Focus on Reddit shopping communities and influencer partnerships'
    );
  }

  // Default recommendations
  if (recommendations.length < 3) {
    recommendations.push(
      'Build presence on Reddit before promotional posts',
      'Create valuable content that solves user problems',
      'Engage authentically - avoid hard selling'
    );
  }

  return recommendations;
}
