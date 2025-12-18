// ============================================================================
// CR AUDIOVIZ AI - AI STRATEGY GENERATOR
// Multi-AI routing: Groq (FREE) → Perplexity → OpenAI
// ============================================================================

import { INDUSTRIES, CAMPAIGN_GOALS, BUDGET_RANGES } from '@/config/pricing';
import { getCravPlatforms, getPlatformsByTier, type Platform } from '@/config/platforms';

export interface StrategyRequest {
  businessName: string;
  industry: string;
  goal: string;
  budget: string;
  targetArea: 'national' | 'state' | 'zip';
  targetLocation?: string;
  channels: string[];
  description?: string;
}

export interface MarketingStrategy {
  id: string;
  overview: string;
  channels: ChannelStrategy[];
  timeline: TimelinePhase[];
  budgetAllocation: BudgetItem[];
  quickWins: string[];
  cravRecommendations: Platform[];
  generatedAt: string;
}

export interface ChannelStrategy {
  channel: string;
  tactics: string[];
  platforms: string[];
  kpis: string[];
  estimatedCost: string;
}

export interface TimelinePhase {
  phase: string;
  duration: string;
  tasks: string[];
}

export interface BudgetItem {
  category: string;
  percentage: number;
  amount: string;
  tools: string[];
}

// AI Provider configuration
const AI_PROVIDERS = {
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-70b-versatile',
    priority: 1, // Try first (FREE)
  },
  perplexity: {
    name: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai',
    model: 'llama-3.1-sonar-large-128k-online',
    priority: 2,
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    priority: 3, // Fallback
  },
};

// Generate strategy prompt
function buildStrategyPrompt(request: StrategyRequest): string {
  const budgetInfo = BUDGET_RANGES.find(b => b.id === request.budget);
  const goalInfo = CAMPAIGN_GOALS.find(g => g.id === request.goal);
  
  return `You are an expert marketing strategist. Generate a comprehensive marketing strategy for this business.

BUSINESS DETAILS:
- Name: ${request.businessName}
- Industry: ${request.industry}
- Goal: ${goalInfo?.label || request.goal}
- Budget: ${budgetInfo?.label || request.budget}
- Target Area: ${request.targetArea}${request.targetLocation ? ` (${request.targetLocation})` : ''}
- Preferred Channels: ${request.channels.join(', ')}
${request.description ? `- Additional Context: ${request.description}` : ''}

CRITICAL REQUIREMENTS:
1. PRIORITIZE FREE TOOLS AND PLATFORMS - Always recommend free options before paid
2. Be specific with platform names and tactics
3. Include measurable KPIs for each channel
4. Create a realistic 90-day timeline
5. Budget allocation should match the ${budgetInfo?.label} range

Respond in this exact JSON format:
{
  "overview": "2-3 sentence executive summary",
  "channels": [
    {
      "channel": "Channel Name",
      "tactics": ["Specific tactic 1", "Specific tactic 2"],
      "platforms": ["Platform 1 (Free)", "Platform 2"],
      "kpis": ["KPI 1", "KPI 2"],
      "estimatedCost": "$X/month or FREE"
    }
  ],
  "timeline": [
    {
      "phase": "Phase name",
      "duration": "Week X-Y",
      "tasks": ["Task 1", "Task 2"]
    }
  ],
  "budgetAllocation": [
    {
      "category": "Category name",
      "percentage": 30,
      "amount": "$X/month",
      "tools": ["Tool 1", "Tool 2"]
    }
  ],
  "quickWins": ["Quick win 1", "Quick win 2", "Quick win 3"]
}`;
}

