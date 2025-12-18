// ============================================================================
// CR AUDIOVIZ AI - FREE API INTEGRATIONS
// Census, Reddit, Hacker News, News API - All FREE to use
// ============================================================================

// ============================================================================
// US CENSUS API (FREE - No key required for basic access)
// ============================================================================

export interface CensusData {
  zipCode: string;
  population: number;
  medianAge: number;
  medianIncome: number;
  householdSize: number;
  educationBachelorsOrHigher: number;
  employmentRate: number;
  homeOwnershipRate: number;
  marketingInsights: string[];
}

export async function getCensusDataByZip(zipCode: string): Promise<CensusData | null> {
  try {
    // US Census API - American Community Survey 5-Year Data
    // Variables: B01003_001E (population), B01002_001E (median age), 
    // B19013_001E (median household income), B25010_001E (avg household size)
    const variables = 'B01003_001E,B01002_001E,B19013_001E,B25010_001E,B15003_022E,B23025_004E,B25003_002E';
    
    const response = await fetch(
      `https://api.census.gov/data/2022/acs/acs5?get=${variables}&for=zip%20code%20tabulation%20area:${zipCode}`
    );

    if (!response.ok) {
      console.error('Census API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data || data.length < 2) {
      return null;
    }

    const values = data[1];
    const population = parseInt(values[0]) || 0;
    const medianAge = parseFloat(values[1]) || 0;
    const medianIncome = parseInt(values[2]) || 0;
    const householdSize = parseFloat(values[3]) || 0;
    const bachelorsPlus = parseInt(values[4]) || 0;
    const employed = parseInt(values[5]) || 0;
    const homeOwners = parseInt(values[6]) || 0;

    // Generate marketing insights based on demographics
    const insights: string[] = [];
    
    if (medianIncome > 75000) {
      insights.push('Higher income area - premium products/services may perform well');
    } else if (medianIncome < 40000) {
      insights.push('Value-conscious market - emphasize affordability and deals');
    }

    if (medianAge > 45) {
      insights.push('Older demographic - Facebook/email marketing recommended over TikTok');
    } else if (medianAge < 30) {
      insights.push('Younger demographic - Instagram/TikTok/YouTube Shorts recommended');
    }

    if (householdSize > 3) {
      insights.push('Family-oriented area - family packages and kid-friendly messaging');
    }

    return {
      zipCode,
      population,
      medianAge,
      medianIncome,
      householdSize,
      educationBachelorsOrHigher: population > 0 ? (bachelorsPlus / population) * 100 : 0,
      employmentRate: population > 0 ? (employed / population) * 100 : 0,
      homeOwnershipRate: population > 0 ? (homeOwners / population) * 100 : 0,
      marketingInsights: insights,
    };
  } catch (error) {
    console.error('Census API error:', error);
    return null;
  }
}

// ============================================================================
// REDDIT API (FREE - Public endpoints, no auth for read-only)
// ============================================================================

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  created: Date;
  selftext?: string;
}

export interface RedditTrend {
  topic: string;
  subreddits: string[];
  totalEngagement: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  posts: RedditPost[];
}

export async function searchReddit(
  query: string,
  options: { limit?: number; sort?: 'relevance' | 'hot' | 'new' | 'top'; time?: 'day' | 'week' | 'month' | 'year' } = {}
): Promise<RedditPost[]> {
  const { limit = 10, sort = 'relevance', time = 'week' } = options;

  try {
    const response = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${time}&limit=${limit}`,
      {
        headers: {
          'User-Agent': 'CRAudioVizAI/1.0 (Marketing Research Bot)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.data.children.map((child: Record<string, unknown>) => {
      const post = child.data as Record<string, unknown>;
      return {
        id: post.id as string,
        title: post.title as string,
        subreddit: post.subreddit as string,
        score: post.score as number,
        numComments: post.num_comments as number,
        url: `https://reddit.com${post.permalink}`,
        created: new Date((post.created_utc as number) * 1000),
        selftext: post.selftext as string | undefined,
      };
    });
  } catch (error) {
    console.error('Reddit API error:', error);
    return [];
  }
}

