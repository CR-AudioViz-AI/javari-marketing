// ============================================================================
// CR AUDIOVIZ AI - MARKETING COMMAND CENTER DASHBOARD
// Main landing page with strategy generator, platform finder, and launch tools
// ============================================================================

'use client';

import { useState } from 'react';
import { 
  Zap, Target, Rocket, TrendingUp, Users, DollarSign, 
  MapPin, Calendar, ArrowRight, Check, Star, Sparkles,
  BarChart3, Globe, Mail, Share2, Search, Play
} from 'lucide-react';

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'strategy' | 'platforms' | 'launch'>('strategy');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              100+ FREE Marketing Tools Inside
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
              <span className="text-white">Your AI-Powered</span>
              <br />
              <span className="gradient-text">Marketing Command Center</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto animate-slide-up stagger-1">
              Generate winning strategies, discover FREE platforms, and launch products 
              like a pro. All powered by AI, all in one place.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
              <button 
                onClick={() => setActiveTab('strategy')}
                className="btn-primary flex items-center gap-2 text-lg"
              >
                <Zap className="w-5 h-5" />
                Generate Free Strategy
              </button>
              <button 
                onClick={() => setActiveTab('platforms')}
                className="btn-secondary flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find FREE Platforms
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-slide-up stagger-3">
            <StatCard icon={<Globe />} value="100+" label="FREE Platforms" />
            <StatCard icon={<Zap />} value="AI" label="Strategy Generator" />
            <StatCard icon={<Rocket />} value="15+" label="Launch Sites" />
            <StatCard icon={<Users />} value="60+" label="CRAV Tools" />
          </div>
        </div>
      </section>

      {/* Main Tool Tabs */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
              <TabButton 
                active={activeTab === 'strategy'} 
                onClick={() => setActiveTab('strategy')}
                icon={<Zap className="w-4 h-4" />}
                label="AI Strategy"
              />
              <TabButton 
                active={activeTab === 'platforms'} 
                onClick={() => setActiveTab('platforms')}
                icon={<Globe className="w-4 h-4" />}
                label="Platform Finder"
              />
              <TabButton 
                active={activeTab === 'launch'} 
                onClick={() => setActiveTab('launch')}
                icon={<Rocket className="w-4 h-4" />}
                label="Launch Checklist"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'strategy' && <StrategyGenerator />}
            {activeTab === 'platforms' && <PlatformFinder />}
            {activeTab === 'launch' && <LaunchChecklist />}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Market Like a Pro
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              FREE tools and AI-powered features to help you grow, launch, and scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Target className="w-6 h-6" />}
              title="Area Targeting"
              description="Target customers by ZIP code with Census demographic data. Know your audience before you spend a dime."
              badge="Pro"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Market Research"
              description="Real-time trends from Reddit, Hacker News, and news sources. Stay ahead of the competition."
              badge="FREE"
            />
            <FeatureCard 
              icon={<Mail className="w-6 h-6" />}
              title="Email Strategy"
              description="AI-generated email campaigns with our Newsletter tool integration. Build and nurture your list."
              badge="FREE"
            />
            <FeatureCard 
              icon={<Share2 className="w-6 h-6" />}
              title="Social Strategy"
              description="Platform-specific content plans with optimal posting times. Grow your organic reach."
              badge="FREE"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="ROI Calculator"
              description="Estimate returns before you invest. Make data-driven marketing decisions."
              badge="FREE"
            />
            <FeatureCard 
              icon={<DollarSign className="w-6 h-6" />}
              title="Budget Optimizer"
              description="Always shows FREE options first. Only spend when you're ready to scale."
              badge="FREE"
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start FREE, Scale When Ready
            </h2>
            <p className="text-slate-400">
              No credit card required. Upgrade only when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard 
              name="Starter"
              price="Free"
              description="Everything you need to start"
              features={[
                '3 AI strategies/month',
                '100+ FREE platforms directory',
                '1 launch checklist',
                'State-level targeting',
                'Community support',
              ]}
            />
            <PricingCard 
              name="Pro"
              price="$19"
              period="/month"
              description="For serious marketers"
              popular
              features={[
                '50 AI strategies/month',
                'ZIP code targeting',
                'Census demographic data',
                'Unlimited launches',
                'Campaign analytics',
                'Priority support',
              ]}
            />
            <PricingCard 
              name="Enterprise"
              price="Custom"
              description="For agencies & teams"
              features={[
                'Unlimited everything',
                'White-label reports',
                'API access',
                'Dedicated manager',
                'Custom integrations',
                'SLA guarantee',
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// STRATEGY GENERATOR COMPONENT
// ============================================================================

function StrategyGenerator() {
  const [formData, setFormData] = useState({
    businessType: '',
    focus: 'awareness',
    budget: '0',
    timeline: '3 months',
    platforms: ['social'],
    area: 'national',
  });
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: formData.businessType || 'General Business',
          focus: formData.focus,
          budget: parseInt(formData.budget),
          timeline: formData.timeline,
          platforms: formData.platforms,
          area: { level: formData.area, value: 'US', name: 'United States' },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setStrategy(data.data);
      }
    } catch (error) {
      console.error('Strategy generation failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-emerald-500/10">
          <Zap className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Strategy Generator</h3>
          <p className="text-sm text-slate-400">Get a custom marketing plan in seconds</p>
        </div>
      </div>

      {!strategy ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What is your business?
              </label>
              <input 
                type="text"
                placeholder="e.g., SaaS startup, local bakery, consulting..."
                className="input-field"
                value={formData.businessType}
                onChange={(e) => setFormData({...formData, businessType: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What is your goal?
              </label>
              <select 
                className="select-field"
                value={formData.focus}
                onChange={(e) => setFormData({...formData, focus: e.target.value})}
              >
                <option value="awareness">Brand Awareness</option>
                <option value="leads">Lead Generation</option>
                <option value="sales">Direct Sales</option>
                <option value="retention">Customer Retention</option>
                <option value="launch">Product Launch</option>
                <option value="hiring">Recruitment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Monthly Budget
              </label>
              <select 
                className="select-field"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              >
                <option value="0">$0 - FREE only</option>
                <option value="100">Up to $100</option>
                <option value="500">Up to $500</option>
                <option value="1000">Up to $1,000</option>
                <option value="5000">$1,000+</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Timeline
              </label>
              <select 
                className="select-field"
                value={formData.timeline}
                onChange={(e) => setFormData({...formData, timeline: e.target.value})}
              >
                <option value="1 month">1 month sprint</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="12 months">12 months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Area
              </label>
              <select 
                className="select-field"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
              >
                <option value="national">National (USA)</option>
                <option value="state">State Level</option>
                <option value="zip">ZIP Code (Pro)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Channels (select multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {['social', 'email', 'content', 'seo', 'local', 'community'].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => {
                      const platforms = formData.platforms.includes(channel)
                        ? formData.platforms.filter(p => p !== channel)
                        : [...formData.platforms, channel];
                      setFormData({...formData, platforms});
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.platforms.includes(channel)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate FREE Strategy
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <StrategyResult strategy={strategy} onReset={() => setStrategy(null)} />
      )}
    </div>
  );
}

// ============================================================================
// STRATEGY RESULT COMPONENT
// ============================================================================

function StrategyResult({ strategy, onReset }: { strategy: any; onReset: () => void }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <h4 className="font-semibold text-emerald-400 mb-2">Strategy Summary</h4>
        <p className="text-slate-300">{strategy.summary}</p>
      </div>

      {/* Phases */}
      <div>
        <h4 className="font-semibold text-white mb-4">Implementation Phases</h4>
        <div className="space-y-3">
          {strategy.phases?.map((phase: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                  {phase.phase}
                </span>
                <div>
                  <h5 className="font-medium text-white">{phase.name}</h5>
                  <span className="text-sm text-slate-400">{phase.duration}</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 ml-11">{phase.milestone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Results */}
      <div>
        <h4 className="font-semibold text-white mb-4">Expected Results</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ResultCard label="Reach" value={strategy.expectedResults?.reach} />
          <ResultCard label="Engagement" value={strategy.expectedResults?.engagement} />
          <ResultCard label="Leads" value={strategy.expectedResults?.leads} />
          <ResultCard label="Conversions" value={strategy.expectedResults?.conversions} />
          <ResultCard label="ROI" value={strategy.expectedResults?.roi} />
          <ResultCard label="Timeframe" value={strategy.expectedResults?.timeframe} />
        </div>
      </div>

      {/* Cross-sell */}
      {strategy.crossSellRecommendations?.length > 0 && (
        <div>
          <h4 className="font-semibold text-white mb-4">Recommended CRAV Tools</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {strategy.crossSellRecommendations.slice(0, 4).map((rec: any, idx: number) => (
              <a 
                key={idx}
                href={rec.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10">
                  <Star className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-white truncate">{rec.productName}</h5>
                  <p className="text-xs text-slate-400 truncate">{rec.reason}</p>
                </div>
                <span className="text-xs font-medium text-emerald-400">FREE</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <button onClick={onReset} className="btn-secondary w-full">
        Generate Another Strategy
      </button>
    </div>
  );
}

// ============================================================================
// PLATFORM FINDER COMPONENT
// ============================================================================

function PlatformFinder() {
  const [filter, setFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('free');
  
  const platforms = [
    { name: 'Buffer (Free)', category: 'social', tier: 'free', description: 'Schedule posts to 3 social channels', crav: false },
    { name: 'CRAV Social Graphics ⭐', category: 'social', tier: 'free', description: 'AI-powered social media graphics', crav: true },
    { name: 'Mailchimp (Free)', category: 'email', tier: 'free', description: 'Up to 500 contacts, 1,000 emails/month', crav: false },
    { name: 'CRAV Newsletter ⭐', category: 'email', tier: 'free', description: 'AI-powered newsletter builder', crav: true },
    { name: 'Google Search Console', category: 'seo', tier: 'free', description: 'Official Google SEO tool', crav: false },
    { name: 'Google Business Profile', category: 'local', tier: 'free', description: 'Essential for local SEO', crav: false },
    { name: 'Medium', category: 'content', tier: 'free', description: 'Write to a built-in audience', crav: false },
    { name: 'Reddit', category: 'community', tier: 'free', description: 'Engage with niche communities', crav: false },
    { name: 'YouTube', category: 'video', tier: 'free', description: 'Worlds largest video platform', crav: false },
    { name: 'Product Hunt', category: 'launch', tier: 'free', description: '5M+ monthly visitors', crav: false },
  ];

  const filteredPlatforms = platforms.filter(p => {
    if (filter !== 'all' && p.category !== filter) return false;
    if (tierFilter === 'free' && p.tier !== 'free') return false;
    return true;
  });

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-cyan-500/10">
          <Globe className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Platform Finder</h3>
          <p className="text-sm text-slate-400">Discover 100+ marketing platforms (FREE first!)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Category:</label>
          <select 
            className="select-field py-2 px-3 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="social">Social Media</option>
            <option value="email">Email Marketing</option>
            <option value="seo">SEO</option>
            <option value="content">Content</option>
            <option value="local">Local</option>
            <option value="community">Community</option>
            <option value="video">Video</option>
            <option value="launch">Launch</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Pricing:</label>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button 
              onClick={() => setTierFilter('free')}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                tierFilter === 'free' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              FREE Only
            </button>
            <button 
              onClick={() => setTierFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                tierFilter === 'all' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              All Tiers
            </button>
          </div>
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredPlatforms.map((platform, idx) => (
          <div 
            key={idx}
            className={`platform-card tier-free ${platform.crav ? 'ring-1 ring-emerald-500/50' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white">{platform.name}</h4>
              <span className="badge-free px-2 py-0.5 rounded text-xs font-medium">FREE</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">{platform.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 capitalize">{platform.category}</span>
              {platform.crav && (
                <span className="text-xs text-emerald-400 font-medium">CRAV Tool</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <a href="/platforms" className="btn-secondary inline-flex items-center gap-2">
          View All 100+ Platforms
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// LAUNCH CHECKLIST COMPONENT
// ============================================================================

function LaunchChecklist() {
  const [productName, setProductName] = useState('');
  
  const launchPlatforms = [
    { name: 'Product Hunt', audience: '5M+ monthly', conversion: '2-5%', bestDay: 'Tuesday' },
    { name: 'Hacker News', audience: '10M+ monthly', conversion: '1-3%', bestDay: 'Tue-Thu' },
    { name: 'Indie Hackers', audience: '100K+ monthly', conversion: '3-8%', bestDay: 'Weekdays' },
    { name: 'Reddit', audience: '52M+ daily', conversion: '1-5%', bestDay: 'Tue-Thu' },
    { name: 'BetaList', audience: '40K+ subscribers', conversion: '5-15%', bestDay: 'Mon-Wed' },
    { name: 'Twitter/X', audience: '350M+ monthly', conversion: '0.5-2%', bestDay: 'Any' },
  ];

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-violet-500/10">
          <Rocket className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Launch Checklist Generator</h3>
          <p className="text-sm text-slate-400">All platforms are 100% FREE to submit</p>
        </div>
      </div>

      {/* Product Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          What are you launching?
        </label>
        <div className="flex gap-3">
          <input 
            type="text"
            placeholder="e.g., My Awesome App"
            className="input-field flex-1"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <button className="btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" />
            Generate Checklist
          </button>
        </div>
      </div>

      {/* Launch Platforms Preview */}
      <div>
        <h4 className="font-semibold text-white mb-4">FREE Launch Platforms</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {launchPlatforms.map((platform, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-white">{platform.name}</h5>
                <span className="text-xs font-medium text-emerald-400">FREE</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Audience</span>
                  <span className="text-slate-300">{platform.audience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Conversion</span>
                  <span className="text-emerald-400">{platform.conversion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Best Day</span>
                  <span className="text-slate-300">{platform.bestDay}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <h5 className="font-medium text-amber-400">Pro Tip</h5>
            <p className="text-sm text-slate-300">
              Tuesday-Thursday launches perform best on Product Hunt and Hacker News. 
              Start at 12:01 AM PST for maximum visibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="glass-card p-5 text-center">
      <div className="flex justify-center mb-3 text-emerald-400">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  badge 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  badge: string;
}) {
  return (
    <div className="glass-card p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
          {icon}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          badge === 'FREE' ? 'badge-free' : 'badge-budget'
        }`}>
          {badge}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  popular 
}: { 
  name: string; 
  price: string; 
  period?: string; 
  description: string; 
  features: string[]; 
  popular?: boolean;
}) {
  return (
    <div className={`glass-card p-6 relative ${popular ? 'ring-2 ring-emerald-500' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
          Most Popular
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          {period && <span className="text-slate-400">{period}</span>}
        </div>
        <p className="text-sm text-slate-400 mt-2">{description}</p>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-sm">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-xl font-medium transition-all ${
        popular 
          ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
      }`}>
        {price === 'Free' ? 'Get Started Free' : price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
      </button>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
