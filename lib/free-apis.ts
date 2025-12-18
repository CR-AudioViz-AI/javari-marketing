// ============================================================================
// CR AUDIOVIZ AI - FREE API INTEGRATIONS
// Census, Reddit, Hacker News, Google Trends, News API
// ============================================================================

// ============================================================================
// US CENSUS API - Demographics by ZIP Code (FREE)
// ============================================================================

export interface CensusData {
  zipCode: string;
  population: number;
  medianAge: number;
  medianIncome: number;
  educationBachelorOrHigher: number;
  households: number;
  homeownershipRate: number;
  employmentRate: number;
  topIndustries: string[];
}

export async function getCensusData(zipCode: string): Promise<CensusData | null> {
  const apiKey = process.env.CENSUS_API_KEY || 'YOUR_CENSUS_KEY'; // Census API is free, just needs registration
  
  try {
    // Get ZIP code tabulation area data
    const baseUrl = 'https://api.census.gov/data/2022/acs/acs5';
    
    // Variables: B01003_001E (population), B01002_001E (median age), B19013_001E (median income)
    // B15003_022E + B15003_023E + B15003_024E + B15003_025E (bachelor's+)
    const variables = [
      'B01003_001E', // Total population
      'B01002_001E', // Median age
      'B19013_001E', // Median household income
      'B15003_022E', // Bachelor's degree
      'B15003_023E', // Master's degree
      'B15003_024E', // Professional degree
      'B15003_025E', // Doctorate
      'B11001_001E', // Total households
      'B25003_002E', // Owner-occupied housing units
      'B25003_001E', // Total occupied housing units
      'B23025_004E', // Employed civilians
      'B23025_003E', // In labor force
    ].join(',');

    const response = await fetch(
      `${baseUrl}?get=${variables}&for=zip%20code%20tabulation%20area:${zipCode}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error('[Census API] Error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data || data.length < 2) {
      return null;
    }

    const values = data[1];
    
    // Parse values (Census returns strings)
    const population = parseInt(values[0]) || 0;
    const medianAge = parseFloat(values[1]) || 0;
    const medianIncome = parseInt(values[2]) || 0;
    const bachelors = parseInt(values[3]) || 0;
    const masters = parseInt(values[4]) || 0;
    const professional = parseInt(values[5]) || 0;
    const doctorate = parseInt(values[6]) || 0;
    const households = parseInt(values[7]) || 0;
    const ownerOccupied = parseInt(values[8]) || 0;
    const totalOccupied = parseInt(values[9]) || 1;
    const employed = parseInt(values[10]) || 0;
    const laborForce = parseInt(values[11]) || 1;

    const educationPct = population > 0 
      ? ((bachelors + masters + professional + doctorate) / population) * 100 
      : 0;

    return {
      zipCode,
      population,
      medianAge,
      medianIncome,
      educationBachelorOrHigher: Math.round(educationPct * 10) / 10,
      households,
      homeownershipRate: Math.round((ownerOccupied / totalOccupied) * 100 * 10) / 10,
      employmentRate: Math.round((employed / laborForce) * 100 * 10) / 10,
      topIndustries: inferIndustriesFromIncome(medianIncome, educationPct),
    };
  } catch (error) {
    console.error('[Census API] Error:', error);
    return null;
  }
}

function inferIndustriesFromIncome(income: number, educationPct: number): string[] {
  if (income > 100000 && educationPct > 40) {
    return ['Technology', 'Healthcare', 'Finance', 'Professional Services'];
  } else if (income > 75000) {
    return ['Healthcare', 'Education', 'Manufacturing', 'Retail'];
  } else if (income > 50000) {
    return ['Retail', 'Healthcare', 'Construction', 'Transportation'];
  } else {
    return ['Retail', 'Food Service', 'Agriculture', 'Manufacturing'];
  }
}

// ============================================================================
// REDDIT API - Community Insights (FREE - No Auth Required for Public Data)
// ============================================================================

export interface RedditPost {
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  created: Date;
}

export interface RedditTrends {
  subreddit: string;
  topPosts: RedditPost[];
  subscriberCount?: number;
}

export async function getRedditTrends(subreddit: string, limit = 10): Promise<RedditTrends | null> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': 'CRAudioVizAI/1.0 (Marketing Research Tool)',
        },
      }
    );

    if (!response.ok) {
      console.error('[Reddit API] Error:', response.status);
      return null;
    }

    const data = await response.json();
    
    const posts: RedditPost[] = data.data.children.map((child: any) => ({
      title: child.data.title,
      subreddit: child.data.subreddit,
      score: child.data.score,
      numComments: child.data.num_comments,
      url: `https://reddit.com${child.data.permalink}`,
      created: new Date(child.data.created_utc * 1000),
    }));

    return {
      subreddit,
      topPosts: posts,
    };
  } catch (error) {
    console.error('[Reddit API] Error:', error);
    return null;
  }
}

