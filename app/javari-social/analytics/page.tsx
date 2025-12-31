'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsSummary {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  failedPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
  engagementRate: number;
  topPlatform: string | null;
  topPost: { id: string; content: string; engagement: number } | null;
  postsByPlatform: Record<string, number>;
  engagementByDay: Array<{ date: string; engagement: number }>;
}

const platformIcons: Record<string, string> = {
  twitter: '𝕏',
  facebook: 'f',
  instagram: '📸',
  linkedin: 'in',
  discord: '🎮',
  slack: '💬',
  telegram: '✈️',
  bluesky: '🦋',
  mastodon: '🐘',
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/javari-social/analytics?tenantId=demo-tenant&period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.summary);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Set demo data
      setAnalytics({
        totalPosts: 24,
        publishedPosts: 20,
        scheduledPosts: 3,
        failedPosts: 1,
        totalLikes: 1247,
        totalComments: 89,
        totalShares: 156,
        totalViews: 15420,
        engagementRate: 9.67,
        topPlatform: 'bluesky',
        topPost: { id: '1', content: '🚀 Excited to announce our new AI features...', engagement: 342 },
        postsByPlatform: { bluesky: 12, discord: 8, telegram: 4 },
        engagementByDay: [
          { date: '2024-12-24', engagement: 120 },
          { date: '2024-12-25', engagement: 85 },
          { date: '2024-12-26', engagement: 210 },
          { date: '2024-12-27', engagement: 156 },
          { date: '2024-12-28', engagement: 298 },
          { date: '2024-12-29', engagement: 187 },
          { date: '2024-12-30', engagement: 436 },
        ],
      });
    }
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const maxEngagement = Math.max(...(analytics?.engagementByDay.map(d => d.engagement) || [1]));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/javari-social" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-400 mt-2">Track your social media performance</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 12%
              </span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics?.totalLikes || 0)}</p>
            <p className="text-sm text-gray-500">Total Likes</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 8%
              </span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics?.totalComments || 0)}</p>
            <p className="text-sm text-gray-500">Comments</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Share2 className="w-5 h-5 text-green-400" />
              <span className="text-xs text-red-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> 3%
              </span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics?.totalShares || 0)}</p>
            <p className="text-sm text-gray-500">Shares</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 24%
              </span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics?.totalViews || 0)}</p>
            <p className="text-sm text-gray-500">Impressions</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Engagement Chart */}
          <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Engagement Over Time</h2>
            <div className="h-48 flex items-end gap-1">
              {analytics?.engagementByDay.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(day.engagement / maxEngagement) * 100}%`, minHeight: '4px' }}
                    title={`${day.date}: ${day.engagement} engagements`}
                  />
                  <span className="text-xs text-gray-500 transform -rotate-45 origin-center">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <span>Engagement Rate: <span className="text-white font-medium">{analytics?.engagementRate}%</span></span>
              <span>{analytics?.totalPosts} posts this period</span>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4">By Platform</h2>
            <div className="space-y-4">
              {Object.entries(analytics?.postsByPlatform || {}).map(([platform, count]) => {
                const total = Object.values(analytics?.postsByPlatform || {}).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{platformIcons[platform] || '📱'}</span>
                        <span className="text-sm capitalize">{platform}</span>
                      </div>
                      <span className="text-sm text-gray-400">{count} posts</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {Object.keys(analytics?.postsByPlatform || {}).length === 0 && (
                <p className="text-center text-gray-500 py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Post */}
        {analytics?.topPost && (
          <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Top Performing Post</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-gray-300">{analytics.topPost.content}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className="text-purple-400 font-medium">{analytics.topPost.engagement} total engagements</span>
                  <span>•</span>
                  <span>Best performing in the last {period} days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post Status Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{analytics?.publishedPosts || 0}</p>
            <p className="text-sm text-gray-400">Published</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{analytics?.scheduledPosts || 0}</p>
            <p className="text-sm text-gray-400">Scheduled</p>
          </div>
          <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-400">{analytics?.totalPosts || 0}</p>
            <p className="text-sm text-gray-400">Total Posts</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{analytics?.failedPosts || 0}</p>
            <p className="text-sm text-gray-400">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
