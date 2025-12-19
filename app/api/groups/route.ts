// ============================================================================
// CR AUDIOVIZ AI - COMMUNITY GROUPS API
// Manage Facebook groups, subreddits, Discord servers, LinkedIn groups
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NICHE_CONFIGS } from '@/lib/campaign-engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// TYPES
// ============================================================================

interface CommunityGroup {
  id?: string;
  platformId?: string;
  platformSlug: string;
  name: string;
  url?: string;
  memberCount?: number;
  nicheId?: string;
  nicheSlug?: string;
  activityLevel?: 'very-active' | 'active' | 'moderate' | 'low';
  rulesSummary?: string;
  allowsPromotion?: boolean;
  promotionRules?: string;
  bestPostingDays?: string[];
  bestPostingTimes?: string[];
  adminStrictness?: 'strict' | 'moderate' | 'relaxed';
  competitorPresence?: string[];
  notes?: string;
  lastPostedAt?: string;
  lastActivityCheck?: string;
  addedBy?: string;
  verified?: boolean;
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
    { platformSlug: 'reddit', name: 'r/crochet', url: 'https://reddit.com/r/crochet', memberCount: 500000, activityLevel: 'very-active', adminStrictness: 'moderate' },
    { platformSlug: 'reddit', name: 'r/Brochet', url: 'https://reddit.com/r/Brochet', memberCount: 80000, activityLevel: 'active', adminStrictness: 'relaxed' },
    { platformSlug: 'reddit', name: 'r/crochetpatterns', url: 'https://reddit.com/r/crochetpatterns', memberCount: 50000, activityLevel: 'active' },
  ],
  'scrapbooking': [
    { platformSlug: 'facebook-groups', name: 'Crafts & Creative Ideas DIY', memberCount: 651000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'DIY Crafts & Projects', memberCount: 239000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'Scrapbooking, Cards & Crafts', memberCount: 19000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Silhouette Cameo Crafts', memberCount: 41000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Cricut Crafters', memberCount: 70000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Junk Journal Community', memberCount: 50000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'reddit', name: 'r/scrapbooking', url: 'https://reddit.com/r/scrapbooking', memberCount: 50000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/crafts', url: 'https://reddit.com/r/crafts', memberCount: 1500000, activityLevel: 'very-active' },
  ],
  'whiskey-bourbon': [
    { platformSlug: 'facebook-groups', name: 'Bourbon Enthusiasts', memberCount: 50000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Whiskey Collectors', memberCount: 35000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Bourbon Secondary Market', memberCount: 80000, activityLevel: 'very-active', allowsPromotion: false, notes: 'Trading focused' },
    { platformSlug: 'reddit', name: 'r/bourbon', url: 'https://reddit.com/r/bourbon', memberCount: 350000, activityLevel: 'very-active', adminStrictness: 'moderate' },
    { platformSlug: 'reddit', name: 'r/whiskey', url: 'https://reddit.com/r/whiskey', memberCount: 200000, activityLevel: 'very-active' },
    { platformSlug: 'reddit', name: 'r/Scotch', url: 'https://reddit.com/r/Scotch', memberCount: 150000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/WhiskeyTribe', url: 'https://reddit.com/r/WhiskeyTribe', memberCount: 70000, activityLevel: 'active', adminStrictness: 'relaxed' },
  ],
  'sports-cards': [
    { platformSlug: 'facebook-groups', name: 'Sports Card Collectors', memberCount: 100000, activityLevel: 'very-active', allowsPromotion: true, promotionRules: 'Sales posts allowed' },
    { platformSlug: 'facebook-groups', name: 'Baseball Card Exchange', memberCount: 75000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'facebook-groups', name: 'Basketball Cards Buy/Sell/Trade', memberCount: 60000, activityLevel: 'very-active', allowsPromotion: true },
    { platformSlug: 'reddit', name: 'r/baseballcards', url: 'https://reddit.com/r/baseballcards', memberCount: 100000, activityLevel: 'very-active' },
    { platformSlug: 'reddit', name: 'r/basketballcards', url: 'https://reddit.com/r/basketballcards', memberCount: 50000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/footballcards', url: 'https://reddit.com/r/footballcards', memberCount: 40000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/tradingcardcommunity', url: 'https://reddit.com/r/tradingcardcommunity', memberCount: 30000, activityLevel: 'active' },
  ],
  'saas': [
    { platformSlug: 'facebook-groups', name: 'SaaS Growth Hacks', memberCount: 50000, activityLevel: 'active', allowsPromotion: false },
    { platformSlug: 'facebook-groups', name: 'Startup Founders', memberCount: 100000, activityLevel: 'very-active', allowsPromotion: false },
    { platformSlug: 'reddit', name: 'r/SaaS', url: 'https://reddit.com/r/SaaS', memberCount: 50000, activityLevel: 'active' },
    { platformSlug: 'reddit', name: 'r/startups', url: 'https://reddit.com/r/startups', memberCount: 1200000, activityLevel: 'very-active', adminStrictness: 'strict' },
    { platformSlug: 'reddit', name: 'r/Entrepreneur', url: 'https://reddit.com/r/Entrepreneur', memberCount: 3000000, activityLevel: 'very-active' },
    { platformSlug: 'reddit', name: 'r/indiehackers', url: 'https://reddit.com/r/indiehackers', memberCount: 100000, activityLevel: 'active', adminStrictness: 'relaxed' },
    { platformSlug: 'linkedin', name: 'SaaS Founders Network', memberCount: 200000, activityLevel: 'active' },
    { platformSlug: 'linkedin', name: 'Startup Grind', memberCount: 500000, activityLevel: 'active' },
  ],
};

// ============================================================================
// GET - List groups or get suggestions
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const platform = searchParams.get('platform');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    // Get suggested groups for a niche
    if (action === 'suggestions' && niche) {
      const suggestions = SUGGESTED_GROUPS[niche] || [];
      const nicheConfig = NICHE_CONFIGS[niche];
      
      return NextResponse.json({
        success: true,
        data: {
          niche: nicheConfig?.name || niche,
          groups: suggestions,
          platforms: nicheConfig?.recommendedPlatforms || [],
          subreddits: nicheConfig?.recommendedSubreddits || [],
          facebookGroupTypes: nicheConfig?.facebookGroupTypes || [],
          tips: [
            'Start by joining 5-10 groups in your niche',
            'Observe for a few days before posting',
            'Read group rules carefully',
            'Never post the same content in multiple groups within 48 hours',
            'Engage genuinely before any self-promotion',
          ],
        },
      });
    }

    // Get all available niche suggestions
    if (action === 'all-suggestions') {
      const allSuggestions: Record<string, any> = {};
      for (const [slug, groups] of Object.entries(SUGGESTED_GROUPS)) {
        allSuggestions[slug] = {
          name: NICHE_CONFIGS[slug]?.name || slug,
          groupCount: groups.length,
          platforms: [...new Set(groups.map(g => g.platformSlug))],
        };
      }
      return NextResponse.json({ success: true, data: allSuggestions });
    }

    // Get user's tracked groups from database
    if (userId) {
      let query = supabase
        .from('community_groups')
        .select('*')
        .eq('added_by', userId);
      
      if (niche) {
        query = query.eq('niche_slug', niche);
      }
      if (platform) {
        query = query.eq('platform_slug', platform);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data || [],
        meta: {
          total: data?.length || 0,
          byPlatform: groupBy(data || [], 'platform_slug'),
          byNiche: groupBy(data || [], 'niche_slug'),
        },
      });
    }

    // Return API info
    return NextResponse.json({
      service: 'Community Groups API',
      description: 'Manage Facebook groups, subreddits, and other communities for marketing',
      endpoints: {
        'GET /api/groups?action=suggestions&niche=crochet': 'Get suggested groups for niche',
        'GET /api/groups?action=all-suggestions': 'Get all niche suggestions',
        'GET /api/groups?userId=X': 'Get user tracked groups',
        'GET /api/groups?userId=X&niche=Y': 'Filter by niche',
        'POST /api/groups': 'Add a group',
        'PUT /api/groups?id=X': 'Update group',
        'DELETE /api/groups?id=X': 'Remove group',
        'POST /api/groups?action=bulk-add': 'Add multiple groups',
        'POST /api/groups?action=log-post': 'Log a post to a group',
      },
      availableNiches: Object.keys(SUGGESTED_GROUPS),
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
// POST - Add groups
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // Bulk add groups
    if (action === 'bulk-add') {
      const { groups, userId } = body;
      
      if (!groups || !Array.isArray(groups) || !userId) {
        return NextResponse.json(
          { success: false, error: 'Groups array and userId required' },
          { status: 400 }
        );
      }

      const toInsert = groups.map((g: CommunityGroup) => ({
        platform_slug: g.platformSlug,
        name: g.name,
        url: g.url,
        member_count: g.memberCount,
        niche_slug: g.nicheSlug,
        activity_level: g.activityLevel,
        rules_summary: g.rulesSummary,
        allows_promotion: g.allowsPromotion,
        promotion_rules: g.promotionRules,
        best_posting_days: g.bestPostingDays,
        best_posting_times: g.bestPostingTimes,
        admin_strictness: g.adminStrictness,
        notes: g.notes,
        added_by: userId,
      }));

      const { data, error } = await supabase
        .from('community_groups')
        .insert(toInsert)
        .select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        message: `${data.length} groups added successfully`,
      });
    }

    // Log a post to a group
    if (action === 'log-post') {
      const { groupId, postContent, postUrl } = body;
      
      if (!groupId) {
        return NextResponse.json(
          { success: false, error: 'Group ID required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('community_groups')
        .update({ 
          last_posted_at: new Date().toISOString(),
          notes: postContent ? `Last post: ${postContent.slice(0, 100)}...` : undefined,
        })
        .eq('id', groupId);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Post logged successfully',
      });
    }

    // Add single group
    const {
      userId,
      platformSlug,
      name,
      url,
      memberCount,
      nicheSlug,
      activityLevel,
      rulesSummary,
      allowsPromotion,
      promotionRules,
      bestPostingDays,
      bestPostingTimes,
      adminStrictness,
      notes,
    } = body;

    if (!userId || !platformSlug || !name) {
      return NextResponse.json(
        { success: false, error: 'userId, platformSlug, and name required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('community_groups')
      .insert({
        platform_slug: platformSlug,
        name,
        url,
        member_count: memberCount,
        niche_slug: nicheSlug,
        activity_level: activityLevel,
        rules_summary: rulesSummary,
        allows_promotion: allowsPromotion,
        promotion_rules: promotionRules,
        best_posting_days: bestPostingDays,
        best_posting_times: bestPostingTimes,
        admin_strictness: adminStrictness,
        notes,
        added_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Group added successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Groups POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update group
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');
    
    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'Group ID required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    
    const { data, error } = await supabase
      .from('community_groups')
      .update({
        name: updates.name,
        url: updates.url,
        member_count: updates.memberCount,
        activity_level: updates.activityLevel,
        rules_summary: updates.rulesSummary,
        allows_promotion: updates.allowsPromotion,
        promotion_rules: updates.promotionRules,
        best_posting_days: updates.bestPostingDays,
        best_posting_times: updates.bestPostingTimes,
        admin_strictness: updates.adminStrictness,
        notes: updates.notes,
        last_activity_check: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Group updated successfully',
    });
  } catch (error) {
    console.error('Groups PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Remove group
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');
    
    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'Group ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('community_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Group removed successfully',
    });
  } catch (error) {
    console.error('Groups DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function groupBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const val = item[key] || 'unknown';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}
