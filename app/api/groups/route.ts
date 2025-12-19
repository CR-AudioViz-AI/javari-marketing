// ============================================================================
// CR AUDIOVIZ AI - COMMUNITY GROUPS API
// Manage Facebook groups, subreddits, Discord servers, LinkedIn groups
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface CommunityGroup {
  id?: string;
  platformSlug: string;
  name: string;
  url?: string;
  memberCount?: number;
  nicheSlug?: string;
  activityLevel?: 'very-active' | 'active' | 'moderate' | 'low';
  allowsPromotion?: boolean;
  promotionRules?: string;
  adminStrictness?: 'strict' | 'moderate' | 'relaxed';
  notes?: string;
}

// ============================================================================
// PRE-POPULATED GROUP SUGGESTIONS
// ============================================================================

const SUGGESTED_GROUPS: Record<string, CommunityGroup[]> = {
  'crochet': [
    { platformSlug: 'facebook-groups', name: 'Yarnspirations Stitch Squad', memberCount: 150000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Crochet Addict Support Group', memberCount: 200000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Red Heart Lovers Club', memberCount: 80000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'AllFreeCrochet Community', memberCount: 100000, activityLevel: 'active', allowsPromotion: true, promotionRules: 'Free patterns only' },
    { platformSlug: 'facebook-groups', name: 'Amigurumi Patterns & Ideas', memberCount: 75000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Crochet for Beginners', memberCount: 90000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Modern Crochet Community', memberCount: 40000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Crochet Business Owners', memberCount: 25000, activityLevel: 'active', allowsPromotion: true },
    { platformSlug: 'reddit', name: 'r/crochet', url: 'https://reddit.com/r/crochet', memberCount: 500000, activityLevel: 'very-active', adminStrictness: 'moderate' },
    { platformSlug: 'reddit', name: 'r/Brochet', url: 'https://reddit.com/r/Brochet', memberCount: 80000, activityLevel: 'active', adminStrictness: 'relaxed' },
    { platformSlug: 'reddit', name: 'r/crochetpatterns', url: 'https://reddit.com/r/crochetpatterns', memberCount: 50000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/Amigurumi', url: 'https://reddit.com/r/Amigurumi', memberCount: 60000, activityLevel: 'active' },
    { platformSlug: 'pinterest', name: 'Crochet Patterns Board', memberCount: 1000000, activityLevel: 'very-active', notes: 'Create pins with patterns' },
  ],
  'scrapbooking': [
    { platformSlug: 'facebook-groups', name: 'Crafts & Creative Ideas DIY', memberCount: 651000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'DIY Crafts & Projects', memberCount: 239000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'Scrapbooking, Cards & Crafts', memberCount: 19000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Silhouette Cameo Crafts', memberCount: 41000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Cricut Crafters', memberCount: 70000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Junk Journal Community', memberCount: 50000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Memory Keeping & Scrapbooking', memberCount: 35000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Paper Crafters Unite', memberCount: 28000, activityLevel: 'active', allowsPromotion: true },
    { platformSlug: 'reddit', name: 'r/scrapbooking', url: 'https://reddit.com/r/scrapbooking', memberCount: 50000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/crafts', url: 'https://reddit.com/r/crafts', memberCount: 1500000, activityLevel: 'very-active' },
    { platformSlug: 'reddit', name: 'r/Cricut', url: 'https://reddit.com/r/Cricut', memberCount: 100000, activityLevel: 'very-active' },
    { platformSlug: 'pinterest', name: 'Scrapbooking Ideas', memberCount: 2000000, activityLevel: 'very-active', notes: 'Pin layouts and tutorials' },
  ],
  'whiskey-bourbon': [
    { platformSlug: 'facebook-groups', name: 'Bourbon Enthusiasts', memberCount: 50000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Whiskey Collectors', memberCount: 35000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Bourbon Secondary Market', memberCount: 80000, activityLevel: 'very-active', allowsPromotion: false, notes: 'Trading focused' },
    { platformSlug: 'facebook-groups', name: 'Japanese Whisky Appreciation', memberCount: 25000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Scotch Whisky Society', memberCount: 40000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Whiskey Hunting & Finds', memberCount: 60000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'reddit', name: 'r/bourbon', url: 'https://reddit.com/r/bourbon', memberCount: 350000, activityLevel: 'very-active', adminStrictness: 'moderate' },
    { platformSlug: 'reddit', name: 'r/whiskey', url: 'https://reddit.com/r/whiskey', memberCount: 200000, activityLevel: 'very-active' },
    { platformSlug: 'reddit', name: 'r/Scotch', url: 'https://reddit.com/r/Scotch', memberCount: 150000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/WhiskeyTribe', url: 'https://reddit.com/r/WhiskeyTribe', memberCount: 70000, activityLevel: 'active', adminStrictness: 'relaxed' },
    { platformSlug: 'reddit', name: 'r/worldwhisky', url: 'https://reddit.com/r/worldwhisky', memberCount: 30000, activityLevel: 'moderate' },
  ],
  'sports-cards': [
    { platformSlug: 'facebook-groups', name: 'Sports Card Collectors', memberCount: 100000, activityLevel: 'very-active', allowsPromotion: true, promotionRules: 'Sales posts allowed' },
    { platformSlug: 'facebook-groups', name: 'Baseball Card Exchange', memberCount: 75000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'Basketball Cards Buy/Sell/Trade', memberCount: 60000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'Football Card Collectors', memberCount: 55000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'PSA Card Grading Discussion', memberCount: 45000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Vintage Sports Cards', memberCount: 30000, activityLevel: 'active', allowsPromotion: true },
    { platformSlug: 'reddit', name: 'r/baseballcards', url: 'https://reddit.com/r/baseballcards', memberCount: 100000, activityLevel: 'very-active' },
    { platformSlug: 'reddit', name: 'r/basketballcards', url: 'https://reddit.com/r/basketballcards', memberCount: 50000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/footballcards', url: 'https://reddit.com/r/footballcards', memberCount: 40000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/tradingcardcommunity', url: 'https://reddit.com/r/tradingcardcommunity', memberCount: 30000, activityLevel: 'active' },
  ],
  'pokemon-cards': [
    { platformSlug: 'facebook-groups', name: 'Pokemon TCG Collectors', memberCount: 150000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'Pokemon Card Trading', memberCount: 80000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'Pokemon Card Grading PSA/BGS', memberCount: 40000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'reddit', name: 'r/PokemonTCG', url: 'https://reddit.com/r/PokemonTCG', memberCount: 400000, activityLevel: 'very-active' },
    { platformSlug: 'reddit', name: 'r/pkmntcgcollections', url: 'https://reddit.com/r/pkmntcgcollections', memberCount: 60000, activityLevel: 'active' },
  ],
  'saas': [
    { platformSlug: 'facebook-groups', name: 'SaaS Growth Hacks', memberCount: 50000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Startup Founders', memberCount: 100000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'No-Code/Low-Code Builders', memberCount: 45000, activityLevel: 'active', allowsPromotion: true },
    { platformSlug: 'reddit', name: 'r/SaaS', url: 'https://reddit.com/r/SaaS', memberCount: 50000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/startups', url: 'https://reddit.com/r/startups', memberCount: 1200000, activityLevel: 'very-active', adminStrictness: 'strict' },
    { platformSlug: 'reddit', name: 'r/Entrepreneur', url: 'https://reddit.com/r/Entrepreneur', memberCount: 3000000, activityLevel: 'very-active' },
    { platformSlug: 'reddit', name: 'r/indiehackers', url: 'https://reddit.com/r/indiehackers', memberCount: 100000, activityLevel: 'active', adminStrictness: 'relaxed' },
    { platformSlug: 'reddit', name: 'r/smallbusiness', url: 'https://reddit.com/r/smallbusiness', memberCount: 800000, activityLevel: 'very-active' },
    { platformSlug: 'linkedin', name: 'SaaS Founders Network', memberCount: 200000, activityLevel: 'active' },
    { platformSlug: 'linkedin', name: 'Startup Grind', memberCount: 500000, activityLevel: 'active' },
    { platformSlug: 'producthunt', name: 'Product Hunt', url: 'https://producthunt.com', memberCount: 1000000, activityLevel: 'very-active', notes: 'Launch products here' },
  ],
  'freelancing': [
    { platformSlug: 'facebook-groups', name: 'Freelancers Union', memberCount: 80000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Freelance Writers', memberCount: 60000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Freelance Designers', memberCount: 45000, activityLevel: 'active', allowsPromotion: true },
    { platformSlug: 'reddit', name: 'r/freelance', url: 'https://reddit.com/r/freelance', memberCount: 200000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/freelanceWriters', url: 'https://reddit.com/r/freelanceWriters', memberCount: 80000, activityLevel: 'active' },
    { platformSlug: 'linkedin', name: 'Freelancers & Consultants', memberCount: 300000, activityLevel: 'active' },
  ],
};

// Niche metadata
const NICHE_METADATA: Record<string, { name: string; platforms: string[]; tips: string[] }> = {
  'crochet': {
    name: 'Crochet',
    platforms: ['facebook-groups', 'pinterest', 'instagram', 'reddit', 'youtube'],
    tips: ['Share WIP photos', 'Ask for pattern help', 'Post finished projects', 'Pinterest is huge for patterns'],
  },
  'scrapbooking': {
    name: 'Scrapbooking',
    platforms: ['facebook-groups', 'pinterest', 'instagram', 'youtube'],
    tips: ['Show before/after layouts', 'Share supply hauls', 'Tutorial content performs well', 'Pinterest drives traffic'],
  },
  'whiskey-bourbon': {
    name: 'Whiskey & Bourbon',
    platforms: ['facebook-groups', 'reddit', 'instagram'],
    tips: ['Share collection photos', 'Post tasting notes', 'Best times: evenings and weekends', 'Avoid sales language'],
  },
  'sports-cards': {
    name: 'Sports Cards',
    platforms: ['facebook-groups', 'reddit', 'instagram', 'twitter'],
    tips: ['Share pulls', 'Post during games', 'Grading discussions popular', 'Investment content works'],
  },
  'pokemon-cards': {
    name: 'Pokemon Cards',
    platforms: ['facebook-groups', 'reddit', 'instagram', 'tiktok'],
    tips: ['Opening videos perform well', 'Share collection milestones', 'Grading content popular'],
  },
  'saas': {
    name: 'SaaS & Software',
    platforms: ['linkedin', 'twitter', 'reddit', 'producthunt', 'hackernews'],
    tips: ['Share metrics and learnings', 'Be helpful first', 'Product Hunt for launches', 'LinkedIn for B2B'],
  },
  'freelancing': {
    name: 'Freelancing',
    platforms: ['facebook-groups', 'reddit', 'linkedin', 'twitter'],
    tips: ['Share wins and lessons', 'Rate discussions popular', 'Help others get started', 'Portfolio posts work'],
  },
};

// ============================================================================
// GET - List groups or get suggestions
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const platform = searchParams.get('platform');
    const action = searchParams.get('action');

    // Get suggested groups for a niche
    if (action === 'suggestions' && niche) {
      let suggestions = SUGGESTED_GROUPS[niche] || [];
      const metadata = NICHE_METADATA[niche];
      
      // Filter by platform if specified
      if (platform) {
        suggestions = suggestions.filter(g => g.platformSlug === platform);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          niche: metadata?.name || niche,
          groups: suggestions,
          totalGroups: suggestions.length,
          platforms: metadata?.platforms || [],
          tips: metadata?.tips || [],
          postingGuidelines: [
            'Join 5-10 groups to start',
            'Observe for 2-3 days before posting',
            'Read group rules carefully',
            'Max 12 groups per day for posting',
            'Never same post in multiple groups within 48 hours',
            'Engage genuinely - no self-promotion initially',
          ],
        },
      });
    }

    // Get all available niche suggestions summary
    if (action === 'all-suggestions') {
      const allSuggestions: Record<string, any> = {};
      for (const [slug, groups] of Object.entries(SUGGESTED_GROUPS)) {
        const metadata = NICHE_METADATA[slug];
        allSuggestions[slug] = {
          name: metadata?.name || slug,
          groupCount: groups.length,
          platforms: [...new Set(groups.map(g => g.platformSlug))],
          topGroups: groups.slice(0, 3).map(g => g.name),
        };
      }
      return NextResponse.json({ success: true, data: allSuggestions });
    }

    // Get groups by platform
    if (action === 'by-platform' && platform) {
      const allGroups: CommunityGroup[] = [];
      for (const [nicheSlug, groups] of Object.entries(SUGGESTED_GROUPS)) {
        const filtered = groups.filter(g => g.platformSlug === platform);
        filtered.forEach(g => allGroups.push({ ...g, nicheSlug }));
      }
      return NextResponse.json({
        success: true,
        data: {
          platform,
          groups: allGroups,
          totalGroups: allGroups.length,
        },
      });
    }

    // Get platforms summary
    if (action === 'platforms') {
      const platforms = [
        { slug: 'facebook-groups', name: 'Facebook Groups', description: 'Community-based marketing', icon: 'facebook', bestFor: ['community', 'trust'] },
        { slug: 'reddit', name: 'Reddit', description: 'Subreddit communities', icon: 'message-circle', bestFor: ['authentic', 'niche'] },
        { slug: 'linkedin', name: 'LinkedIn', description: 'Professional networking', icon: 'linkedin', bestFor: ['b2b', 'professional'] },
        { slug: 'pinterest', name: 'Pinterest', description: 'Visual discovery', icon: 'image', bestFor: ['crafts', 'visual', 'seo'] },
        { slug: 'instagram', name: 'Instagram', description: 'Visual content', icon: 'instagram', bestFor: ['visual', 'lifestyle'] },
        { slug: 'twitter', name: 'Twitter/X', description: 'Real-time conversations', icon: 'twitter', bestFor: ['news', 'tech'] },
        { slug: 'youtube', name: 'YouTube', description: 'Video content', icon: 'youtube', bestFor: ['tutorials', 'seo'] },
        { slug: 'tiktok', name: 'TikTok', description: 'Short-form video', icon: 'video', bestFor: ['young', 'viral'] },
        { slug: 'discord', name: 'Discord', description: 'Community servers', icon: 'message-square', bestFor: ['community', 'real-time'] },
        { slug: 'producthunt', name: 'Product Hunt', description: 'Product launches', icon: 'rocket', bestFor: ['launches', 'tech'] },
      ];
      return NextResponse.json({ success: true, data: platforms });
    }

    // Return API info
    return NextResponse.json({
      service: 'Community Groups API',
      description: 'Manage Facebook groups, subreddits, and other communities for marketing',
      status: 'operational',
      endpoints: {
        'GET /api/groups?action=suggestions&niche=crochet': 'Get suggested groups for niche',
        'GET /api/groups?action=suggestions&niche=crochet&platform=reddit': 'Filter by platform',
        'GET /api/groups?action=all-suggestions': 'Get all niche suggestions summary',
        'GET /api/groups?action=by-platform&platform=reddit': 'Get all groups for a platform',
        'GET /api/groups?action=platforms': 'Get available platforms',
      },
      availableNiches: Object.keys(SUGGESTED_GROUPS),
      availablePlatforms: ['facebook-groups', 'reddit', 'linkedin', 'pinterest', 'instagram', 'twitter', 'youtube', 'tiktok', 'discord', 'producthunt'],
    });
  } catch (error) {
    console.error('Groups API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Add custom groups (for future database integration)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groups, niche } = body;

    if (!groups || !Array.isArray(groups)) {
      return NextResponse.json(
        { success: false, error: 'Groups array required' },
        { status: 400 }
      );
    }

    // For now, return success with the groups that would be added
    // In production, this would save to Supabase
    return NextResponse.json({
      success: true,
      message: `${groups.length} groups ready to be tracked`,
      data: {
        groups: groups.map((g: any) => ({
          ...g,
          niche,
          status: 'pending',
          addedAt: new Date().toISOString(),
        })),
        note: 'Database integration coming soon - groups will be persisted',
      },
    });
  } catch (error) {
    console.error('Groups POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
