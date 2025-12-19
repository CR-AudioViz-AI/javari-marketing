// ============================================================================
// CR AUDIOVIZ AI - CAMPAIGNS API
// Full CRUD + content generation + scheduling
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { CampaignManager, getMarketingRecommendations, NICHE_CONFIGS, CAMPAIGN_TEMPLATES } from '@/lib/campaign-engine';

const campaignManager = new CampaignManager();

// ============================================================================
// GET - List campaigns or get single campaign
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    // Get single campaign
    if (campaignId && !action) {
      const result = await campaignManager.getCampaign(campaignId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: result.data });
    }

    // Get campaign posts
    if (campaignId && action === 'posts') {
      const result = await campaignManager.getCampaignPosts(campaignId);
      return NextResponse.json(result);
    }

    // Get campaign analytics
    if (campaignId && action === 'analytics') {
      const result = await campaignManager.getCampaignAnalytics(campaignId);
      return NextResponse.json(result);
    }

    // List user campaigns
    if (userId) {
      const result = await campaignManager.getUserCampaigns(userId);
      return NextResponse.json(result);
    }

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

    // Get scheduled posts
    if (action === 'scheduled') {
      const result = await campaignManager.getScheduledPosts();
      return NextResponse.json(result);
    }

    // Get due posts (for cron execution)
    if (action === 'due') {
      const result = await campaignManager.getDuePostsForExecution();
      return NextResponse.json(result);
    }

    // Return API info
    return NextResponse.json({
      service: 'Campaign Management API',
      version: '2.0.0',
      endpoints: {
        'GET /api/campaigns?id=X': 'Get single campaign',
        'GET /api/campaigns?userId=X': 'List user campaigns',
        'GET /api/campaigns?id=X&action=posts': 'Get campaign posts',
        'GET /api/campaigns?id=X&action=analytics': 'Get campaign analytics',
        'GET /api/campaigns?action=niches': 'Get available niches',
        'GET /api/campaigns?action=templates': 'Get post templates',
        'GET /api/campaigns?action=scheduled': 'Get scheduled posts',
        'POST /api/campaigns': 'Create campaign',
        'POST /api/campaigns?action=recommend': 'Get platform recommendations',
        'POST /api/campaigns?action=generate': 'Generate posts for campaign',
        'POST /api/campaigns?action=schedule': 'Schedule a post',
        'PUT /api/campaigns?id=X': 'Update campaign',
        'DELETE /api/campaigns?id=X': 'Delete campaign',
      },
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
// POST - Create campaign, generate content, get recommendations
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

    // Generate posts for a campaign
    if (action === 'generate') {
      const { campaignId, count = 10, types = ['curiosity', 'value'], useAI = false } = body;
      
      if (!campaignId) {
        return NextResponse.json(
          { success: false, error: 'Campaign ID required' },
          { status: 400 }
        );
      }

      // Get campaign
      const campaignResult = await campaignManager.getCampaign(campaignId);
      if (!campaignResult.success || !campaignResult.data) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      // Generate posts
      const postsResult = await campaignManager.generatePosts(campaignResult.data, {
        count,
        types,
        useAI,
      });

      if (!postsResult.success) {
        return NextResponse.json(
          { success: false, error: postsResult.error },
          { status: 500 }
        );
      }

      // Optionally save drafts to database
      if (body.saveDrafts) {
        for (const post of postsResult.data || []) {
          await campaignManager.createPost(post);
        }
      }

      return NextResponse.json({
        success: true,
        data: postsResult.data,
        meta: {
          generated: postsResult.data?.length || 0,
          saved: body.saveDrafts ? true : false,
          types,
          aiGenerated: useAI,
        },
      });
    }

    // Schedule a post
    if (action === 'schedule') {
      const { postId, scheduledFor } = body;
      
      if (!postId || !scheduledFor) {
        return NextResponse.json(
          { success: false, error: 'Post ID and scheduledFor date required' },
          { status: 400 }
        );
      }

      const result = await campaignManager.schedulePost(postId, new Date(scheduledFor));
      return NextResponse.json(result);
    }

    // Create new campaign
    const {
      userId,
      name,
      description,
      businessNicheId,
      productName,
      productUrl,
      productDescription,
      campaignType = 'awareness',
      budget = 0,
      startDate,
      endDate,
      targetPlatforms = [],
      targetGroups = [],
      goals,
      settings,
    } = body;

    if (!userId || !name || !productName || !productDescription) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, name, productName, productDescription' },
        { status: 400 }
      );
    }

    const result = await campaignManager.createCampaign({
      userId,
      name,
      description,
      businessNicheId,
      productName,
      productUrl,
      productDescription,
      campaignType,
      status: 'draft',
      budget,
      startDate,
      endDate,
      targetPlatforms,
      targetGroups,
      goals,
      settings,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Campaign created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update campaign
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const result = await campaignManager.updateCampaign(campaignId, updates);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Campaign updated successfully',
    });
  } catch (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete campaign
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    const result = await campaignManager.deleteCampaign(campaignId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('Campaign deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