// Search Reddit for marketing-relevant subreddits
export async function searchRedditSubreddits(query: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          'User-Agent': 'CRAudioVizAI/1.0 (Marketing Research Tool)',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.data.children.map((child: any) => child.data.display_name);
  } catch {
    return [];
  }
}

// ============================================================================
// HACKER NEWS API - Tech Community Insights (FREE)
// ============================================================================

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: Date;
  descendants: number;
  hnUrl: string;
}

export async function getHackerNewsTop(limit = 20): Promise<HNStory[]> {
  try {
    // Get top story IDs
    const idsResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids: number[] = await idsResponse.json();
    
    // Fetch details for top stories
    const storyPromises = ids.slice(0, limit).map(async (id) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return storyResponse.json();
    });

    const stories = await Promise.all(storyPromises);
    
    return stories
      .filter((s): s is any => s && s.title)
      .map((s) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        score: s.score || 0,
        by: s.by,
        time: new Date(s.time * 1000),
        descendants: s.descendants || 0,
        hnUrl: `https://news.ycombinator.com/item?id=${s.id}`,
      }));
  } catch (error) {
    console.error('[HN API] Error:', error);
    return [];
  }
}

// Search HN for relevant tech discussions
export async function searchHackerNews(query: string, limit = 10): Promise<HNStory[]> {
  try {
    const response = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`
    );
    
    if (!response.ok) return [];

    const data = await response.json();
    
    return data.hits.map((hit: any) => ({
      id: parseInt(hit.objectID),
      title: hit.title,
      url: hit.url,
      score: hit.points || 0,
      by: hit.author,
      time: new Date(hit.created_at),
      descendants: hit.num_comments || 0,
      hnUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    }));
  } catch {
    return [];
  }
}

// ============================================================================
// NEWS API - Current Events (FREE tier: 100 req/day)
// ============================================================================

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
}

export async function getIndustryNews(industry: string, limit = 10): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  
  if (!apiKey) {
    console.log('[NewsAPI] No API key configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(industry)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`
    );

    if (!response.ok) {
      console.error('[NewsAPI] Error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return (data.articles || []).map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source?.name || 'Unknown',
      publishedAt: new Date(article.publishedAt),
      imageUrl: article.urlToImage,
    }));
  } catch (error) {
    console.error('[NewsAPI] Error:', error);
    return [];
  }
}

// ============================================================================
// GNEWS API - Backup News Source (FREE: 100 req/day)
// ============================================================================

export async function getNewsFromGNews(query: string, limit = 10): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${limit}&apikey=${apiKey}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    
    return (data.articles || []).map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source?.name || 'Unknown',
      publishedAt: new Date(article.publishedAt),
      imageUrl: article.image,
    }));
  } catch {
    return [];
  }
}

// ============================================================================
// LAUNCH SITE CHECKLIST - Curated FREE Launch Platforms
// ============================================================================