// Call AI provider
async function callAIProvider(
  provider: keyof typeof AI_PROVIDERS,
  prompt: string
): Promise<string | null> {
  const config = AI_PROVIDERS[provider];
  
  const apiKey = provider === 'groq' 
    ? process.env.GROQ_API_KEY
    : provider === 'perplexity'
    ? process.env.PERPLEXITY_API_KEY
    : process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log(`[AI Strategy] No API key for ${provider}`);
    return null;
  }

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert marketing strategist. Always respond with valid JSON only, no markdown.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.log(`[AI Strategy] ${provider} returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error(`[AI Strategy] ${provider} error:`, error);
    return null;
  }
}

// Main strategy generation function with fallback
export async function generateStrategy(request: StrategyRequest): Promise<MarketingStrategy> {
  const prompt = buildStrategyPrompt(request);
  
  // Try providers in priority order
  const providers: (keyof typeof AI_PROVIDERS)[] = ['groq', 'perplexity', 'openai'];
  let response: string | null = null;
  let usedProvider = '';

  for (const provider of providers) {
    console.log(`[AI Strategy] Trying ${provider}...`);
    response = await callAIProvider(provider, prompt);
    if (response) {
      usedProvider = provider;
      console.log(`[AI Strategy] Success with ${provider}`);
      break;
    }
  }

  if (!response) {
    // Return fallback strategy if all providers fail
    return generateFallbackStrategy(request);
  }

  // Parse JSON response
  try {
    // Clean up response (remove markdown if present)
    const cleanResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanResponse);
    
    // Add CRAV recommendations based on channels
    const cravRecommendations = getCravPlatforms().filter(p => 
      request.channels.some(c => p.category.includes(c.toLowerCase()))
    );

    return {
      id: `strategy_${Date.now()}`,
      overview: parsed.overview || 'Marketing strategy generated successfully.',
      channels: parsed.channels || [],
      timeline: parsed.timeline || [],
      budgetAllocation: parsed.budgetAllocation || [],
      quickWins: parsed.quickWins || [],
      cravRecommendations: cravRecommendations.slice(0, 5),
      generatedAt: new Date().toISOString(),
    };
  } catch (parseError) {
    console.error('[AI Strategy] Parse error:', parseError);
    return generateFallbackStrategy(request);
  }
}

// Fallback strategy when AI fails
function generateFallbackStrategy(request: StrategyRequest): MarketingStrategy {
  const freePlatforms = getPlatformsByTier('free');
  const cravPlatforms = getCravPlatforms();
  
  const channelStrategies: ChannelStrategy[] = request.channels.map(channel => {
    const relevantPlatforms = freePlatforms
      .filter(p => p.category === channel || p.name.toLowerCase().includes(channel))
      .slice(0, 3);
    
    return {
      channel: channel.charAt(0).toUpperCase() + channel.slice(1),
      tactics: [
        `Establish presence on ${channel} platforms`,
        'Create consistent posting schedule',
        'Engage with target audience daily',
        'Track and analyze performance metrics',
      ],
      platforms: relevantPlatforms.map(p => p.name),
      kpis: ['Engagement rate', 'Follower growth', 'Click-through rate'],
      estimatedCost: 'FREE (using free tier tools)',
    };
  });

  return {
    id: `strategy_fallback_${Date.now()}`,
    overview: `A ${request.budget === 'zero' ? 'zero-budget' : 'cost-effective'} marketing strategy for ${request.businessName} focused on ${request.goal} through ${request.channels.join(', ')} channels.`,
    channels: channelStrategies,
    timeline: [
      {
        phase: 'Foundation',
        duration: 'Week 1-2',
        tasks: [
          'Set up all free platform accounts',
          'Create brand guidelines and templates',
          'Audit existing online presence',
        ],
      },
      {
        phase: 'Launch',
        duration: 'Week 3-4',
        tasks: [
          'Begin consistent content posting',
          'Engage with target communities',
          'Set up tracking and analytics',
        ],
      },
      {
        phase: 'Growth',
        duration: 'Week 5-12',
        tasks: [
          'Optimize based on performance data',
          'Scale successful tactics',
          'Test new content formats',
        ],
      },
    ],
    budgetAllocation: [
      {
        category: 'Content Creation',
        percentage: 40,
        amount: 'FREE (using AI tools)',
        tools: ['Canva Free', 'CRAV Tools'],
      },
      {
        category: 'Platform Management',
        percentage: 30,
        amount: 'FREE',
        tools: ['Buffer Free', 'Later Free'],
      },
      {
        category: 'Analytics',
        percentage: 20,
        amount: 'FREE',
        tools: ['Google Analytics', 'Platform insights'],
      },
      {
        category: 'Reserve',
        percentage: 10,
        amount: 'Save for future scaling',
        tools: [],
      },
    ],
    quickWins: [
      'Claim Google Business Profile today',
      'Post first content piece this week',
      'Join 3 relevant online communities',
      'Set up email capture on website',
      'Create social media content calendar',
    ],
    cravRecommendations: cravPlatforms.slice(0, 5),
    generatedAt: new Date().toISOString(),
  };
}

// Track strategy generation for analytics
export async function trackStrategyGeneration(
  userId: string,
  strategyId: string,
  request: StrategyRequest
): Promise<void> {
  // This would log to Supabase analytics table
  console.log('[Analytics] Strategy generated:', {
    userId,
    strategyId,
    industry: request.industry,
    goal: request.goal,
    budget: request.budget,
    timestamp: new Date().toISOString(),
  });
}
