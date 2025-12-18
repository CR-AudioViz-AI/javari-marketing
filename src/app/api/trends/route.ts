// ============================================================================
// CR AUDIOVIZ AI - TRENDS API
// GET /api/trends - Get market trends from multiple FREE sources
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  getHackerNewsTop, 
  searchHackerNews, 
  getRedditTrends, 
  searchRedditSubreddits,
  getIndustryNews,
  getNewsFromGNews,
  getMarketResearch,
} from '@/lib/free-apis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const industry = searchParams.get('industry');
    const source = searchParams.get('source'); // 'hn', 'reddit', 'news', 'all'
    const limit = parseInt(searchParams.get('limit') || '10');

    // If no specific request, return general tech trends
    if (!industry && !source) {
      const hnTop = await getHackerNewsTop(5);
      
      return NextResponse.json({
        success: true,
        trends: {
          hackerNews: hnTop,
        },
        message: 'Use ?industry=<industry> for industry-specific trends',
      });
    }

    // Fetch from specific source
    if (source && source !== 'all') {
      let data;
      
      switch (source) {
        case 'hn':
          data = industry 
            ? await searchHackerNews(industry, limit)
            : await getHackerNewsTop(limit);
          return NextResponse.json({
            success: true,
            source: 'Hacker News',
            data,
            count: data.length,
          });
          
        case 'reddit':
          if (industry) {
            // Search for relevant subreddits
            const subreddits = await searchRedditSubreddits(industry);
            const redditData = subreddits.length > 0 
              ? await getRedditTrends(subreddits[0], limit)
              : null;
            return NextResponse.json({
              success: true,
              source: 'Reddit',
              subreddits,
              data: redditData,
            });
          }
          return NextResponse.json({
            success: false,
            error: 'Industry or subreddit required for Reddit trends',
          });
          
        case 'news':
          if (!industry) {
            return NextResponse.json({
              success: false,
              error: 'Industry required for news trends',
            });
          }
          // Try NewsAPI first, fallback to GNews
          let newsData = await getIndustryNews(industry, limit);
          if (newsData.length === 0) {
            newsData = await getNewsFromGNews(industry, limit);
          }
          return NextResponse.json({
            success: true,
            source: 'News',
            data: newsData,
            count: newsData.length,
          });
          
        default:
          return NextResponse.json({
            success: false,
            error: 'Invalid source. Use: hn, reddit, news, or all',
          });
      }
    }

    // Full market research for industry
    if (industry) {
      const research = await getMarketResearch(industry);
      
      return NextResponse.json({
        success: true,
        industry,
        research,
        sources: ['Hacker News', 'Reddit', 'News APIs'],
        disclaimer: 'Trends are aggregated from public sources and may not be comprehensive.',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Please specify industry or source parameter',
    });
  } catch (error) {
    console.error('[Trends API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

// POST /api/trends - Save trend report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, userId, saveReport } = body;

    if (!industry) {
      return NextResponse.json(
        { error: 'industry is required' },
        { status: 400 }
      );
    }

    // Generate comprehensive trend report
    const [hnData, newsData, subreddits] = await Promise.all([
      searchHackerNews(industry, 10),
      getIndustryNews(industry, 10),
      searchRedditSubreddits(industry),
    ]);

    // Get Reddit data from first relevant subreddit
    let redditData = null;
    if (subreddits.length > 0) {
      redditData = await getRedditTrends(subreddits[0], 10);
    }

    const report = {
      id: `trend_${Date.now()}`,
      industry,
      generatedAt: new Date().toISOString(),
      sections: [
        {
          title: 'Tech Community Buzz',
          source: 'Hacker News',
          items: hnData.slice(0, 5).map(h => ({
            title: h.title,
            url: h.hnUrl,
            engagement: `${h.score} points, ${h.descendants} comments`,
          })),
        },
        {
          title: 'Latest News',
          source: 'News APIs',
          items: newsData.slice(0, 5).map(n => ({
            title: n.title,
            url: n.url,
            source: n.source,
          })),
        },
        {
          title: 'Community Discussions',
          source: 'Reddit',
          subreddits,
          items: redditData?.topPosts?.slice(0, 5).map(p => ({
            title: p.title,
            url: p.url,
            engagement: `${p.score} upvotes, ${p.numComments} comments`,
          })) || [],
        },
      ],
      insights: generateInsights(hnData, newsData, redditData),
    };

    // Log report generation
    console.log('[Trends API] Report generated:', {
      industry,
      userId: userId || 'anonymous',
      timestamp: report.generatedAt,
    });

    return NextResponse.json({
      success: true,
      report,
      saved: saveReport ? true : false,
    });
  } catch (error) {
    console.error('[Trends API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate trend report' },
      { status: 500 }
    );
  }
}

// Generate insights from trend data
function generateInsights(
  hnData: any[],
  newsData: any[],
  redditData: any
): string[] {
  const insights: string[] = [];

  // Analyze HN engagement
  if (hnData.length > 0) {
    const avgScore = hnData.reduce((sum, h) => sum + (h.score || 0), 0) / hnData.length;
    if (avgScore > 100) {
      insights.push('High engagement on tech community discussions');
    }
  }

  // Analyze news volume
  if (newsData.length >= 5) {
    insights.push('Active news coverage indicates growing market interest');
  }

  // Analyze Reddit engagement
  if (redditData?.topPosts?.length > 0) {
    const avgUpvotes = redditData.topPosts.reduce((sum: number, p: any) => sum + p.score, 0) / redditData.topPosts.length;
    if (avgUpvotes > 50) {
      insights.push('Strong community engagement on Reddit');
    }
  }

  // Common keywords analysis
  const allTitles = [
    ...hnData.map(h => h.title),
    ...newsData.map(n => n.title),
    ...(redditData?.topPosts?.map((p: any) => p.title) || []),
  ].join(' ').toLowerCase();

  if (allTitles.includes('ai') || allTitles.includes('artificial intelligence')) {
    insights.push('AI is a trending topic in this industry');
  }
  if (allTitles.includes('startup') || allTitles.includes('funding')) {
    insights.push('Active startup and investment activity');
  }
  if (allTitles.includes('growth') || allTitles.includes('scale')) {
    insights.push('Growth and scaling are key themes');
  }

  if (insights.length === 0) {
    insights.push('Review the trend data above for industry-specific insights');
  }

  return insights;
}
