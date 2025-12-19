// ============================================================================
// CR AUDIOVIZ AI - CAMPAIGNS API
// Full CRUD + content generation + scheduling
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

// Import types inline to avoid path issues
interface Campaign {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  businessNicheId?: string;
  productName: string;
  productUrl?: string;
  productDescription: string;
  campaignType: 'awareness' | 'launch' | 'ongoing' | 'promotion' | 'drip';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  startDate?: string;
  endDate?: string;
  targetPlatforms: string[];
  targetGroups?: string[];
  goals?: any;
  settings?: any;
}

interface PostTemplate {
  name: string;
  category: 'curiosity' | 'value' | 'engagement' | 'announcement' | 'cross-sell';
  templateText: string;
  placeholders: Record<string, string>;
}

// Post templates
const CAMPAIGN_TEMPLATES: PostTemplate[] = [
  {
    name: 'Basic Curiosity',
    category: 'curiosity',
    templateText: `Has anyone tried {{product_name}} for {{use_case}}? I'm getting ready to test it out and wanted any feedback. If you use something different, let me know what so I can compare!`,
    placeholders: { product_name: 'the app', use_case: 'this task' },
  },
  {
    name: 'Tool Comparison Request',
    category: 'curiosity',
    templateText: `Quick question - what do you all use for {{task}}? I've been researching options and wanted real user feedback before I commit. Any favorites or ones to avoid?`,
    placeholders: { task: 'managing your collection' },
  },
  {
    name: 'Specific Problem',
    category: 'curiosity',
    templateText: `Building out my toolkit and wondering about {{category}}. I have {{specific_problem}}. What's everyone here using? Any hidden gems I should know about?`,
    placeholders: { category: 'organization tools', specific_problem: 'too many items to track' },
  },
  {
    name: 'Quick Tip',
    category: 'value',
    templateText: `💡 Quick tip that helped me: {{tip}}\n\nThis saved me {{benefit}}. Hope it helps someone else!`,
    placeholders: { tip: 'Organize by category first', benefit: 'hours of searching' },
  },
  {
    name: 'Poll/Question',
    category: 'engagement',
    templateText: `Quick poll: {{question}}\n\nA) {{option_a}}\nB) {{option_b}}\nC) {{option_c}}\n\nDrop your answer below! 👇`,
    placeholders: { question: 'How do you organize?', option_a: 'Spreadsheet', option_b: 'App', option_c: 'Physical system' },
  },
];

// Niche configurations
const NICHE_CONFIGS: Record<string, any> = {
  'crochet': {
    id: 'crochet',
    name: 'Crochet',
    slug: 'crochet',
    keywords: ['crochet', 'yarn', 'pattern', 'hook', 'amigurumi'],
    recommendedPlatforms: ['facebook-groups', 'pinterest', 'instagram', 'reddit'],
    recommendedSubreddits: ['crochet', 'Brochet', 'crochetpatterns', 'Amigurumi'],
  },
  'scrapbooking': {
    id: 'scrapbooking',
    name: 'Scrapbooking',
    slug: 'scrapbooking',
    keywords: ['scrapbook', 'paper craft', 'memory keeping', 'album'],
    recommendedPlatforms: ['facebook-groups', 'pinterest', 'instagram'],
    recommendedSubreddits: ['scrapbooking', 'crafts', 'papercrafts'],
  },
  'whiskey-bourbon': {
    id: 'whiskey-bourbon',
    name: 'Whiskey & Bourbon',
    slug: 'whiskey-bourbon',
    keywords: ['whiskey', 'bourbon', 'scotch', 'rye', 'collector'],
    recommendedPlatforms: ['facebook-groups', 'reddit', 'instagram'],
    recommendedSubreddits: ['bourbon', 'whiskey', 'Scotch', 'WhiskeyTribe'],
  },
  'sports-cards': {
    id: 'sports-cards',
    name: 'Sports Cards',
    slug: 'sports-cards',
    keywords: ['trading cards', 'baseball cards', 'basketball cards', 'grading'],
    recommendedPlatforms: ['facebook-groups', 'reddit', 'instagram', 'twitter'],
    recommendedSubreddits: ['baseballcards', 'basketballcards', 'footballcards'],
  },
  'saas': {
    id: 'saas',
    name: 'SaaS & Software',
    slug: 'saas',
    keywords: ['saas', 'software', 'startup', 'app', 'product'],
    recommendedPlatforms: ['linkedin', 'twitter', 'reddit', 'producthunt'],
    recommendedSubreddits: ['SaaS', 'startups', 'Entrepreneur', 'indiehackers'],
  },
};

