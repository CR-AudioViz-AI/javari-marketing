// ============================================================================
// CR AUDIOVIZ AI - PLATFORMS API
// GET /api/platforms - Search and filter marketing platforms
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  PLATFORMS, 
  getPlatformsByCategory, 
  getPlatformsByTier, 
  searchPlatforms,
  getCravPlatforms,
  type PlatformCategory,
  type PlatformTier,
} from '@/config/platforms';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as PlatformCategory | null;
    const tier = searchParams.get('tier') as PlatformTier | null;
    const query = searchParams.get('q');
    const cravOnly = searchParams.get('crav') === 'true';

    let platforms = [...PLATFORMS];

    // Filter by category
    if (category) {
      platforms = getPlatformsByCategory(category);
    }

    // Filter by tier
    if (tier) {
      platforms = platforms.filter(p => p.tier === tier);
    }

    // Search by query
    if (query) {
      const searchResults = searchPlatforms(query);
      platforms = platforms.filter(p => searchResults.some(s => s.id === p.id));
    }

    // Filter CRAV only
    if (cravOnly) {
      platforms = platforms.filter(p => p.isCrav);
    }

    // Sort: FREE first, then CRAV highlighted, then budget, then premium
    platforms.sort((a, b) => {
      // Tier priority
      const tierOrder = { free: 0, budget: 1, premium: 2 };
      const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
      if (tierDiff !== 0) return tierDiff;
      
      // CRAV products first within same tier
      if (a.isCrav && !b.isCrav) return -1;
      if (!a.isCrav && b.isCrav) return 1;
      
      return 0;
    });

    // Get statistics
    const stats = {
      total: PLATFORMS.length,
      free: PLATFORMS.filter(p => p.tier === 'free').length,
      budget: PLATFORMS.filter(p => p.tier === 'budget').length,
      premium: PLATFORMS.filter(p => p.tier === 'premium').length,
      crav: getCravPlatforms().length,
    };

    return NextResponse.json({
      success: true,
      platforms,
      count: platforms.length,
      stats,
      filters: {
        category,
        tier,
        query,
        cravOnly,
      },
    });
  } catch (error) {
    console.error('[Platforms API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    );
  }
}

// POST /api/platforms - Get recommendations based on business needs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, goals, budget, channels } = body;

    let recommendations = [...PLATFORMS];

    // Filter by budget preference
    if (budget === 'zero') {
      recommendations = recommendations.filter(p => p.tier === 'free');
    } else if (budget === 'micro' || budget === 'small') {
      recommendations = recommendations.filter(p => p.tier === 'free' || p.tier === 'budget');
    }

    // Filter by channels if specified
    if (channels && channels.length > 0) {
      recommendations = recommendations.filter(p => 
        channels.some((c: string) => p.category.toLowerCase().includes(c.toLowerCase()))
      );
    }

    // Sort by relevance (CRAV first, then free, then alphabetical)
    recommendations.sort((a, b) => {
      if (a.isCrav && !b.isCrav) return -1;
      if (!a.isCrav && b.isCrav) return 1;
      if (a.tier === 'free' && b.tier !== 'free') return -1;
      if (a.tier !== 'free' && b.tier === 'free') return 1;
      return a.name.localeCompare(b.name);
    });

    // Limit recommendations
    const topRecommendations = recommendations.slice(0, 15);

    return NextResponse.json({
      success: true,
      recommendations: topRecommendations,
      totalMatches: recommendations.length,
      criteria: { industry, goals, budget, channels },
    });
  } catch (error) {
    console.error('[Platforms API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
