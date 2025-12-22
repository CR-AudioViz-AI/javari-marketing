// ============================================================================
// CR AUDIOVIZ AI - MARKETING COMMAND CENTER DASHBOARD
// Complete dashboard with all 9 API integrations
// Updated: Sunday, December 22, 2025 | 12:15 AM EST
// ============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Zap, Target, Rocket, TrendingUp, Users, DollarSign, 
  MapPin, Calendar, ArrowRight, Check, Star, Sparkles,
  BarChart3, Globe, Mail, Share2, Search, Play, RefreshCw,
  MessageSquare, Eye, Clock, Filter, ChevronDown, ExternalLink,
  Megaphone, UserPlus, Hash, AlertCircle, CheckCircle2, Loader2,
  Building, PieChart, Activity, Lightbulb, Send, Copy, Heart
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  niche: string;
  platforms: string[];
  posts: number;
  engagement: number;
  createdAt: string;
}

interface Opportunity {
  id: string;
  source: string;
  title: string;
  url: string;
  score: number;
  relevance: string;
  timestamp: string;
  suggestedResponse?: string;
}

interface Group {
  name: string;
  platform: string;
  url?: string;
  members?: string;
  activity?: string;
  relevance: string;
  strategy: string;
}

interface TrendData {
  keyword: string;
  volume: number;
  trend: 'rising' | 'stable' | 'declining';
  relatedTerms: string[];
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    'strategy' | 'campaigns' | 'opportunities' | 'groups' | 'platforms' | 'trends' | 'launch'
  >('strategy');

