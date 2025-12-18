// ============================================================================
// CR AUDIOVIZ AI - LAUNCH CHECKLIST API
// GET /api/launch - Get launch checklist and sites
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { LAUNCH_SITES, getLaunchSitesByPriority, getFreeLaunchSites, type LaunchSite } from '@/lib/free-apis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const priority = searchParams.get('priority') as LaunchSite['priority'] | null;
    const freeOnly = searchParams.get('free') === 'true';
    const category = searchParams.get('category');

    let sites = [...LAUNCH_SITES];

    // Filter by priority
    if (priority) {
      sites = getLaunchSitesByPriority(priority);
    }

    // Filter free only
    if (freeOnly) {
      sites = getFreeLaunchSites();
    }

    // Filter by category
    if (category) {
      sites = sites.filter(s => s.category === category);
    }

    // Group by priority for organized response
    const grouped = {
      must: sites.filter(s => s.priority === 'must'),
      should: sites.filter(s => s.priority === 'should'),
      nice: sites.filter(s => s.priority === 'nice'),
    };

    return NextResponse.json({
      success: true,
      sites,
      grouped,
      stats: {
        total: sites.length,
        must: grouped.must.length,
        should: grouped.should.length,
        nice: grouped.nice.length,
        free: sites.filter(s => s.costToFeature === 'Free' || s.costToFeature?.includes('Free')).length,
      },
      launchTips: [
        'Start preparing 2-3 weeks before launch day',
        'Build anticipation with a waitlist or early access',
        'Coordinate launch posts across all platforms',
        'Have team ready to respond to comments/questions all day',
        'Document everything for future launches',
      ],
    });
  } catch (error) {
    console.error('[Launch API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch launch data' },
      { status: 500 }
    );
  }
}

// POST /api/launch - Generate personalized launch checklist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productName, 
      productType, // 'saas', 'app', 'physical', 'content'
      targetAudience, // 'tech', 'business', 'consumer', 'creative'
      launchDate,
      budget,
    } = body;

    if (!productName) {
      return NextResponse.json(
        { error: 'productName is required' },
        { status: 400 }
      );
    }

    // Generate personalized checklist
    const checklist = generatePersonalizedChecklist(productType, targetAudience, budget);
    
    // Get relevant launch sites
    let recommendedSites = [...LAUNCH_SITES];
    
    // Filter based on product type and audience
    if (targetAudience === 'tech') {
      // Prioritize tech communities
      recommendedSites = recommendedSites.filter(s => 
        ['Hacker News', 'Product Hunt', 'Indie Hackers', 'Reddit'].some(name => s.name.includes(name))
      );
    } else if (targetAudience === 'business') {
      // Prioritize B2B platforms
      recommendedSites = recommendedSites.filter(s => 
        s.category === 'directory' || s.name.includes('LinkedIn')
      );
    }

    // If zero budget, only show free sites
    if (budget === 'zero') {
      recommendedSites = recommendedSites.filter(s => 
        s.costToFeature === 'Free' || s.costToFeature?.includes('Free')
      );
    }

    // Calculate launch timeline
    const timeline = generateLaunchTimeline(launchDate);

    return NextResponse.json({
      success: true,
      productName,
      checklist,
      recommendedSites: recommendedSites.slice(0, 10),
      timeline,
      proTips: getProTips(productType),
    });
  } catch (error) {
    console.error('[Launch API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate launch checklist' },
      { status: 500 }
    );
  }
}

function generatePersonalizedChecklist(
  productType: string,
  targetAudience: string,
  budget: string
): { category: string; items: { task: string; completed: boolean; priority: string }[] }[] {
  const checklist = [
    {
      category: 'Pre-Launch (2 Weeks Before)',
      items: [
        { task: 'Create landing page with email capture', completed: false, priority: 'high' },
        { task: 'Prepare 5-10 product screenshots/GIFs', completed: false, priority: 'high' },
        { task: 'Write launch announcement copy', completed: false, priority: 'high' },
        { task: 'Set up analytics tracking', completed: false, priority: 'medium' },
        { task: 'Create social media graphics', completed: false, priority: 'medium' },
        { task: 'Build email list of supporters', completed: false, priority: 'high' },
      ],
    },
    {
      category: 'Launch Day',
      items: [
        { task: 'Post on Product Hunt at 12:01 AM PST', completed: false, priority: 'high' },
        { task: 'Share on Twitter/X with launch thread', completed: false, priority: 'high' },
        { task: 'Post on LinkedIn', completed: false, priority: 'medium' },
        { task: 'Submit to Hacker News (Show HN)', completed: false, priority: 'high' },
        { task: 'Post in relevant Reddit communities', completed: false, priority: 'medium' },
        { task: 'Send email to supporters', completed: false, priority: 'high' },
        { task: 'Monitor and respond to all comments', completed: false, priority: 'high' },
      ],
    },
    {
      category: 'Post-Launch (Week 1)',
      items: [
        { task: 'Submit to directories (BetaList, SaaSHub)', completed: false, priority: 'medium' },
        { task: 'Reach out to relevant newsletters', completed: false, priority: 'medium' },
        { task: 'Collect and respond to feedback', completed: false, priority: 'high' },
        { task: 'Write launch retrospective blog post', completed: false, priority: 'low' },
        { task: 'Follow up with interested users', completed: false, priority: 'high' },
      ],
    },
  ];

  // Add product-specific tasks
  if (productType === 'saas') {
    checklist[0].items.push({ 
      task: 'Set up trial or freemium tier', 
      completed: false, 
      priority: 'high' 
    });
  }

  return checklist;
}

function generateLaunchTimeline(launchDate?: string): { date: string; milestone: string }[] {
  const launch = launchDate ? new Date(launchDate) : new Date();
  
  const timeline = [
    { offset: -14, milestone: 'Start pre-launch preparations' },
    { offset: -7, milestone: 'Finalize all launch materials' },
    { offset: -3, milestone: 'Schedule social media posts' },
    { offset: -1, milestone: 'Final review and testing' },
    { offset: 0, milestone: '🚀 LAUNCH DAY' },
    { offset: 1, milestone: 'Follow up on launch day engagement' },
    { offset: 7, milestone: 'Week 1 retrospective' },
    { offset: 14, milestone: 'Submit to remaining directories' },
  ];

  return timeline.map(t => {
    const date = new Date(launch);
    date.setDate(date.getDate() + t.offset);
    return {
      date: date.toISOString().split('T')[0],
      milestone: t.milestone,
    };
  });
}

function getProTips(productType: string): string[] {
  const tips = [
    'Launch on Tuesday, Wednesday, or Thursday for best engagement',
    'Have your team ready to answer questions within 5 minutes',
    'Thank EVERY person who comments or shares',
    'Don\'t ask directly for upvotes - it can get you disqualified',
    'Prepare responses to common questions in advance',
  ];

  if (productType === 'saas') {
    tips.push('Offer a special launch day discount or extended trial');
    tips.push('Have a demo video ready (under 2 minutes)');
  }

  return tips;
}
