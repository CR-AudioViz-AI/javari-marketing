'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  BarChart3,
  Calendar,
  Filter,
  Download
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
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

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
    }
    
    // Demo data for now
    setAnalytics({
      totalPosts: 47,
      publishedPosts: 42,
      scheduledPosts: 5,
      failedPosts: 0,
      totalLikes: 1247,
      totalComments: 89,
      totalShares: 156,
      totalViews: 15420,
      engagementRate: 9.7,
      topPlatform: 'bluesky',
      topPost: { id: '1', content: '🚀 Big announcement coming...', engagement: 342 },
      postsByPlatform: {
        bluesky: 20,
        discord: 15,
        telegram: 12,
      },
    });
    
    setLoading(false);
  }

  const stats = [
    { label: 'Total Posts', value: analytics?.totalPosts || 0, icon: BarChart3, color: 'purple' },
    { label: 'Total Views', value: analytics?.totalViews || 0, icon: Eye, color: 'blue' },
    { label: 'Likes', value: analytics?.totalLikes || 0, icon: Heart, color: 'pink' },
    { label: 'Comments', value: analytics?.totalComments || 0, icon: MessageCircle, color: 'green' },
    { label: 'Shares', value: analytics?.totalShares || 0, icon: Share2, color: 'orange' },
    { label: 'Engagement Rate', value: `${analytics?.engagementRate || 0}%`, icon: TrendingUp, color: 'cyan' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">{stat.label}</span>
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
              <p className="text-2xl font-bold">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Posts by Platform */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Posts by Platform</h3>
            <div className="space-y-4">
              {Object.entries(analytics?.postsByPlatform || {}).map(([platform, count]) => {
                const total = Object.values(analytics?.postsByPlatform || {}).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{platformIcons[platform] || '📱'}</span>
                        <span className="capitalize">{platform}</span>
                      </div>
                      <span className="text-gray-400">{count} posts</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performing Post */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Top Performing Post</h3>
            {analytics?.topPost ? (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-lg mb-4">{analytics.topPost.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    {analytics.topPost.engagement} engagements
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No posts yet</p>
            )}
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Best Performing Platform</h4>
              {analytics?.topPlatform && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                    {platformIcons[analytics.topPlatform] || '📱'}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{analytics.topPlatform}</p>
                    <p className="text-sm text-gray-400">Highest engagement</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post Status Breakdown */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Post Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-green-400">{analytics?.publishedPosts || 0}</span>
                </div>
                <p className="text-sm text-gray-400">Published</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-blue-400">{analytics?.scheduledPosts || 0}</span>
                </div>
                <p className="text-sm text-gray-400">Scheduled</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-red-400">{analytics?.failedPosts || 0}</span>
                </div>
                <p className="text-sm text-gray-400">Failed</p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
            <h3 className="font-semibold mb-4">💡 Quick Tips</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Post consistently at peak hours for maximum engagement
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Use hashtags strategically - 3-5 relevant tags work best
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Engage with comments within the first hour of posting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Mix content types: text, images, and videos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
