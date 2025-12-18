// ============================================================================
// CR AUDIOVIZ AI - CENSUS API
// GET /api/census - Get demographics by ZIP code (Pro feature)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getCensusData } from '@/lib/free-apis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zipCode = searchParams.get('zip');
    const userTier = searchParams.get('tier') || 'free';

    // Validate ZIP code
    if (!zipCode) {
      return NextResponse.json(
        { error: 'ZIP code is required. Use ?zip=12345' },
        { status: 400 }
      );
    }

    if (!/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format. Must be 5 digits.' },
        { status: 400 }
      );
    }

    // Check tier for access (Census is a Pro feature)
    if (userTier === 'free') {
      return NextResponse.json({
        success: false,
        error: 'Census data is a Pro feature',
        upgradeRequired: true,
        preview: {
          zipCode,
          message: 'Upgrade to Pro to access detailed demographics including population, income, education, and industry data for any US ZIP code.',
          features: [
            'Population and household data',
            'Median income statistics',
            'Education levels',
            'Top industries in the area',
            'Homeownership rates',
            'Employment statistics',
          ],
        },
      });
    }

    // Fetch census data
    const data = await getCensusData(zipCode);

    if (!data) {
      return NextResponse.json(
        { 
          error: 'Unable to fetch census data for this ZIP code',
          zipCode,
          suggestion: 'The ZIP code may not have detailed census data available. Try a nearby ZIP code.',
        },
        { status: 404 }
      );
    }

    // Return formatted census data
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        marketingInsights: generateMarketingInsights(data),
      },
      source: 'US Census Bureau ACS 5-Year Estimates',
      lastUpdated: '2022',
    });
  } catch (error) {
    console.error('[Census API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch census data' },
      { status: 500 }
    );
  }
}

// Generate marketing insights from census data
function generateMarketingInsights(data: {
  population: number;
  medianIncome: number;
  medianAge: number;
  educationBachelorOrHigher: number;
  homeownershipRate: number;
  topIndustries: string[];
}) {
  const insights: string[] = [];

  // Population insights
  if (data.population > 50000) {
    insights.push('High population density - good for broad reach campaigns');
  } else if (data.population > 20000) {
    insights.push('Medium-sized market - local targeting recommended');
  } else {
    insights.push('Smaller community - hyper-local marketing effective');
  }

  // Income insights
  if (data.medianIncome > 100000) {
    insights.push('Affluent area - premium positioning viable');
  } else if (data.medianIncome > 60000) {
    insights.push('Middle-income market - value proposition important');
  } else {
    insights.push('Budget-conscious market - emphasize affordability');
  }

  // Age insights
  if (data.medianAge < 35) {
    insights.push('Younger demographic - digital-first marketing');
  } else if (data.medianAge > 50) {
    insights.push('Mature demographic - traditional + digital mix');
  } else {
    insights.push('Mixed age demographic - multi-channel approach');
  }

  // Education insights
  if (data.educationBachelorOrHigher > 40) {
    insights.push('Highly educated - detailed, informative content works');
  }

  // Homeownership
  if (data.homeownershipRate > 70) {
    insights.push('High homeownership - home services market opportunity');
  }

  return insights;
}

// POST /api/census - Batch lookup (Enterprise feature)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zipCodes, tier } = body;

    if (tier !== 'enterprise') {
      return NextResponse.json(
        { 
          error: 'Batch census lookup is an Enterprise feature',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    if (!zipCodes || !Array.isArray(zipCodes)) {
      return NextResponse.json(
        { error: 'zipCodes array is required' },
        { status: 400 }
      );
    }

    if (zipCodes.length > 25) {
      return NextResponse.json(
        { error: 'Maximum 25 ZIP codes per request' },
        { status: 400 }
      );
    }

    // Fetch all ZIP codes in parallel
    const results = await Promise.all(
      zipCodes.map(async (zip: string) => {
        const data = await getCensusData(zip);
        return { zipCode: zip, data };
      })
    );

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      successfulLookups: results.filter(r => r.data !== null).length,
    });
  } catch (error) {
    console.error('[Census API] Batch error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch request' },
      { status: 500 }
    );
  }
}