// Get marketing recommendations
function getMarketingRecommendations(businessDescription: string, budget: number) {
  const description = businessDescription.toLowerCase();
  let bestNiche = NICHE_CONFIGS['saas'];
  let bestScore = 0;

  for (const [slug, config] of Object.entries(NICHE_CONFIGS)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (description.includes(keyword.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestNiche = config;
    }
  }

  return {
    recommendedNiche: bestNiche,
    platforms: bestNiche.recommendedPlatforms.map((p: string, i: number) => ({
      name: p,
      priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
      reason: `Recommended for ${bestNiche.name}`,
    })),
    groupTypes: [],
    contentStrategy: `Focus on ${bestNiche.recommendedPlatforms.slice(0, 2).join(' and ')}`,
    postingSchedule: budget === 0 ? 'Organic only - 1-2 posts/day' : '3-5 posts/day',
    estimatedReach: `${bestNiche.name} community`,
  };
}

// ============================================================================
// GET - List campaigns or get info
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get available niches
    if (action === 'niches') {
      return NextResponse.json({
        success: true,
        data: Object.values(NICHE_CONFIGS).map(n => ({
          id: n.id,
          name: n.name,
          slug: n.slug,
          keywords: n.keywords.slice(0, 5),
          platforms: n.recommendedPlatforms,
        })),
      });
    }

    // Get templates
    if (action === 'templates') {
      const category = searchParams.get('category');
      let templates = CAMPAIGN_TEMPLATES;
      if (category) {
        templates = templates.filter(t => t.category === category);
      }
      return NextResponse.json({ success: true, data: templates });
    }

    // Return API info
    return NextResponse.json({
      service: 'Campaign Management API',
      version: '2.0.0',
      status: 'operational',
      endpoints: {
        'GET /api/campaigns?action=niches': 'Get available niches',
        'GET /api/campaigns?action=templates': 'Get post templates',
        'POST /api/campaigns?action=recommend': 'Get platform recommendations',
        'POST /api/campaigns': 'Create campaign (coming soon)',
      },
      availableNiches: Object.keys(NICHE_CONFIGS),
      templateCategories: ['curiosity', 'value', 'engagement', 'announcement', 'cross-sell'],
    });
  } catch (error) {
    console.error('Campaign API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create campaign or get recommendations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // Get marketing recommendations for a business
    if (action === 'recommend') {
      const { businessDescription, budget = 0 } = body;
      
      if (!businessDescription) {
        return NextResponse.json(
          { success: false, error: 'Business description required' },
          { status: 400 }
        );
      }

      const recommendations = getMarketingRecommendations(businessDescription, budget);
      
      return NextResponse.json({
        success: true,
        data: {
          ...recommendations,
          suggestedCampaignTypes: [
            {
              type: 'awareness',
              name: 'Brand Awareness',
              description: 'Build recognition in your target communities',
              recommendedDuration: '3-6 months',
              postTypes: ['curiosity', 'value'],
            },
            {
              type: 'launch',
              name: 'Product Launch',
              description: 'Maximum impact for new product/feature',
              recommendedDuration: '2-4 weeks',
              postTypes: ['curiosity', 'announcement', 'engagement'],
            },
            {
              type: 'ongoing',
              name: 'Ongoing Engagement',
              description: 'Consistent presence and community building',
              recommendedDuration: 'Continuous',
              postTypes: ['value', 'engagement', 'cross-sell'],
            },
          ],
          nextSteps: [
            'Join recommended Facebook groups',
            'Create accounts on suggested platforms',
            'Create your first campaign',
            'Generate initial content',
            'Start posting (12 groups/day max)',
          ],
        },
      });
    }

    // Generate posts
    if (action === 'generate') {
      const { productName, productDescription, count = 5, types = ['curiosity', 'value'] } = body;
      
      if (!productName || !productDescription) {
        return NextResponse.json(
          { success: false, error: 'productName and productDescription required' },
          { status: 400 }
        );
      }

      const posts = [];
      for (let i = 0; i < count; i++) {
        const contentType = types[i % types.length];
        const templates = CAMPAIGN_TEMPLATES.filter(t => t.category === contentType);
        const template = templates[Math.floor(Math.random() * templates.length)];

        let body = template.templateText;
        body = body.replace(/\{\{product_name\}\}/g, productName);
        body = body.replace(/\{\{use_case\}\}/g, productDescription.slice(0, 50));
        body = body.replace(/\{\{task\}\}/g, productDescription.slice(0, 30));
        body = body.replace(/\{\{category\}\}/g, 'tools');

        posts.push({
          contentType,
          templateUsed: template.name,
          body,
          status: 'draft',
        });
      }

      return NextResponse.json({
        success: true,
        data: posts,
        meta: {
          generated: posts.length,
          types,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use action=recommend or action=generate',
    }, { status: 400 });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
