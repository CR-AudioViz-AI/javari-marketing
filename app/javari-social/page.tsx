'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Zap,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Send,
  Hash,
  Image as ImageIcon,
  Link2,
  ChevronRight
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  max_platforms: number;
  max_posts_per_month: number;
}

interface Platform {
  name: string;
  display_name: string;
  icon: string;
  character_limit: number | null;
  auth_type: string;
}

interface Connection {
  id: string;
  platform_username: string;
  platform_display_name: string;
  status: string;
  platform: Platform;
}

interface Post {
  id: string;
  original_content: string;
  status: string;
  scheduled_for: string | null;
  target_platforms: string[];
  created_at: string;
}

const platformIcons: Record<string, string> = {
  twitter: '𝕏',
  facebook: 'f',
  instagram: '📸',
  linkedin: 'in',
  tiktok: '♪',
  youtube: '▶️',
  discord: '🎮',
  slack: '💬',
  telegram: '✈️',
  bluesky: '🦋',
  threads: '🧵',
  mastodon: '🐘',
  pinterest: '📌',
  reddit: '🤖',
  tumblr: '📝',
};

export default function JavariSocialDashboard() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);

  // Demo tenant ID for testing
  const DEMO_TENANT_ID = 'demo-tenant';

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Load platforms
      const platformsRes = await fetch('/api/javari-social/platforms');
      if (platformsRes.ok) {
        const data = await platformsRes.json();
        setPlatforms(data.platforms || []);
      }

      // For demo, we'll show sample data
      setTenant({
        id: DEMO_TENANT_ID,
        name: 'CR AudioViz AI',
        plan: 'trial',
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        max_platforms: 5,
        max_posts_per_month: 30,
      });
      
      setTrialDaysRemaining(10);
      
      // Sample connections
      setConnections([
        { id: '1', platform_username: '@craudiovizai', platform_display_name: 'CR AudioViz AI', status: 'active', platform: { name: 'bluesky', display_name: 'Bluesky', icon: 'bluesky', character_limit: 300, auth_type: 'api_key' } },
        { id: '2', platform_username: 'CR AudioViz AI', platform_display_name: 'CR AudioViz AI', status: 'active', platform: { name: 'discord', display_name: 'Discord', icon: 'discord', character_limit: 2000, auth_type: 'webhook' } },
      ]);
      
      // Sample posts
      setPosts([
        { id: '1', original_content: '🚀 Exciting news! Javari Social is live...', status: 'published', scheduled_for: null, target_platforms: ['bluesky', 'discord'], created_at: new Date().toISOString() },
        { id: '2', original_content: 'Check out our new AI-powered features...', status: 'scheduled', scheduled_for: new Date(Date.now() + 3600000).toISOString(), target_platforms: ['bluesky'], created_at: new Date().toISOString() },
      ]);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
    setLoading(false);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400';
      case 'scheduled': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'draft': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/50 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-xl">
                JS
              </div>
              <div>
                <h1 className="text-xl font-bold">Javari Social</h1>
                <p className="text-xs text-gray-400">Social Media Command Center</p>
              </div>
            </div>
            
            {/* Trial Banner */}
            {tenant?.plan === 'trial' && trialDaysRemaining !== null && (
              <div className="hidden md:flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">
                  {trialDaysRemaining} days left in trial
                </span>
                <button className="ml-2 px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded-md text-xs font-medium transition-colors">
                  Upgrade
                </button>
              </div>
            )}
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Post</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Connected</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{connections.length}<span className="text-gray-500 text-sm">/{tenant?.max_platforms}</span></p>
            <p className="text-xs text-gray-500">platforms</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Posts</span>
              <Send className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{posts.filter(p => p.status === 'published').length}<span className="text-gray-500 text-sm">/{tenant?.max_posts_per_month}</span></p>
            <p className="text-xs text-gray-500">this month</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Scheduled</span>
              <Calendar className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold">{posts.filter(p => p.status === 'scheduled').length}</p>
            <p className="text-xs text-gray-500">upcoming</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Engagement</span>
              <TrendingUp className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-gray-500">coming soon</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Posts */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-semibold">Recent Posts</h2>
                <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-800">
                {posts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No posts yet. Create your first post!</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`flex items-center gap-1 ${getStatusColor(post.status)}`}>
                          {getStatusIcon(post.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-2">{post.original_content}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              {post.target_platforms.map(p => (
                                <span key={p} title={p}>{platformIcons[p] || '📱'}</span>
                              ))}
                            </div>
                            <span>•</span>
                            <span className={getStatusColor(post.status)}>
                              {post.status === 'scheduled' && post.scheduled_for 
                                ? `Scheduled for ${new Date(post.scheduled_for).toLocaleDateString()}`
                                : post.status.charAt(0).toUpperCase() + post.status.slice(1)
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Compose */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h2 className="font-semibold mb-4">Quick Compose</h2>
              <textarea 
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors"
                rows={3}
                placeholder="What's on your mind? Write once, post everywhere..."
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Add image">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Add link">
                    <Link2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Add hashtags">
                    <Hash className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                    Schedule
                  </button>
                  <button className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    Post Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connected Platforms */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-semibold">Connected Platforms</h2>
                <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-800">
                {connections.map(conn => (
                  <div key={conn.id} className="p-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-lg">
                      {platformIcons[conn.platform.name] || '📱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conn.platform.display_name}</p>
                      <p className="text-xs text-gray-500 truncate">{conn.platform_username}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${conn.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} />
                  </div>
                ))}
                
                {connections.length < (tenant?.max_platforms || 5) && (
                  <button className="w-full p-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors text-gray-500 hover:text-gray-300">
                    <div className="w-8 h-8 border border-dashed border-gray-700 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Connect Platform</span>
                  </button>
                )}
              </div>
            </div>

            {/* Platform Limits */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h2 className="font-semibold mb-3">Platform Limits</h2>
              <div className="space-y-3">
                {platforms.slice(0, 5).map(platform => (
                  <div key={platform.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{platformIcons[platform.name] || '📱'}</span>
                      <span className="text-gray-400">{platform.display_name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {platform.character_limit ? `${platform.character_limit} chars` : 'No limit'}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-xs text-purple-400 hover:text-purple-300">
                View all platforms →
              </button>
            </div>

            {/* Upgrade CTA */}
            {tenant?.plan === 'trial' && (
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                <h3 className="font-semibold mb-2">Unlock Full Power</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Upgrade to Pro for unlimited posts, more platforms, and AI content generation.
                </p>
                <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Upgrade to Pro - $79/mo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