export async function getSubredditPosts(
  subreddit: string,
  options: { limit?: number; sort?: 'hot' | 'new' | 'top' } = {}
): Promise<RedditPost[]> {
  const { limit = 10, sort = 'hot' } = options;

  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': 'CRAudioVizAI/1.0 (Marketing Research Bot)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.data.children.map((child: Record<string, unknown>) => {
      const post = child.data as Record<string, unknown>;
      return {
        id: post.id as string,
        title: post.title as string,
        subreddit: post.subreddit as string,
        score: post.score as number,
        numComments: post.num_comments as number,
        url: `https://reddit.com${post.permalink}`,
        created: new Date((post.created_utc as number) * 1000),
        selftext: post.selftext as string | undefined,
      };
    });
  } catch (error) {
    console.error('Reddit API error:', error);
    return [];
  }
}

// ============================================================================
// HACKER NEWS API (FREE - No auth required)
// ============================================================================

export interface HackerNewsStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: Date;
  descendants: number;
  type: 'story' | 'job' | 'poll';
}

export async function getHackerNewsTopStories(limit: number = 10): Promise<HackerNewsStory[]> {
  try {
    // Get top story IDs
    const topStoriesResponse = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json'
    );
    const storyIds: number[] = await topStoriesResponse.json();

    // Fetch story details for top N stories
    const stories = await Promise.all(
      storyIds.slice(0, limit).map(async (id) => {
        const response = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return response.json();
      })
    );

    return stories.map((story) => ({
      id: story.id,
      title: story.title,
      url: story.url,
      score: story.score,
      by: story.by,
      time: new Date(story.time * 1000),
      descendants: story.descendants || 0,
      type: story.type,
    }));
  } catch (error) {
    console.error('Hacker News API error:', error);
    return [];
  }
}

export async function searchHackerNews(query: string, limit: number = 10): Promise<HackerNewsStory[]> {
  try {
    // Use Algolia's HN Search API (free)
    const response = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HN Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.hits.map((hit: Record<string, unknown>) => ({
      id: parseInt(hit.objectID as string),
      title: hit.title as string,
      url: hit.url as string | undefined,
      score: hit.points as number,
      by: hit.author as string,
      time: new Date(hit.created_at as string),
      descendants: hit.num_comments as number,
      type: 'story' as const,
    }));
  } catch (error) {
    console.error('HN Search API error:', error);
    return [];
  }
}

// ============================================================================
// NEWS API (FREE tier - 100 requests/day)
// ============================================================================

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
}

export async function getNewsHeadlines(
  category?: 'business' | 'technology' | 'science' | 'health' | 'entertainment',
  country: string = 'us'
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.warn('NewsAPI key not configured');
    return [];
  }

  try {
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`;
    if (category) {
      url += `&category=${category}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.articles.map((article: Record<string, unknown>) => ({
      title: article.title as string,
      description: article.description as string,
      url: article.url as string,
      source: (article.source as Record<string, unknown>)?.name as string,
      publishedAt: new Date(article.publishedAt as string),
      imageUrl: article.urlToImage as string | undefined,
    }));
  } catch (error) {
    console.error('NewsAPI error:', error);
    return [];
  }
}

export async function searchNews(
  query: string,
  options: { from?: Date; to?: Date; sortBy?: 'relevancy' | 'popularity' | 'publishedAt' } = {}
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.warn('NewsAPI key not configured');
    return [];
  }

  const { sortBy = 'relevancy' } = options;

  try {
    let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&apiKey=${apiKey}`;
    
    if (options.from) {
      url += `&from=${options.from.toISOString().split('T')[0]}`;
    }
    if (options.to) {
      url += `&to=${options.to.toISOString().split('T')[0]}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.articles.slice(0, 20).map((article: Record<string, unknown>) => ({
      title: article.title as string,
      description: article.description as string,
      url: article.url as string,
      source: (article.source as Record<string, unknown>)?.name as string,
      publishedAt: new Date(article.publishedAt as string),
      imageUrl: article.urlToImage as string | undefined,
    }));
  } catch (error) {
    console.error('NewsAPI error:', error);
    return [];
  }
}