export interface LaunchSite {
  name: string;
  url: string;
  category: 'hunt' | 'social' | 'community' | 'directory' | 'newsletter';
  priority: 'must' | 'should' | 'nice';
  description: string;
  tips: string[];
  bestDay?: string;
  costToFeature?: string;
}

export const LAUNCH_SITES: LaunchSite[] = [
  // MUST DO - Product Hunt & Major Sites
  {
    name: 'Product Hunt',
    url: 'https://producthunt.com',
    category: 'hunt',
    priority: 'must',
    description: 'The #1 platform for launching tech products',
    tips: [
      'Launch on Tuesday, Wednesday, or Thursday',
      'Post at 12:01 AM PST for maximum exposure',
      'Prepare 5+ high-quality images/GIFs',
      'Have team ready to answer questions all day',
      'Ask for upvotes from supporters (not directly)',
    ],
    bestDay: 'Tuesday-Thursday',
    costToFeature: 'Free (featured costs vary)',
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    category: 'community',
    priority: 'must',
    description: 'Tech-savvy community for startups',
    tips: [
      'Post as "Show HN: [Product Name]"',
      'Write a genuine story, not marketing speak',
      'Be active in comments',
      'Best times: 8-10 AM EST weekdays',
    ],
    bestDay: 'Weekdays',
    costToFeature: 'Free',
  },
  {
    name: 'Reddit (Relevant Subreddits)',
    url: 'https://reddit.com',
    category: 'social',
    priority: 'must',
    description: 'Find your niche community',
    tips: [
      'Build karma before posting (comment first)',
      'Follow each subreddit\'s rules exactly',
      'Don\'t be salesy - provide value',
      'r/startups, r/SideProject, r/entrepreneur',
    ],
    costToFeature: 'Free',
  },

  // SHOULD DO - High Value Sites
  {
    name: 'BetaList',
    url: 'https://betalist.com',
    category: 'directory',
    priority: 'should',
    description: 'Discover upcoming startups',
    tips: [
      'Submit 2-3 weeks before launch',
      'Paid option for faster listing',
      'Great for early adopter signups',
    ],
    costToFeature: 'Free (paid: $129)',
  },
  {
    name: 'Indie Hackers',
    url: 'https://indiehackers.com',
    category: 'community',
    priority: 'should',
    description: 'Community for bootstrapped founders',
    tips: [
      'Share your journey authentically',
      'Engage with other makers',
      'Post in relevant groups',
    ],
    costToFeature: 'Free',
  },
  {
    name: 'Twitter/X Launch Thread',
    url: 'https://twitter.com',
    category: 'social',
    priority: 'should',
    description: 'Build in public launch thread',
    tips: [
      'Create a launch thread 5-10 tweets',
      'Tag relevant accounts',
      'Use relevant hashtags',
      'Include demo video/GIF',
    ],
    costToFeature: 'Free',
  },
  {
    name: 'LinkedIn Post',
    url: 'https://linkedin.com',
    category: 'social',
    priority: 'should',
    description: 'Professional network launch',
    tips: [
      'Personal story angle works best',
      'Ask for support explicitly',
      'Tag team members',
    ],
    costToFeature: 'Free',
  },

  // NICE TO HAVE - Additional Exposure
  {
    name: 'AlternativeTo',
    url: 'https://alternativeto.net',
    category: 'directory',
    priority: 'nice',
    description: 'Software alternatives directory',
    tips: [
      'List as alternative to competitors',
      'Add detailed features',
    ],
    costToFeature: 'Free',
  },
  {
    name: 'SaaSHub',
    url: 'https://saashub.com',
    category: 'directory',
    priority: 'nice',
    description: 'SaaS product directory',
    tips: ['Add comprehensive product info', 'Get customer reviews'],
    costToFeature: 'Free',
  },
  {
    name: 'Launching Next',
    url: 'https://launchingnext.com',
    category: 'directory',
    priority: 'nice',
    description: 'Startup launch directory',
    tips: ['Submit early', 'Include good screenshots'],
    costToFeature: 'Free',
  },
  {
    name: 'StartupBase',
    url: 'https://startupbase.io',
    category: 'directory',
    priority: 'nice',
    description: 'Startup database',
    tips: ['Complete full profile', 'Add team info'],
    costToFeature: 'Free',
  },
  {
    name: 'Crunchbase',
    url: 'https://crunchbase.com',
    category: 'directory',
    priority: 'nice',
    description: 'Business info platform',
    tips: ['Create company profile', 'Add funding info if relevant'],
    costToFeature: 'Free (basic)',
  },
  {
    name: 'G2',
    url: 'https://g2.com',
    category: 'directory',
    priority: 'nice',
    description: 'Software review platform',
    tips: ['Set up profile before launch', 'Collect early reviews'],
    costToFeature: 'Free listing',
  },
  {
    name: 'Capterra',
    url: 'https://capterra.com',
    category: 'directory',
    priority: 'nice',
    description: 'Software comparison site',
    tips: ['Similar to G2 - list early'],
    costToFeature: 'Free listing',
  },
  {
    name: 'TLDR Newsletter',
    url: 'https://tldr.tech',
    category: 'newsletter',
    priority: 'nice',
    description: 'Tech newsletter sponsorship',
    tips: ['Paid but high ROI for tech products'],
    costToFeature: '$2,500+',
  },
];