  const tabs = [
    { id: 'strategy', label: 'AI Strategy', icon: <Zap className="w-4 h-4" />, color: 'emerald' },
    { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="w-4 h-4" />, color: 'blue' },
    { id: 'opportunities', label: 'Opportunities', icon: <Eye className="w-4 h-4" />, color: 'amber' },
    { id: 'groups', label: 'Communities', icon: <Users className="w-4 h-4" />, color: 'purple' },
    { id: 'platforms', label: 'Platforms', icon: <Globe className="w-4 h-4" />, color: 'cyan' },
    { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" />, color: 'rose' },
    { id: 'launch', label: 'Launch', icon: <Rocket className="w-4 h-4" />, color: 'violet' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              9 Powerful Tools • All FREE APIs • Zero Cost Marketing
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Your AI-Powered</span>
              <br />
              <span className="gradient-text">Marketing Command Center</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Generate strategies, find opportunities, manage campaigns, and launch products. 
              All powered by AI, using 100% FREE APIs.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <QuickStat icon={<Globe />} value="100+" label="FREE Platforms" />
            <QuickStat icon={<Eye />} value="Live" label="Reddit/HN Monitor" />
            <QuickStat icon={<Users />} value="500+" label="Communities" />
            <QuickStat icon={<Zap />} value="AI" label="Strategy Engine" />
          </div>
        </div>
      </section>

      {/* Main Navigation Tabs */}
      <section className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-3 gap-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/25`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={activeTab === tab.id ? { 
                  backgroundColor: tab.color === 'emerald' ? '#10b981' :
                                   tab.color === 'blue' ? '#3b82f6' :
                                   tab.color === 'amber' ? '#f59e0b' :
                                   tab.color === 'purple' ? '#a855f7' :
                                   tab.color === 'cyan' ? '#06b6d4' :
                                   tab.color === 'rose' ? '#f43f5e' :
                                   tab.color === 'violet' ? '#8b5cf6' : '#10b981'
                } : {}}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {activeTab === 'strategy' && <StrategyGenerator />}
          {activeTab === 'campaigns' && <CampaignManager />}
          {activeTab === 'opportunities' && <OpportunityMonitor />}
          {activeTab === 'groups' && <CommunityFinder />}
          {activeTab === 'platforms' && <PlatformFinder />}
          {activeTab === 'trends' && <TrendAnalyzer />}
          {activeTab === 'launch' && <LaunchChecklist />}
        </div>
      </section>

      {/* Cross-Sell Footer */}
      <CrossSellSection />
    </div>
  );
}

// ============================================================================
// STRATEGY GENERATOR (API: /api/strategy)
// ============================================================================

function StrategyGenerator() {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    goal: 'awareness',
    budget: '0',
    timeline: '3 months',
    channels: ['social'],
  });
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.industry) {
      setError('Please fill in business name and industry');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          industry: formData.industry,
          goal: formData.goal,
          budget: parseInt(formData.budget),
          timeline: formData.timeline,
          channels: formData.channels,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStrategy(data.data);
      } else {
        setError(data.errors?.join(', ') || 'Strategy generation failed');
      }
    } catch (err) {
      setError('Network error - please try again');
    }
    
    setLoading(false);
  };

  return (
    <div className="glass-card p-8">
      <SectionHeader
        icon={<Zap className="w-6 h-6 text-emerald-400" />}
        title="AI Strategy Generator"
        subtitle="Get a custom marketing plan in seconds"
        color="emerald"
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!strategy ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InputField
              label="Business Name"
              placeholder="e.g., My Awesome Startup"
              value={formData.businessName}
              onChange={(v) => setFormData({ ...formData, businessName: v })}
            />
            
            <InputField
              label="Industry"
              placeholder="e.g., SaaS, E-commerce, Consulting..."
              value={formData.industry}
              onChange={(v) => setFormData({ ...formData, industry: v })}
            />
            
            <SelectField
              label="Campaign Goal"
              value={formData.goal}
              onChange={(v) => setFormData({ ...formData, goal: v })}
              options={[
                { value: 'awareness', label: 'Brand Awareness' },
                { value: 'leads', label: 'Lead Generation' },
                { value: 'sales', label: 'Direct Sales' },
                { value: 'retention', label: 'Customer Retention' },
                { value: 'launch', label: 'Product Launch' },
              ]}
            />
          </div>

          <div className="space-y-4">
            <SelectField
              label="Monthly Budget"
              value={formData.budget}
              onChange={(v) => setFormData({ ...formData, budget: v })}
              options={[
                { value: '0', label: '$0 - FREE only' },
                { value: '100', label: 'Up to $100' },
                { value: '500', label: 'Up to $500' },
                { value: '1000', label: 'Up to $1,000' },
                { value: '5000', label: '$1,000+' },
              ]}
            />
            
            <SelectField
              label="Timeline"
              value={formData.timeline}
              onChange={(v) => setFormData({ ...formData, timeline: v })}
              options={[
                { value: '1 month', label: '1 month sprint' },
                { value: '3 months', label: '3 months' },
                { value: '6 months', label: '6 months' },
                { value: '12 months', label: '12 months' },
              ]}
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Marketing Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {['social', 'email', 'content', 'seo', 'local', 'community'].map((channel) => (
                  <ToggleChip
                    key={channel}
                    label={channel.charAt(0).toUpperCase() + channel.slice(1)}
                    active={formData.channels.includes(channel)}
                    onClick={() => {
                      const channels = formData.channels.includes(channel)
                        ? formData.channels.filter(c => c !== channel)
                        : [...formData.channels, channel];
                      setFormData({ ...formData, channels });
                    }}
                  />
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
                  <Loader2 className="w-5 h-5 animate-spin" />
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

function StrategyResult({ strategy, onReset }: { strategy: any; onReset: () => void }) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <h4 className="font-semibold text-emerald-400 mb-2">Strategy Summary</h4>
        <p className="text-slate-300">{strategy.summary}</p>
      </div>

      {strategy.phases?.length > 0 && (
        <div>
          <h4 className="font-semibold text-white mb-4">Implementation Phases</h4>
          <div className="space-y-3">
            {strategy.phases.map((phase: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                    {phase.phase || idx + 1}
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
      )}

      {strategy.expectedResults && (
        <div>
          <h4 className="font-semibold text-white mb-4">Expected Results</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(strategy.expectedResults).map(([key, value]) => (
              <MetricCard key={key} label={key} value={String(value)} />
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
// CAMPAIGN MANAGER (API: /api/campaigns)
// ============================================================================

function CampaignManager() {
  const [niches, setNiches] = useState<string[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedNiche, setSelectedNiche] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const fetchCampaignData = async () => {
    try {
      // Fetch niches
      const nichesRes = await fetch('/api/campaigns?action=niches');
      const nichesData = await nichesRes.json();
      
      // Fetch templates
      const templatesRes = await fetch('/api/campaigns?action=templates');
      const templatesData = await templatesRes.json();
      
      setNiches(nichesData.niches || []);
      setTemplates(templatesData.templates || []);
    } catch (err) {
      console.error('Failed to fetch campaign data:', err);
    }
    setLoading(false);
  };

  const generateContent = async (niche: string) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/campaigns?action=recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      setGeneratedContent(data);
    } catch (err) {
      console.error('Failed to generate content:', err);
    }
    setGenerating(false);
  };

  if (loading) {
    return <LoadingState message="Loading campaign tools..." />;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <SectionHeader
          icon={<Megaphone className="w-6 h-6 text-blue-400" />}
          title="Campaign Manager"
          subtitle="Create and manage marketing campaigns for any niche"
          color="blue"
        />

        {/* Niche Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Select Your Niche
          </label>
          <div className="flex flex-wrap gap-2">
            {niches.map((niche) => (
              <button
                key={niche}
                onClick={() => {
                  setSelectedNiche(niche);
                  generateContent(niche);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedNiche === niche
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {niche.charAt(0).toUpperCase() + niche.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Recommendations */}
        {generating && <LoadingState message="Generating recommendations..." />}
        
        {generatedContent && !generating && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <h4 className="font-semibold text-blue-400 mb-2">
                Recommendations for {selectedNiche}
              </h4>
              <p className="text-slate-300">
                Best platforms and strategies for your niche based on audience data.
              </p>
            </div>

            {generatedContent.recommendations?.map((rec: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-white">{rec.platform}</h5>
                    <p className="text-sm text-slate-400 mt-1">{rec.strategy}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-medium">
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Templates */}
        <div className="mt-8">
          <h4 className="font-semibold text-white mb-4">Post Templates</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.slice(0, 6).map((template, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-slate-400">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-3">{template.template}</p>
                <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OPPORTUNITY MONITOR (API: /api/opportunities)
// ============================================================================

function OpportunityMonitor() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState('saas');
  const [keywords, setKeywords] = useState('');

  const niches = ['saas', 'crochet', 'scrapbooking', 'whiskey-bourbon', 'sports-cards'];

  const searchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedNiche) params.append('niche', selectedNiche);
      if (keywords) params.append('keywords', keywords);
      
      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchOpportunities();
  }, [selectedNiche]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <SectionHeader
          icon={<Eye className="w-6 h-6 text-amber-400" />}
          title="Opportunity Monitor"
          subtitle="Find marketing opportunities on Reddit & Hacker News"
          color="amber"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-300 mb-2">Niche</label>
            <div className="flex flex-wrap gap-2">
              {niches.map((niche) => (
                <ToggleChip
                  key={niche}
                  label={niche.replace('-', ' ')}
                  active={selectedNiche === niche}
                  onClick={() => setSelectedNiche(niche)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Custom Keywords
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="tool, app, help..."
                className="input-field flex-1"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <button onClick={searchOpportunities} className="btn-primary px-4">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <LoadingState message="Scanning Reddit & Hacker News..." />
        ) : opportunities.length > 0 ? (
          <div className="space-y-4">
            {opportunities.map((opp, idx) => (
              <OpportunityCard key={idx} opportunity={opp} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Eye className="w-12 h-12" />}
            title="No opportunities found"
            description="Try different keywords or check back later"
          />
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: any }) {
  const [copied, setCopied] = useState(false);

  const copyResponse = () => {
    if (opportunity.suggestedResponse) {
      navigator.clipboard.writeText(opportunity.suggestedResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              opportunity.source === 'reddit' 
                ? 'bg-orange-500/20 text-orange-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {opportunity.source}
            </span>
            <span className="text-xs text-slate-500">
              Score: {opportunity.score}/10
            </span>
          </div>
          
          <h4 className="font-medium text-white mb-2">{opportunity.title}</h4>
          
          {opportunity.suggestedResponse && (
            <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Suggested Response</span>
                <button 
                  onClick={copyResponse}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-slate-300">{opportunity.suggestedResponse}</p>
            </div>
          )}
        </div>
        
        <a 
          href={opportunity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
        >
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// COMMUNITY FINDER (API: /api/groups)
// ============================================================================

function CommunityFinder() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState('saas');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  const niches = ['crochet', 'scrapbooking', 'whiskey-bourbon', 'sports-cards', 'pokemon-cards', 'saas', 'freelancing'];
  const platforms = ['facebook-groups', 'reddit', 'linkedin', 'discord', 'twitter'];

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'suggestions',
        niche: selectedNiche,
      });
      if (selectedPlatform) params.append('platform', selectedPlatform);
      
      const res = await fetch(`/api/groups?${params.toString()}`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
    setLoading(false);
  }, [selectedNiche, selectedPlatform]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <SectionHeader
          icon={<Users className="w-6 h-6 text-purple-400" />}
          title="Community Finder"
          subtitle="Discover Facebook groups, subreddits, and communities for your niche"
          color="purple"
        />

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Niche</label>
            <div className="flex flex-wrap gap-2">
              {niches.map((niche) => (
                <ToggleChip
                  key={niche}
                  label={niche.replace('-', ' ')}
                  active={selectedNiche === niche}
                  onClick={() => setSelectedNiche(niche)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Platform Filter</label>
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                label="All Platforms"
                active={!selectedPlatform}
                onClick={() => setSelectedPlatform('')}
              />
              {platforms.map((platform) => (
                <ToggleChip
                  key={platform}
                  label={platform.replace('-', ' ')}
                  active={selectedPlatform === platform}
                  onClick={() => setSelectedPlatform(platform)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <LoadingState message="Finding communities..." />
        ) : groups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, idx) => (
              <GroupCard key={idx} group={group} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No communities found"
            description="Try a different niche or platform"
          />
        )}
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: any }) {
  const platformColors: Record<string, string> = {
    'facebook-groups': 'bg-blue-500/20 text-blue-400',
    'reddit': 'bg-orange-500/20 text-orange-400',
    'linkedin': 'bg-sky-500/20 text-sky-400',
    'discord': 'bg-indigo-500/20 text-indigo-400',
    'twitter': 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          platformColors[group.platform] || 'bg-white/10 text-slate-400'
        }`}>
          {group.platform?.replace('-', ' ')}
        </span>
        {group.members && (
          <span className="text-xs text-slate-500">{group.members}</span>
        )}
      </div>
      
      <h4 className="font-medium text-white mb-2 line-clamp-2">{group.name}</h4>
      
      {group.strategy && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{group.strategy}</p>
      )}
      
      <div className="flex items-center justify-between">
        {group.activity && (
          <span className="text-xs text-emerald-400">{group.activity}</span>
        )}
        {group.url && (
          <a 
            href={group.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Visit <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PLATFORM FINDER (API: /api/platforms)
// ============================================================================

function PlatformFinder() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('free');

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/platforms');
      const data = await res.json();
      setPlatforms(data.platforms || []);
    } catch (err) {
      console.error('Failed to fetch platforms:', err);
    }
    setLoading(false);
  };

  const categories = ['all', 'social', 'email', 'seo', 'content', 'local', 'community', 'video', 'launch'];

  const filteredPlatforms = platforms.filter(p => {
    if (filter !== 'all' && p.category !== filter) return false;
    if (tierFilter === 'free' && p.tier !== 'free') return false;
    return true;
  });

  if (loading) {
    return <LoadingState message="Loading platforms..." />;
  }

  return (
    <div className="glass-card p-8">
      <SectionHeader
        icon={<Globe className="w-6 h-6 text-cyan-400" />}
        title="Platform Directory"
        subtitle="Discover 100+ marketing platforms (FREE first!)"
        color="cyan"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <ToggleChip
                key={cat}
                label={cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                active={filter === cat}
                onClick={() => setFilter(cat)}
              />
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Pricing</label>
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlatforms.map((platform, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all ${
              platform.crav ? 'ring-1 ring-emerald-500/50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white">{platform.name}</h4>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                platform.tier === 'free' ? 'badge-free' : 'badge-budget'
              }`}>
                {platform.tier === 'free' ? 'FREE' : platform.price}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-3">{platform.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 capitalize">{platform.category}</span>
              {platform.crav && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> CRAV Tool
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPlatforms.length === 0 && (
        <EmptyState
          icon={<Globe className="w-12 h-12" />}
          title="No platforms found"
          description="Try adjusting your filters"
        />
      )}
    </div>
  );
}

// ============================================================================
// TREND ANALYZER (API: /api/trends)
// ============================================================================

function TrendAnalyzer() {
  const [keyword, setKeyword] = useState('');
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const searchTrends = async () => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setTrends(data);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    }
    setLoading(false);
  };

  const popularSearches = ['AI tools', 'remote work', 'cryptocurrency', 'sustainable living', 'side hustle'];

  return (
    <div className="glass-card p-8">
      <SectionHeader
        icon={<TrendingUp className="w-6 h-6 text-rose-400" />}
        title="Trend Analyzer"
        subtitle="Discover trending topics with Google Trends data"
        color="rose"
      />

      {/* Search */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter a keyword to analyze..."
            className="input-field flex-1"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchTrends()}
          />
          <button 
            onClick={searchTrends}
            disabled={loading || !keyword.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Analyze
          </button>
        </div>
        
        <div className="mt-3">
          <span className="text-xs text-slate-500">Popular searches: </span>
          {popularSearches.map((term, idx) => (
            <button
              key={idx}
              onClick={() => { setKeyword(term); }}
              className="text-xs text-cyan-400 hover:text-cyan-300 ml-2"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading && <LoadingState message="Analyzing trends..." />}
      
      {trends && !loading && (
        <div className="space-y-6">
          {trends.interestOverTime && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="font-semibold text-white mb-4">Interest Over Time</h4>
              <div className="h-32 flex items-end gap-1">
                {trends.interestOverTime.slice(-30).map((point: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex-1 bg-rose-500/50 rounded-t"
                    style={{ height: `${point.value}%` }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {trends.relatedQueries && (
            <div>
              <h4 className="font-semibold text-white mb-4">Related Queries</h4>
              <div className="flex flex-wrap gap-2">
                {trends.relatedQueries.map((query: any, idx: number) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-white/5 text-sm text-slate-300 border border-white/10"
                  >
                    {query.query}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!trends && !loading && (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12" />}
          title="Search for trends"
          description="Enter a keyword above to see trending data"
        />
      )}
    </div>
  );
}

// ============================================================================
// LAUNCH CHECKLIST (API: /api/launch)
// ============================================================================

function LaunchChecklist() {
  const [productName, setProductName] = useState('');
  const [launchData, setLaunchData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateChecklist = async () => {
    if (!productName.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName }),
      });
      const data = await res.json();
      setLaunchData(data);
    } catch (err) {
      console.error('Failed to generate checklist:', err);
    }
    setLoading(false);
  };

  const launchPlatforms = [
    { name: 'Product Hunt', audience: '5M+ monthly', conversion: '2-5%', bestDay: 'Tuesday', free: true },
    { name: 'Hacker News', audience: '10M+ monthly', conversion: '1-3%', bestDay: 'Tue-Thu', free: true },
    { name: 'Indie Hackers', audience: '100K+ monthly', conversion: '3-8%', bestDay: 'Weekdays', free: true },
    { name: 'Reddit', audience: '52M+ daily', conversion: '1-5%', bestDay: 'Tue-Thu', free: true },
    { name: 'BetaList', audience: '40K+ subscribers', conversion: '5-15%', bestDay: 'Mon-Wed', free: true },
    { name: 'Twitter/X', audience: '350M+ monthly', conversion: '0.5-2%', bestDay: 'Any', free: true },
  ];

  return (
    <div className="glass-card p-8">
      <SectionHeader
        icon={<Rocket className="w-6 h-6 text-violet-400" />}
        title="Launch Checklist Generator"
        subtitle="All platforms are 100% FREE to submit"
        color="violet"
      />

      {/* Product Input */}
      <div className="mb-8">
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
          <button 
            onClick={generateChecklist}
            disabled={loading || !productName.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Generate Checklist
          </button>
        </div>
      </div>

      {/* Generated Checklist */}
      {launchData && (
        <div className="mb-8 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <h4 className="font-semibold text-violet-400 mb-3">Your Launch Plan for {productName}</h4>
          {launchData.checklist?.map((item: any, idx: number) => (
            <div key={idx} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-400">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm text-white">{item.task}</p>
                <p className="text-xs text-slate-400">{item.timing}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Launch Platforms */}
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

      {/* Pro Tip */}
      <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5" />
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
// CROSS-SELL SECTION
// ============================================================================

function CrossSellSection() {
  const tools = [
    { name: 'Logo Generator', desc: 'AI-powered logo design', icon: <Star />, free: true },
    { name: 'Newsletter Builder', desc: 'Create email campaigns', icon: <Mail />, free: true },
    { name: 'Social Graphics', desc: 'Design social media posts', icon: <Share2 />, free: true },
    { name: 'Website Builder', desc: 'Build landing pages', icon: <Globe />, free: true },
  ];

  return (
    <section className="py-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            More FREE Tools from CR AudioViz AI
          </h2>
          <p className="text-slate-400">
            60+ professional tools to grow your business
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          {tools.map((tool, idx) => (
            <a
              key={idx}
              href="https://craudiovizai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  {tool.icon}
                </div>
                <span className="text-xs font-medium text-emerald-400">FREE</span>
              </div>
              <h4 className="font-medium text-white">{tool.name}</h4>
              <p className="text-xs text-slate-400">{tool.desc}</p>
            </a>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a 
            href="https://craudiovizai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
          >
            Explore all 60+ tools <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SectionHeader({ 
  icon, 
  title, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-3 rounded-xl bg-${color}-500/10`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="flex justify-center mb-2 text-emerald-400">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function InputField({ 
  label, 
  placeholder, 
  value, 
  onChange 
}: { 
  label: string; 
  placeholder: string; 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({ 
  label, 
  value, 
  onChange, 
  options 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <select 
        className="select-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleChip({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-emerald-500 text-white'
          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
      <div className="text-lg font-bold text-white capitalize">{value}</div>
      <div className="text-xs text-slate-400 capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</div>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
      <p className="text-slate-400">{message}</p>
    </div>
  );
}

function EmptyState({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      {icon}
      <h4 className="text-lg font-medium text-slate-300 mt-4">{title}</h4>
      <p className="text-sm">{description}</p>
    </div>
  );
}
