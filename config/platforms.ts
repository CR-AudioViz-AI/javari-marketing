// ============================================================================
// CR AUDIOVIZ AI - MARKETING PLATFORMS DATABASE
// 100+ platforms organized by category with FREE tier emphasis
// ============================================================================

export type PlatformTier = 'free' | 'budget' | 'premium';
export type PlatformCategory = 
  | 'social' 
  | 'email' 
  | 'seo' 
  | 'content' 
  | 'local' 
  | 'community' 
  | 'video' 
  | 'analytics' 
  | 'ads' 
  | 'automation';

export interface Platform {
  id: string;
  name: string;
  category: PlatformCategory;
  tier: PlatformTier;
  description: string;
  url: string;
  freeLimit?: string;
  pricing?: string;
  isCrav?: boolean; // Is this a CR AudioViz AI product?
  features: string[];
}

export const PLATFORMS: Platform[] = [
  // ============================================================================
  // SOCIAL MEDIA - FREE
  // ============================================================================
  {
    id: 'buffer-free',
    name: 'Buffer (Free)',
    category: 'social',
    tier: 'free',
    description: 'Schedule posts to 3 social channels',
    url: 'https://buffer.com',
    freeLimit: '3 channels, 10 posts/channel',
    features: ['Post scheduling', 'Basic analytics', 'Link shortening'],
  },
  {
    id: 'later-free',
    name: 'Later (Free)',
    category: 'social',
    tier: 'free',
    description: 'Visual social media planner',
    url: 'https://later.com',
    freeLimit: '1 social set, 30 posts/month',
    features: ['Visual planner', 'Linkin.bio', 'Basic analytics'],
  },
  {
    id: 'canva-free',
    name: 'Canva (Free)',
    category: 'social',
    tier: 'free',
    description: 'Design social media graphics',
    url: 'https://canva.com',
    freeLimit: '250,000+ templates',
    features: ['Templates', 'Stock photos', 'Basic editing'],
  },
  {
    id: 'crav-social-graphics',
    name: 'CRAV Social Graphics ⭐',
    category: 'social',
    tier: 'free',
    description: 'AI-powered social media graphics generator',
    url: 'https://craudiovizai.com/tools/social-graphics',
    isCrav: true,
    features: ['AI generation', 'Brand consistency', 'Multi-platform sizing'],
  },
  {
    id: 'tweetdeck',
    name: 'TweetDeck',
    category: 'social',
    tier: 'free',
    description: 'Advanced Twitter/X management',
    url: 'https://tweetdeck.twitter.com',
    freeLimit: 'Unlimited with X account',
    features: ['Multi-column view', 'Scheduling', 'Lists management'],
  },

  // ============================================================================
  // SOCIAL MEDIA - BUDGET
  // ============================================================================
  {
    id: 'buffer-essentials',
    name: 'Buffer Essentials',
    category: 'social',
    tier: 'budget',
    description: 'Professional social media management',
    url: 'https://buffer.com',
    pricing: '$6/month per channel',
    features: ['Unlimited posts', 'Advanced analytics', 'Team collaboration'],
  },
  {
    id: 'hootsuite-pro',
    name: 'Hootsuite Pro',
    category: 'social',
    tier: 'budget',
    description: 'Comprehensive social management',
    url: 'https://hootsuite.com',
    pricing: '$99/month',
    features: ['10 social accounts', 'Scheduling', 'Analytics'],
  },

  // ============================================================================
  // EMAIL MARKETING - FREE
  // ============================================================================
  {
    id: 'mailchimp-free',
    name: 'Mailchimp (Free)',
    category: 'email',
    tier: 'free',
    description: 'Email marketing for small lists',
    url: 'https://mailchimp.com',
    freeLimit: '500 contacts, 1,000 sends/month',
    features: ['Templates', 'Basic automation', 'Landing pages'],
  },
  {
    id: 'mailerlite-free',
    name: 'MailerLite (Free)',
    category: 'email',
    tier: 'free',
    description: 'Clean email marketing platform',
    url: 'https://mailerlite.com',
    freeLimit: '1,000 subscribers, 12,000 emails/month',
    features: ['Drag-drop editor', 'Automation', 'Landing pages'],
  },
  {
    id: 'sendinblue-free',
    name: 'Brevo (Free)',
    category: 'email',
    tier: 'free',
    description: 'Email & SMS marketing',
    url: 'https://brevo.com',
    freeLimit: '300 emails/day',
    features: ['Unlimited contacts', 'Templates', 'Basic automation'],
  },
  {
    id: 'buttondown',
    name: 'Buttondown (Free)',
    category: 'email',
    tier: 'free',
    description: 'Simple newsletter tool',
    url: 'https://buttondown.email',
    freeLimit: '100 subscribers',
    features: ['Markdown support', 'Simple UI', 'RSS integration'],
  },
  {
    id: 'crav-email-builder',
    name: 'CRAV Email Builder ⭐',
    category: 'email',
    tier: 'free',
    description: 'AI-powered email template generator',
    url: 'https://craudiovizai.com/tools/email-builder',
    isCrav: true,
    features: ['AI copywriting', 'Responsive templates', 'A/B suggestions'],
  },

  // ============================================================================
  // SEO - FREE
  // ============================================================================
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    category: 'seo',
    tier: 'free',
    description: 'Official Google SEO tool',
    url: 'https://search.google.com/search-console',
    freeLimit: 'Unlimited',
    features: ['Search analytics', 'Indexing', 'Core Web Vitals'],
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    category: 'seo',
    tier: 'free',
    description: 'Website analytics',
    url: 'https://analytics.google.com',
    freeLimit: 'Unlimited',
    features: ['Traffic analysis', 'Conversion tracking', 'Audience insights'],
  },
  {
    id: 'ubersuggest-free',
    name: 'Ubersuggest (Free)',
    category: 'seo',
    tier: 'free',
    description: 'Keyword research tool',
    url: 'https://neilpatel.com/ubersuggest',
    freeLimit: '3 searches/day',
    features: ['Keyword ideas', 'Content ideas', 'Competitor analysis'],
  },
  {
    id: 'answerthepublic',
    name: 'Answer The Public',
    category: 'seo',
    tier: 'free',
    description: 'Question-based keyword research',
    url: 'https://answerthepublic.com',
    freeLimit: '3 searches/day',
    features: ['Question keywords', 'Visual data', 'Content ideas'],
  },
  {
    id: 'crav-seo-analyzer',
    name: 'CRAV SEO Analyzer ⭐',
    category: 'seo',
    tier: 'free',
    description: 'AI-powered SEO audit tool',
    url: 'https://craudiovizai.com/tools/seo-analyzer',
    isCrav: true,
    features: ['AI recommendations', 'Competitor comparison', 'Action items'],
  },

  // ============================================================================
  // CONTENT - FREE
  // ============================================================================
  {
    id: 'notion-free',
    name: 'Notion (Free)',
    category: 'content',
    tier: 'free',
    description: 'All-in-one workspace',
    url: 'https://notion.so',
    freeLimit: 'Unlimited pages for individuals',
    features: ['Notes', 'Databases', 'Templates'],
  },
  {
    id: 'medium',
    name: 'Medium',
    category: 'content',
    tier: 'free',
    description: 'Publishing platform',
    url: 'https://medium.com',
    freeLimit: 'Unlimited publishing',
    features: ['Built-in audience', 'Partner program', 'Publications'],
  },
  {
    id: 'substack',
    name: 'Substack',
    category: 'content',
    tier: 'free',
    description: 'Newsletter platform',
    url: 'https://substack.com',
    freeLimit: 'Free forever (10% on paid)',
    features: ['Newsletter', 'Podcast', 'Community'],
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    category: 'content',
    tier: 'free',
    description: 'Developer blogging',
    url: 'https://hashnode.com',
    freeLimit: 'Unlimited',
    features: ['Custom domain', 'Markdown', 'Newsletter'],
  },
  {
    id: 'crav-blog-writer',
    name: 'CRAV Blog Writer ⭐',
    category: 'content',
    tier: 'free',
    description: 'AI blog content generator',
    url: 'https://craudiovizai.com/tools/blog-writer',
    isCrav: true,
    features: ['AI writing', 'SEO optimization', 'Image suggestions'],
  },

  // ============================================================================
  // LOCAL MARKETING - FREE
  // ============================================================================
  {
    id: 'google-business',
    name: 'Google Business Profile',
    category: 'local',
    tier: 'free',
    description: 'Local business listing',
    url: 'https://business.google.com',
    freeLimit: 'Unlimited',
    features: ['Maps listing', 'Reviews', 'Posts', 'Insights'],
  },
  {
    id: 'yelp-free',
    name: 'Yelp Business',
    category: 'local',
    tier: 'free',
    description: 'Local business reviews',
    url: 'https://biz.yelp.com',
    freeLimit: 'Free listing',
    features: ['Reviews', 'Photos', 'Business info'],
  },
  {
    id: 'nextdoor',
    name: 'Nextdoor Business',
    category: 'local',
    tier: 'free',
    description: 'Neighborhood marketing',
    url: 'https://business.nextdoor.com',
    freeLimit: 'Free business page',
    features: ['Local recommendations', 'Posts', 'Deals'],
  },
  {
    id: 'facebook-local',
    name: 'Facebook Local',
    category: 'local',
    tier: 'free',
    description: 'Facebook business page',
    url: 'https://facebook.com/business',
    freeLimit: 'Free page',
    features: ['Reviews', 'Events', 'Messaging'],
  },

  // ============================================================================
  // COMMUNITY - FREE
  // ============================================================================
  {
    id: 'reddit',
    name: 'Reddit',
    category: 'community',
    tier: 'free',
    description: 'Community engagement',
    url: 'https://reddit.com',
    freeLimit: 'Unlimited',
    features: ['Subreddits', 'AMAs', 'Community building'],
  },
  {
    id: 'discord-free',
    name: 'Discord',
    category: 'community',
    tier: 'free',
    description: 'Community server',
    url: 'https://discord.com',
    freeLimit: 'Unlimited servers',
    features: ['Voice/text chat', 'Bots', 'Roles'],
  },
  {
    id: 'slack-free',
    name: 'Slack (Free)',
    category: 'community',
    tier: 'free',
    description: 'Team communication',
    url: 'https://slack.com',
    freeLimit: '90-day history',
    features: ['Channels', 'Integrations', 'File sharing'],
  },
  {
    id: 'circle-free',
    name: 'Circle (Free Trial)',
    category: 'community',
    tier: 'free',
    description: 'Community platform',
    url: 'https://circle.so',
    freeLimit: '14-day trial',
    features: ['Spaces', 'Events', 'Courses'],
  },

  // ============================================================================
  // VIDEO - FREE
  // ============================================================================
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'video',
    tier: 'free',
    description: 'Video hosting platform',
    url: 'https://youtube.com',
    freeLimit: 'Unlimited uploads',
    features: ['Monetization', 'Analytics', 'Community'],
  },
  {
    id: 'loom-free',
    name: 'Loom (Free)',
    category: 'video',
    tier: 'free',
    description: 'Screen recording',
    url: 'https://loom.com',
    freeLimit: '25 videos, 5 min each',
    features: ['Screen recording', 'Sharing', 'Comments'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'video',
    tier: 'free',
    description: 'Short-form video',
    url: 'https://tiktok.com',
    freeLimit: 'Unlimited',
    features: ['Creator tools', 'Analytics', 'Shop'],
  },
  {
    id: 'capcut',
    name: 'CapCut',
    category: 'video',
    tier: 'free',
    description: 'Video editing',
    url: 'https://capcut.com',
    freeLimit: 'Free with watermark option',
    features: ['AI editing', 'Effects', 'Templates'],
  },
  {
    id: 'crav-video-creator',
    name: 'CRAV Video Creator ⭐',
    category: 'video',
    tier: 'free',
    description: 'AI video generation',
    url: 'https://craudiovizai.com/tools/video-creator',
    isCrav: true,
    features: ['AI avatars', 'Text-to-video', 'Templates'],
  },

  // ============================================================================
  // ANALYTICS - FREE
  // ============================================================================
  {
    id: 'plausible-free',
    name: 'Plausible (Self-hosted)',
    category: 'analytics',
    tier: 'free',
    description: 'Privacy-focused analytics',
    url: 'https://plausible.io',
    freeLimit: 'Free self-hosted',
    features: ['Privacy-first', 'Simple UI', 'No cookies'],
  },
  {
    id: 'umami',
    name: 'Umami',
    category: 'analytics',
    tier: 'free',
    description: 'Open source analytics',
    url: 'https://umami.is',
    freeLimit: 'Free self-hosted',
    features: ['Privacy-first', 'Real-time', 'Multiple sites'],
  },
  {
    id: 'hotjar-free',
    name: 'Hotjar (Free)',
    category: 'analytics',
    tier: 'free',
    description: 'Heatmaps and recordings',
    url: 'https://hotjar.com',
    freeLimit: '35 sessions/day',
    features: ['Heatmaps', 'Recordings', 'Surveys'],
  },
  {
    id: 'crav-analytics',
    name: 'CRAV Analytics ⭐',
    category: 'analytics',
    tier: 'free',
    description: 'AI-powered marketing analytics',
    url: 'https://craudiovizai.com/tools/analytics',
    isCrav: true,
    features: ['AI insights', 'Multi-platform', 'Recommendations'],
  },

  // ============================================================================
  // AUTOMATION - FREE
  // ============================================================================
  {
    id: 'zapier-free',
    name: 'Zapier (Free)',
    category: 'automation',
    tier: 'free',
    description: 'App automation',
    url: 'https://zapier.com',
    freeLimit: '100 tasks/month',
    features: ['5 zaps', '2-step workflows', '15 min updates'],
  },
  {
    id: 'make-free',
    name: 'Make (Free)',
    category: 'automation',
    tier: 'free',
    description: 'Visual automation',
    url: 'https://make.com',
    freeLimit: '1,000 ops/month',
    features: ['Visual builder', 'Complex workflows', 'Webhooks'],
  },
  {
    id: 'n8n-free',
    name: 'n8n (Self-hosted)',
    category: 'automation',
    tier: 'free',
    description: 'Open source automation',
    url: 'https://n8n.io',
    freeLimit: 'Unlimited self-hosted',
    features: ['200+ integrations', 'Custom code', 'Workflows'],
  },
  {
    id: 'ifttt-free',
    name: 'IFTTT (Free)',
    category: 'automation',
    tier: 'free',
    description: 'Simple automation',
    url: 'https://ifttt.com',
    freeLimit: '2 applets',
    features: ['Simple triggers', 'Mobile-first', 'Smart home'],
  },

  // ============================================================================
  // ADS - BUDGET/PREMIUM (No free tier for ads)
  // ============================================================================
  {
    id: 'google-ads',
    name: 'Google Ads',
    category: 'ads',
    tier: 'budget',
    description: 'Search and display advertising',
    url: 'https://ads.google.com',
    pricing: 'Pay per click',
    features: ['Search ads', 'Display network', 'YouTube ads'],
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    category: 'ads',
    tier: 'budget',
    description: 'Facebook & Instagram ads',
    url: 'https://business.facebook.com/ads',
    pricing: 'Pay per result',
    features: ['Targeting', 'Retargeting', 'Lookalikes'],
  },
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    category: 'ads',
    tier: 'budget',
    description: 'TikTok advertising',
    url: 'https://ads.tiktok.com',
    pricing: '$50 minimum',
    features: ['In-feed ads', 'Spark ads', 'Creator marketplace'],
  },
  {
    id: 'linkedin-ads',
    name: 'LinkedIn Ads',
    category: 'ads',
    tier: 'premium',
    description: 'B2B advertising',
    url: 'https://business.linkedin.com/marketing-solutions/ads',
    pricing: '$10/day minimum',
    features: ['B2B targeting', 'InMail', 'Lead gen forms'],
  },

  // ============================================================================
  // MORE SEO - BUDGET
  // ============================================================================
  {
    id: 'ahrefs-lite',
    name: 'Ahrefs Lite',
    category: 'seo',
    tier: 'budget',
    description: 'SEO research platform',
    url: 'https://ahrefs.com',
    pricing: '$129/month',
    features: ['Backlink analysis', 'Keyword research', 'Rank tracking'],
  },
  {
    id: 'semrush',
    name: 'SEMrush Pro',
    category: 'seo',
    tier: 'budget',
    description: 'All-in-one SEO tool',
    url: 'https://semrush.com',
    pricing: '$129/month',
    features: ['SEO audit', 'Competitor analysis', 'Content marketing'],
  },
  {
    id: 'moz-pro',
    name: 'Moz Pro',
    category: 'seo',
    tier: 'budget',
    description: 'SEO software suite',
    url: 'https://moz.com',
    pricing: '$99/month',
    features: ['Domain authority', 'Link explorer', 'Rank tracking'],
  },

  // ============================================================================
  // MORE EMAIL - BUDGET
  // ============================================================================
  {
    id: 'convertkit',
    name: 'ConvertKit',
    category: 'email',
    tier: 'budget',
    description: 'Creator email marketing',
    url: 'https://convertkit.com',
    pricing: '$15/month for 300 subs',
    features: ['Visual automations', 'Landing pages', 'Commerce'],
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    category: 'email',
    tier: 'budget',
    description: 'Marketing automation',
    url: 'https://activecampaign.com',
    pricing: '$29/month',
    features: ['CRM', 'Automation', 'SMS'],
  },

  // ============================================================================
  // MORE VIDEO - BUDGET
  // ============================================================================
  {
    id: 'vidyard',
    name: 'Vidyard',
    category: 'video',
    tier: 'budget',
    description: 'Video for business',
    url: 'https://vidyard.com',
    pricing: '$19/month',
    features: ['Video hosting', 'Analytics', 'CTAs'],
  },
  {
    id: 'wistia',
    name: 'Wistia',
    category: 'video',
    tier: 'budget',
    description: 'Professional video hosting',
    url: 'https://wistia.com',
    pricing: '$19/month',
    features: ['Video SEO', 'Lead capture', 'Channels'],
  },
];

