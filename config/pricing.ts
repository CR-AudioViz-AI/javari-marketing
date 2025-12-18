// ============================================================================
// CR AUDIOVIZ AI - MARKETING COMMAND CENTER PRICING
// Subscription tiers with FREE tier emphasis
// ============================================================================

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year' | 'forever';
  features: string[];
  limits: {
    strategiesPerMonth: number;
    censusLookups: number;
    aiCredits: number;
    savedStrategies: number;
    teamMembers: number;
  };
  stripePriceId?: string;
  popular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    interval: 'forever',
    features: [
      '3 AI strategies per month',
      'Access to 100+ FREE platforms',
      'Launch checklist generator',
      'Basic campaign templates',
      'Community support',
      'CRAV tool recommendations',
    ],
    limits: {
      strategiesPerMonth: 3,
      censusLookups: 0,
      aiCredits: 100,
      savedStrategies: 5,
      teamMembers: 1,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    interval: 'month',
    popular: true,
    features: [
      'Unlimited AI strategies',
      'ZIP-code demographics (Census API)',
      'Advanced competitor analysis',
      'Priority AI processing',
      'Export strategies to PDF',
      'Email support',
      'All Starter features',
    ],
    limits: {
      strategiesPerMonth: -1, // unlimited
      censusLookups: 100,
      aiCredits: 2000,
      savedStrategies: 50,
      teamMembers: 3,
    },
    stripePriceId: 'price_marketing_pro_monthly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited census lookups',
      'White-label reports',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SSO & team management',
      'Priority phone support',
    ],
    limits: {
      strategiesPerMonth: -1,
      censusLookups: -1,
      aiCredits: 10000,
      savedStrategies: -1,
      teamMembers: -1,
    },
    stripePriceId: 'price_marketing_enterprise_monthly',
  },
];

// Campaign goal options
export const CAMPAIGN_GOALS = [
  { id: 'awareness', label: 'Brand Awareness', icon: 'eye' },
  { id: 'leads', label: 'Lead Generation', icon: 'users' },
  { id: 'sales', label: 'Drive Sales', icon: 'shopping-cart' },
  { id: 'engagement', label: 'Community Engagement', icon: 'heart' },
  { id: 'launch', label: 'Product Launch', icon: 'rocket' },
  { id: 'retention', label: 'Customer Retention', icon: 'repeat' },
] as const;

// Industry options for strategy generation
export const INDUSTRIES = [
  'Technology / SaaS',
  'E-commerce / Retail',
  'Healthcare / Medical',
  'Finance / FinTech',
  'Education / EdTech',
  'Real Estate',
  'Food & Beverage',
  'Travel & Hospitality',
  'Professional Services',
  'Creative / Design',
  'Non-Profit / NGO',
  'Gaming / Entertainment',
  'Fitness / Wellness',
  'Automotive',
  'Other',
] as const;

// Budget ranges
export const BUDGET_RANGES = [
  { id: 'zero', label: '$0 (FREE only)', min: 0, max: 0 },
  { id: 'micro', label: '$1 - $100/mo', min: 1, max: 100 },
  { id: 'small', label: '$100 - $500/mo', min: 100, max: 500 },
  { id: 'medium', label: '$500 - $2,000/mo', min: 500, max: 2000 },
  { id: 'large', label: '$2,000 - $10,000/mo', min: 2000, max: 10000 },
  { id: 'enterprise', label: '$10,000+/mo', min: 10000, max: Infinity },
] as const;

// Get tier by ID
export function getTier(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === tierId);
}

// Check if user can perform action based on tier
export function canPerformAction(
  tierId: string,
  action: keyof PricingTier['limits'],
  currentUsage: number
): boolean {
  const tier = getTier(tierId);
  if (!tier) return false;
  
  const limit = tier.limits[action];
  if (limit === -1) return true; // unlimited
  return currentUsage < limit;
}