// Get launch sites by priority
export function getLaunchSitesByPriority(priority: LaunchSite['priority']): LaunchSite[] {
  return LAUNCH_SITES.filter(s => s.priority === priority);
}

// Get free launch sites only
export function getFreeLaunchSites(): LaunchSite[] {
  return LAUNCH_SITES.filter(s => s.costToFeature === 'Free' || s.costToFeature?.includes('Free'));
}

// ============================================================================
// MARKET RESEARCH AGGREGATOR
// ============================================================================

export interface MarketResearch {
  industry: string;
  trends: {
    source: string;
    items: string[];
  }[];
  competitors: string[];
  opportunities: string[];
}

export async function getMarketResearch(industry: string): Promise<MarketResearch> {
  const [hnStories, redditPosts, news] = await Promise.all([
    searchHackerNews(industry, 5),
    getRedditTrends(industry.toLowerCase().replace(/\s+/g, ''), 5).catch(() => null),
    getIndustryNews(industry, 5),
  ]);

  const trends = [];

  if (hnStories.length > 0) {
    trends.push({
      source: 'Hacker News',
      items: hnStories.map(s => s.title),
    });
  }

  if (redditPosts?.topPosts?.length > 0) {
    trends.push({
      source: 'Reddit',
      items: redditPosts.topPosts.map(p => p.title),
    });
  }

  if (news.length > 0) {
    trends.push({
      source: 'News',
      items: news.map(n => n.title),
    });
  }

  return {
    industry,
    trends,
    competitors: [], // Would need additional API for competitor analysis
    opportunities: extractOpportunities(trends),
  };
}

function extractOpportunities(trends: { source: string; items: string[] }[]): string[] {
  // Simple keyword extraction for opportunities
  const allItems = trends.flatMap(t => t.items);
  const opportunities: string[] = [];

  if (allItems.some(i => i.toLowerCase().includes('ai'))) {
    opportunities.push('AI integration opportunities exist in this market');
  }
  if (allItems.some(i => i.toLowerCase().includes('automation'))) {
    opportunities.push('Automation tools are trending');
  }
  if (allItems.some(i => i.toLowerCase().includes('startup') || i.toLowerCase().includes('launch'))) {
    opportunities.push('Active startup activity indicates growing market');
  }

  return opportunities.length > 0 ? opportunities : ['Market research gathered - review trends for insights'];
}