// ============================================================================
// GNEWS API (BACKUP - 100 requests/day free)
// ============================================================================

export async function getGNewsHeadlines(
  topic?: 'business' | 'technology' | 'science' | 'health' | 'entertainment',
  country: string = 'us'
): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('GNews API key not configured');
    return [];
  }

  try {
    let url = `https://gnews.io/api/v4/top-headlines?country=${country}&token=${apiKey}`;
    if (topic) {
      url += `&topic=${topic}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.articles.map((article: Record<string, unknown>) => ({
      title: article.title as string,
      description: article.description as string,
      url: article.url as string,
      source: (article.source as Record<string, unknown>)?.name as string,
      publishedAt: new Date(article.publishedAt as string),
      imageUrl: article.image as string | undefined,
    }));
  } catch (error) {
    console.error('GNews API error:', error);
    return [];
  }
}

// ============================================================================
// COMBINED MARKET RESEARCH
// ============================================================================

export interface MarketResearch {
  query: string;
  timestamp: Date;
  reddit: {
    posts: RedditPost[];
    topSubreddits: string[];
    averageEngagement: number;
  };
  hackerNews: {
    stories: HackerNewsStory[];
    averageScore: number;
  };
  news: {
    articles: NewsArticle[];
    topSources: string[];
  };
  insights: string[];
}

export async function conductMarketResearch(query: string): Promise<MarketResearch> {
  // Run all API calls in parallel
  const [redditPosts, hnStories, newsArticles] = await Promise.all([
    searchReddit(query, { limit: 15, sort: 'top', time: 'month' }),
    searchHackerNews(query, 10),
    searchNews(query, { sortBy: 'relevancy' }),
  ]);

  // Analyze Reddit data
  const subredditCounts: Record<string, number> = {};
  redditPosts.forEach((post) => {
    subredditCounts[post.subreddit] = (subredditCounts[post.subreddit] || 0) + 1;
  });
  const topSubreddits = Object.entries(subredditCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sub]) => sub);

  const redditAvgEngagement =
    redditPosts.length > 0
      ? redditPosts.reduce((sum, p) => sum + p.score + p.numComments, 0) / redditPosts.length
      : 0;

  // Analyze HN data
  const hnAvgScore =
    hnStories.length > 0
      ? hnStories.reduce((sum, s) => sum + s.score, 0) / hnStories.length
      : 0;

  // Analyze news data
  const sourceCounts: Record<string, number> = {};
  newsArticles.forEach((article) => {
    sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
  });
  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source]) => source);

  // Generate insights
  const insights: string[] = [];
  
  if (redditPosts.length > 10) {
    insights.push(`High Reddit activity (${redditPosts.length} posts) - consider Reddit marketing`);
  }
  if (topSubreddits.length > 0) {
    insights.push(`Target subreddits: r/${topSubreddits.slice(0, 3).join(', r/')}`);
  }
  if (hnAvgScore > 100) {
    insights.push('Strong Hacker News interest - tech-savvy audience engaged');
  }
  if (newsArticles.length > 5) {
    insights.push('Active news coverage - PR opportunities available');
  }

  return {
    query,
    timestamp: new Date(),
    reddit: {
      posts: redditPosts,
      topSubreddits,
      averageEngagement: Math.round(redditAvgEngagement),
    },
    hackerNews: {
      stories: hnStories,
      averageScore: Math.round(hnAvgScore),
    },
    news: {
      articles: newsArticles,
      topSources,
    },
    insights,
  };
}

// ============================================================================
// LAUNCH SITES DATABASE (All FREE to submit)
// ============================================================================

export interface LaunchSite {
  name: string;
  url: string;
  description: string;
  audience: string;
  submissionTips: string[];
  bestFor: string[];
  estimatedReach: string;
  timing: string;
}

export const LAUNCH_SITES: LaunchSite[] = [
  {
    name: 'Product Hunt',
    url: 'https://producthunt.com',
    description: 'The #1 place for product launches',
    audience: 'Tech enthusiasts, early adopters, investors',
    submissionTips: [
      'Launch on Tuesday-Thursday at 12:01 AM PST',
      'Prepare a compelling tagline and description',
      'Have your team ready to engage in comments',
      'Create a "maker" video or GIF',
      'Build relationships with hunters before launch',
    ],
    bestFor: ['SaaS', 'Apps', 'Dev tools', 'AI products'],
    estimatedReach: '10K-100K+ views',
    timing: 'Plan 2-4 weeks ahead',
  },
  {
    name: 'Hacker News (Show HN)',
    url: 'https://news.ycombinator.com',
    description: 'Tech community for makers and hackers',
    audience: 'Developers, founders, tech workers',
    submissionTips: [
      'Use "Show HN:" prefix for launches',
      'Post between 9 AM - 12 PM EST for best visibility',
      'Be authentic - HN values substance over marketing',
      'Engage thoughtfully with every comment',
      'Share your story and technical details',
    ],
    bestFor: ['Developer tools', 'Open source', 'Technical products'],
    estimatedReach: '5K-50K views',
    timing: 'Any time, but timing affects visibility',
  },
  {
    name: 'Reddit',
    url: 'https://reddit.com',
    description: 'Community-based discussions',
    audience: 'Varies by subreddit - highly targeted',
    submissionTips: [
      'Find relevant subreddits (r/SideProject, r/startups, etc.)',
      'Read and follow subreddit rules carefully',
      'Be a community member first, marketer second',
      'Offer genuine value, not just promotion',
      'Consider Reddit Ads for broader reach',
    ],
    bestFor: ['Any niche product', 'Community-focused products'],
    estimatedReach: 'Varies by subreddit',
    timing: 'Build karma before promoting',
  },
  {
    name: 'BetaList',
    url: 'https://betalist.com',
    description: 'Discover and launch new startups',
    audience: 'Early adopters, startup enthusiasts',
    submissionTips: [
      'Submit early - even before full launch',
      'Use compelling screenshots and visuals',
      'Offer exclusive beta access or discount',
      'Respond to all feedback quickly',
    ],
    bestFor: ['Pre-launch products', 'Beta versions', 'Startups'],
    estimatedReach: '2K-10K views',
    timing: 'Submit 1-2 weeks before desired feature date',
  },
  {
    name: 'Indie Hackers',
    url: 'https://indiehackers.com',
    description: 'Community for bootstrapped founders',
    audience: 'Indie founders, solopreneurs, makers',
    submissionTips: [
      'Share your revenue and growth transparently',
      'Post detailed milestone updates',
      'Engage in discussions and help others',
      'Create a product page with full details',
    ],
    bestFor: ['Bootstrapped products', 'SaaS', 'Indie apps'],
    estimatedReach: '5K-20K views',
    timing: 'Ongoing community participation',
  },
  {
    name: 'Launching Next',
    url: 'https://launchingnext.com',
    description: 'Startup launch directory',
    audience: 'Startup watchers, early adopters',
    submissionTips: [
      'Submit free listing',
      'Include clear value proposition',
      'Add quality screenshots',
    ],
    bestFor: ['Web apps', 'Mobile apps', 'SaaS'],
    estimatedReach: '1K-5K views',
    timing: 'Submit anytime',
  },
  {
    name: 'AlternativeTo',
    url: 'https://alternativeto.net',
    description: 'Directory of software alternatives',
    audience: 'People looking for alternatives to popular software',
    submissionTips: [
      'Position as alternative to known competitors',
      'List all relevant alternatives',
      'Highlight unique differentiators',
    ],
    bestFor: ['Software with known competitors', 'Tools'],
    estimatedReach: 'Long-term SEO traffic',
    timing: 'Submit anytime',
  },
  {
    name: 'SaaSHub',
    url: 'https://saashub.com',
    description: 'SaaS discovery platform',
    audience: 'Business users looking for software',
    submissionTips: [
      'Complete all profile sections',
      'Add pricing information',
      'Include comparison with alternatives',
    ],
    bestFor: ['SaaS products', 'Business tools'],
    estimatedReach: '2K-10K views',
    timing: 'Submit anytime',
  },
  {
    name: 'Twitter/X',
    url: 'https://twitter.com',
    description: 'Real-time social platform',
    audience: 'Tech community, journalists, influencers',
    submissionTips: [
      'Build audience before launch',
      'Create a launch thread with visuals',
      'Tag relevant accounts and use hashtags',
      'Engage with every reply',
    ],
    bestFor: ['Any product', 'Building in public'],
    estimatedReach: 'Depends on following',
    timing: 'Build audience weeks/months before',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    description: 'Professional networking platform',
    audience: 'Professionals, B2B decision makers',
    submissionTips: [
      'Share your founder story',
      'Post about the problem you\'re solving',
      'Ask your network to engage',
      'Use native video for higher reach',
    ],
    bestFor: ['B2B products', 'Professional tools', 'Enterprise'],
    estimatedReach: 'Depends on network',
    timing: 'Build connections before launch',
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to',
    description: 'Developer community platform',
    audience: 'Developers, technical users',
    submissionTips: [
      'Write technical content about your product',
      'Share code snippets and tutorials',
      'Engage with the community',
    ],
    bestFor: ['Developer tools', 'APIs', 'Technical products'],
    estimatedReach: '5K-50K views',
    timing: 'Build presence before promotion',
  },
  {
    name: 'Crunchbase',
    url: 'https://crunchbase.com',
    description: 'Business information platform',
    audience: 'Investors, journalists, researchers',
    submissionTips: [
      'Claim your free profile',
      'Keep information updated',
      'Add funding and team details',
    ],
    bestFor: ['Startups seeking visibility', 'Funded companies'],
    estimatedReach: 'Long-term visibility',
    timing: 'Set up early',
  },
  {
    name: 'G2',
    url: 'https://g2.com',
    description: 'Business software reviews',
    audience: 'Business software buyers',
    submissionTips: [
      'Claim your profile',
      'Actively collect reviews from customers',
      'Respond to all reviews',
    ],
    bestFor: ['B2B software', 'SaaS'],
    estimatedReach: 'Ongoing buyer traffic',
    timing: 'Set up when you have customers',
  },
  {
    name: 'Capterra',
    url: 'https://capterra.com',
    description: 'Software comparison platform',
    audience: 'Business software buyers',
    submissionTips: [
      'Free basic listing available',
      'Collect and display reviews',
      'Complete all profile sections',
    ],
    bestFor: ['Business software', 'SaaS'],
    estimatedReach: 'Ongoing buyer traffic',
    timing: 'Set up when you have customers',
  },
  {
    name: 'Startup Stash',
    url: 'https://startupstash.com',
    description: 'Curated directory of startup resources',
    audience: 'Startup founders, entrepreneurs',
    submissionTips: [
      'Submit free listing',
      'Categorize correctly',
      'Include clear description',
    ],
    bestFor: ['Startup tools', 'Resources', 'SaaS'],
    estimatedReach: '1K-5K views',
    timing: 'Submit anytime',
  },
];

export function getLaunchSitesForCategory(category: string): LaunchSite[] {
  const categoryMapping: Record<string, string[]> = {
    saas: ['SaaS', 'Web apps', 'Software'],
    devtools: ['Developer tools', 'APIs', 'Technical products'],
    mobile: ['Mobile apps', 'Apps'],
    b2b: ['B2B products', 'Business tools', 'Enterprise'],
    consumer: ['Consumer products', 'Any product'],
  };

  const keywords = categoryMapping[category] || ['Any product'];
  
  return LAUNCH_SITES.filter((site) =>
    site.bestFor.some((bf) =>
      keywords.some((kw) => bf.toLowerCase().includes(kw.toLowerCase()))
    )
  );
}