// Get platforms by category
export function getPlatformsByCategory(category: PlatformCategory): Platform[] {
  return PLATFORMS.filter(p => p.category === category);
}

// Get platforms by tier
export function getPlatformsByTier(tier: PlatformTier): Platform[] {
  return PLATFORMS.filter(p => p.tier === tier);
}

// Get free platforms first, then budget, then premium
export function getPlatformsSorted(): Platform[] {
  const tierOrder: PlatformTier[] = ['free', 'budget', 'premium'];
  return [...PLATFORMS].sort((a, b) => {
    return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
  });
}

// Get CRAV platforms only
export function getCravPlatforms(): Platform[] {
  return PLATFORMS.filter(p => p.isCrav);
}

// Search platforms
export function searchPlatforms(query: string): Platform[] {
  const lowerQuery = query.toLowerCase();
  return PLATFORMS.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
}

// Category display info
export const CATEGORY_INFO: Record<PlatformCategory, { label: string; icon: string }> = {
  social: { label: 'Social Media', icon: 'share-2' },
  email: { label: 'Email Marketing', icon: 'mail' },
  seo: { label: 'SEO & Search', icon: 'search' },
  content: { label: 'Content & Blogs', icon: 'file-text' },
  local: { label: 'Local Marketing', icon: 'map-pin' },
  community: { label: 'Community', icon: 'users' },
  video: { label: 'Video', icon: 'video' },
  analytics: { label: 'Analytics', icon: 'bar-chart-2' },
  ads: { label: 'Paid Ads', icon: 'dollar-sign' },
  automation: { label: 'Automation', icon: 'zap' },
};
