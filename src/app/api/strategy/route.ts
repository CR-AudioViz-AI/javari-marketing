// ============================================================================
// CR AUDIOVIZ AI - MARKETING STRATEGY API
// POST /api/strategy - Generate AI marketing strategy
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateStrategy, trackStrategyGeneration, type StrategyRequest } from '@/lib/ai-strategy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['businessName', 'industry', 'goal', 'budget', 'channels'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Build strategy request
    const strategyRequest: StrategyRequest = {
      businessName: body.businessName,
      industry: body.industry,
      goal: body.goal,
      budget: body.budget,
      targetArea: body.targetArea || 'national',
      targetLocation: body.targetLocation,
      channels: body.channels,
      description: body.description,
    };

    console.log('[Strategy API] Generating strategy for:', strategyRequest.businessName);

    // Generate strategy using AI
    const strategy = await generateStrategy(strategyRequest);

    // Track generation (for analytics)
    const userId = body.userId || 'anonymous';
    await trackStrategyGeneration(userId, strategy.id, strategyRequest);

    return NextResponse.json({
      success: true,
      strategy,
      meta: {
        generatedAt: strategy.generatedAt,
        tier: body.userTier || 'free',
        creditsUsed: 1,
      },
    });
  } catch (error) {
    console.error('[Strategy API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate strategy', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/strategy - Get usage info
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  // Return usage info for the user
  return NextResponse.json({
    success: true,
    usage: {
      strategiesThisMonth: 0, // Would query from database
      limit: 3, // Free tier limit
      remaining: 3,
      tier: 'free',
    },
    features: {
      aiStrategy: true,
      censusLookup: false,
      exportPdf: false,
      savedStrategies: 5,
    },
  });
}
