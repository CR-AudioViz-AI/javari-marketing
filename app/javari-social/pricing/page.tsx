'use client';

import { useState } from 'react';
import { 
  ArrowLeft,
  Check,
  Zap,
  Star,
  Building2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 29,
    yearlyPrice: 290,
    description: 'Perfect for individuals and small teams',
    icon: Zap,
    color: 'blue',
    features: [
      '5 social platforms',
      '100 posts per month',
      '25 AI generations',
      '3 campaigns',
      'Bulk upload (CSV)',
      '7 days analytics',
      '2 team members',
      'Email support',
    ],
    limits: {
      platforms: 5,
      posts: 100,
      ai: 25,
    },
  },
  {
    name: 'Pro',
    price: 79,
    yearlyPrice: 790,
    description: 'For growing businesses',
    icon: Star,
    color: 'purple',
    popular: true,
    features: [
      '12 social platforms',
      '500 posts per month',
      '100 AI generations',
      '10 campaigns',
      'RSS auto-posting',
      'Best time scheduling',
      '30 days analytics',
      '5 team members',
      'Priority support',
    ],
    limits: {
      platforms: 12,
      posts: 500,
      ai: 100,
    },
  },
  {
    name: 'Agency',
    price: 199,
    yearlyPrice: 1990,
    description: 'For agencies and enterprises',
    icon: Building2,
    color: 'pink',
    features: [
      'Unlimited platforms',
      '10,000 posts per month',
      '1,000 AI generations',
      '100 campaigns',
      'API access',
      'White-label option',
      '90 days analytics',
      '15 team members',
      'Dedicated support',
      'Custom integrations',
    ],
    limits: {
      platforms: 'Unlimited',
      posts: 10000,
      ai: 1000,
    },
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: string) {
    setLoading(plan);
    
    try {
      const res = await fetch('/api/javari-social/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          plan: plan.toLowerCase(),
          billingCycle,
          successUrl: `${window.location.origin}/javari-social?upgrade=success`,
          cancelUrl: `${window.location.origin}/javari-social/pricing?upgrade=cancelled`,
        }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch (error) {
      alert('Failed to start checkout');
    }

    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/javari-social" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade, downgrade, or cancel anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'monthly' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                billingCycle === 'yearly' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gray-900/50 border rounded-2xl p-6 ${
                plan.popular ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              
              <div className={`w-12 h-12 bg-${plan.color}-500/20 rounded-xl flex items-center justify-center mb-4`}>
                <plan.icon className={`w-6 h-6 text-${plan.color}-400`} />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'monthly' ? plan.price : Math.round(plan.yearlyPrice / 12)}
                </span>
                <span className="text-gray-400">/month</span>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${plan.yearlyPrice} billed annually
                  </p>
                )}
              </div>
              
              <button
                onClick={() => handleUpgrade(plan.name)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-medium transition-all mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
                    : 'bg-gray-800 hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                {loading === plan.name ? 'Loading...' : `Get ${plan.name}`}
              </button>
              
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Javari Social?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">$17,004</div>
              <p className="text-gray-400">Annual savings vs competitors</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">15+</div>
              <p className="text-gray-400">Platforms supported</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">24/7</div>
              <p className="text-gray-400">AI-powered support</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-gray-400 mb-4">
            Our team is here to help. Contact us anytime.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              Contact Sales
            </button>
            <button className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
