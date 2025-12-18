// ============================================================================
// CR AUDIOVIZ AI - CROSS-SELL API
// GET /api/cross-sell - Get CRAV product recommendations
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

// CR AudioViz AI Product Catalog
const CRAV_PRODUCTS = [
  // Creative Tools
  {
    id: 'social-graphics',
    name: 'Social Graphics Generator',
    category: 'creative',
    description: 'AI-powered social media graphics for all platforms',
    url: 'https://craudiovizai.com/tools/social-graphics',
    icon: 'image',
    tags: ['social', 'graphics', 'design', 'marketing'],
    pricing: 'Free tier available',
  },
  {
    id: 'video-creator',
    name: 'Video Creator',
    category: 'creative',
    description: 'Create professional videos with AI avatars',
    url: 'https://craudiovizai.com/tools/video-creator',
    icon: 'video',
    tags: ['video', 'avatar', 'content', 'marketing'],
    pricing: 'Free tier available',
  },
  {
    id: 'logo-maker',
    name: 'Logo Maker',
    category: 'creative',
    description: 'AI-generated logos for your brand',
    url: 'https://craudiovizai.com/tools/logo-maker',
    icon: 'palette',
    tags: ['logo', 'branding', 'design'],
    pricing: 'Free tier available',
  },
  {
    id: 'presentation-builder',
    name: 'Presentation Builder',
    category: 'creative',
    description: 'Create stunning presentations in minutes',
    url: 'https://craudiovizai.com/tools/presentation-builder',
    icon: 'presentation',
    tags: ['presentation', 'slides', 'business'],
    pricing: 'Free tier available',
  },

  // Writing Tools
  {
    id: 'blog-writer',
    name: 'Blog Writer',
    category: 'writing',
    description: 'AI blog content with SEO optimization',
    url: 'https://craudiovizai.com/tools/blog-writer',
    icon: 'file-text',
    tags: ['blog', 'content', 'seo', 'writing'],
    pricing: 'Free tier available',
  },
  {
    id: 'email-builder',
    name: 'Email Builder',
    category: 'writing',
    description: 'AI-powered email templates and copywriting',
    url: 'https://craudiovizai.com/tools/email-builder',
    icon: 'mail',
    tags: ['email', 'marketing', 'copywriting'],
    pricing: 'Free tier available',
  },
  {
    id: 'ad-copy-generator',
    name: 'Ad Copy Generator',
    category: 'writing',
    description: 'High-converting ad copy for any platform',
    url: 'https://craudiovizai.com/tools/ad-copy',
    icon: 'megaphone',
    tags: ['ads', 'copywriting', 'marketing', 'ppc'],
    pricing: 'Free tier available',
  },
  {
    id: 'product-descriptions',
    name: 'Product Description Writer',
    category: 'writing',
    description: 'Compelling product descriptions for e-commerce',
    url: 'https://craudiovizai.com/tools/product-descriptions',
    icon: 'shopping-bag',
    tags: ['ecommerce', 'product', 'copywriting'],
    pricing: 'Free tier available',
  },

  // Analytics & SEO
  {
    id: 'seo-analyzer',
    name: 'SEO Analyzer',
    category: 'analytics',
    description: 'AI-powered SEO audit and recommendations',
    url: 'https://craudiovizai.com/tools/seo-analyzer',
    icon: 'search',
    tags: ['seo', 'analytics', 'optimization'],
    pricing: 'Free tier available',
  },
  {
    id: 'keyword-research',
    name: 'Keyword Research Tool',
    category: 'analytics',
    description: 'Find high-value keywords for your content',
    url: 'https://craudiovizai.com/tools/keyword-research',
    icon: 'trending-up',
    tags: ['seo', 'keywords', 'research'],
    pricing: 'Free tier available',
  },
  {
    id: 'competitor-analyzer',
    name: 'Competitor Analyzer',
    category: 'analytics',
    description: 'Track and analyze competitor strategies',
    url: 'https://craudiovizai.com/tools/competitor-analyzer',
    icon: 'users',
    tags: ['competitors', 'research', 'strategy'],
    pricing: 'Pro feature',
  },

  // Business Tools
  {
    id: 'business-plan',
    name: 'Business Plan Generator',
    category: 'business',
    description: 'AI-generated business plans and pitches',
    url: 'https://craudiovizai.com/tools/business-plan',
    icon: 'briefcase',
    tags: ['business', 'planning', 'startup'],
    pricing: 'Free tier available',
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    category: 'business',
    description: 'Professional invoices in seconds',
    url: 'https://craudiovizai.com/tools/invoice-generator',
    icon: 'file-invoice',
    tags: ['invoice', 'business', 'finance'],
    pricing: 'Free tier available',
  },

  // Audio Tools
  {
    id: 'voice-over',
    name: 'AI Voice Over',
    category: 'audio',
    description: 'Professional voice overs in multiple languages',
    url: 'https://craudiovizai.com/tools/voice-over',
    icon: 'mic',
    tags: ['audio', 'voice', 'narration'],
    pricing: 'Free tier available',
  },
  {
    id: 'music-generator',
    name: 'Music Generator',
    category: 'audio',
    description: 'Royalty-free background music with AI',
    url: 'https://craudiovizai.com/tools/music-generator',
    icon: 'music',
    tags: ['music', 'audio', 'content'],
    pricing: 'Free tier available',
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',');
    const context = searchParams.get('context'); // Current tool being used
    const limit = parseInt(searchParams.get('limit') || '5');

    let recommendations = [...CRAV_PRODUCTS];

    // Filter by category
    if (category) {
      recommendations = recommendations.filter(p => p.category === category);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      recommendations = recommendations.filter(p =>
        tags.some(tag => p.tags.includes(tag.toLowerCase()))
      );
    }

    // If context provided, get related products
    if (context) {
      recommendations = getRelatedProducts(context);
    }

    // Limit results
    recommendations = recommendations.slice(0, limit);

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
      totalProducts: CRAV_PRODUCTS.length,
      categories: [...new Set(CRAV_PRODUCTS.map(p => p.category))],
    });
  } catch (error) {
    console.error('[Cross-sell API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// POST /api/cross-sell - Track cross-sell click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, sourceContext, userId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    // Log cross-sell click for analytics
    console.log('[Cross-sell] Click tracked:', {
      productId,
      sourceContext,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
    });

    // In production, this would save to Supabase
    // await supabase.from('cross_sell_clicks').insert({...})

    const product = CRAV_PRODUCTS.find(p => p.id === productId);

    return NextResponse.json({
      success: true,
      tracked: true,
      product: product ? {
        id: product.id,
        name: product.name,
        url: product.url,
      } : null,
    });
  } catch (error) {
    console.error('[Cross-sell API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

// Get related products based on context
function getRelatedProducts(context: string): typeof CRAV_PRODUCTS {
  const contextMappings: Record<string, string[]> = {
    'strategy': ['social-graphics', 'blog-writer', 'email-builder', 'ad-copy-generator'],
    'social': ['social-graphics', 'video-creator', 'ad-copy-generator'],
    'email': ['email-builder', 'ad-copy-generator', 'product-descriptions'],
    'seo': ['seo-analyzer', 'keyword-research', 'blog-writer'],
    'content': ['blog-writer', 'video-creator', 'social-graphics', 'presentation-builder'],
    'video': ['video-creator', 'voice-over', 'music-generator'],
    'local': ['seo-analyzer', 'social-graphics', 'business-plan'],
    'launch': ['social-graphics', 'video-creator', 'ad-copy-generator', 'email-builder'],
  };

  const relatedIds = contextMappings[context.toLowerCase()] || [];
  
  if (relatedIds.length === 0) {
    // Return top products if no specific mapping
    return CRAV_PRODUCTS.filter(p => p.pricing === 'Free tier available').slice(0, 5);
  }

  return CRAV_PRODUCTS.filter(p => relatedIds.includes(p.id));
}
