'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Send,
  Calendar,
  Clock,
  Image as ImageIcon,
  Link2,
  Hash,
  Sparkles,
  Check,
  AlertCircle,
  X,
  ChevronDown,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Platform {
  name: string;
  display_name: string;
  character_limit: number | null;
  requires_media: boolean;
}

interface Connection {
  id: string;
  platform_name: string;
  platform_username: string;
  platform_display_name: string;
  status: string;
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

export default function ComposePage() {
  const [content, setContent] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load platforms
      const platformsRes = await fetch('/api/javari-social/platforms');
      if (platformsRes.ok) {
        const data = await platformsRes.json();
        setPlatforms(data.platforms || []);
      }

      // Demo connections
      setConnections([
        { id: '1', platform_name: 'bluesky', platform_username: '@craudiovizai', platform_display_name: 'CR AudioViz AI', status: 'active' },
        { id: '2', platform_name: 'discord', platform_username: 'CR AudioViz AI', platform_display_name: 'General Channel', status: 'active' },
        { id: '3', platform_name: 'telegram', platform_username: '@craudiovizai_bot', platform_display_name: 'CR AudioViz Updates', status: 'active' },
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  }

  function togglePlatform(platformName: string) {
    setSelectedPlatforms(prev => 
      prev.includes(platformName) 
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  }

  function getCharCount(platformName: string): { count: number; limit: number | null; exceeded: boolean } {
    const platform = platforms.find(p => p.name === platformName);
    const limit = platform?.character_limit || null;
    const count = content.length;
    return {
      count,
      limit,
      exceeded: limit ? count > limit : false,
    };
  }

  async function handleSubmit() {
    if (!content.trim() || selectedPlatforms.length === 0) {
      setResult({ type: 'error', message: 'Please enter content and select at least one platform' });
      return;
    }

    setPosting(true);
    setResult(null);

    try {
      // Create post
      const postRes = await fetch('/api/javari-social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          content: content,
          targetPlatforms: selectedPlatforms,
          scheduledFor: scheduleMode === 'schedule' && scheduleDate && scheduleTime 
            ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
            : null,
        }),
      });

      const postData = await postRes.json();

      if (!postData.success) {
        throw new Error(postData.error || 'Failed to create post');
      }

      // If posting now, publish immediately
      if (scheduleMode === 'now') {
        const publishRes = await fetch('/api/javari-social/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: postData.post.id,
            tenantId: 'demo-tenant',
          }),
        });

        const publishData = await publishRes.json();

        if (publishData.success) {
          const successCount = publishData.results?.filter((r: { success: boolean }) => r.success).length || 0;
          setResult({ 
            type: 'success', 
            message: `Posted to ${successCount} platform${successCount !== 1 ? 's' : ''} successfully!` 
          });
          setContent('');
          setSelectedPlatforms([]);
        } else {
          throw new Error(publishData.error || 'Failed to publish');
        }
      } else {
        setResult({ type: 'success', message: 'Post scheduled successfully!' });
        setContent('');
        setSelectedPlatforms([]);
      }

    } catch (error) {
      setResult({ type: 'error', message: String(error) });
    }

    setPosting(false);
  }

  async function generateWithAI() {
    // Placeholder for AI content generation
    setContent(prev => prev + '\n\n✨ AI-generated content coming soon! This feature will use Javari AI to help you write engaging posts.');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/javari-social" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="text-gray-400 mt-2">Write once, publish everywhere</p>
        </div>

        {/* Result Message */}
        {result && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            result.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {result.type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
            <span className={result.type === 'success' ? 'text-green-400' : 'text-red-400'}>{result.message}</span>
            <button onClick={() => setResult(null)} className="ml-auto text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Composer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Input */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Write your message here..."
                className="w-full bg-transparent border-none resize-none focus:outline-none text-lg min-h-[200px]"
              />
              
              {/* Toolbar */}
              <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Add image">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Add link">
                    <Link2 className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Add hashtags">
                    <Hash className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="w-px h-6 bg-gray-700 mx-2" />
                  <button 
                    onClick={generateWithAI}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">AI Assist</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>

            {/* Platform Character Counts */}
            {selectedPlatforms.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Character Limits</h3>
                <div className="space-y-2">
                  {selectedPlatforms.map(platformName => {
                    const { count, limit, exceeded } = getCharCount(platformName);
                    const platform = platforms.find(p => p.name === platformName);
                    return (
                      <div key={platformName} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{platformIcons[platformName] || '📱'}</span>
                          <span>{platform?.display_name || platformName}</span>
                        </div>
                        <span className={exceeded ? 'text-red-400' : 'text-gray-400'}>
                          {count}{limit ? `/${limit}` : ''}
                          {exceeded && ' ⚠️ Will be truncated'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Schedule Options */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">When to Post</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setScheduleMode('now')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    scheduleMode === 'now' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Post Now
                </button>
                <button
                  onClick={() => setScheduleMode('schedule')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    scheduleMode === 'schedule' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Schedule
                </button>
              </div>
              
              {scheduleMode === 'schedule' && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Platform Selection */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold">Select Platforms</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPlatforms.length} selected
                </p>
              </div>
              
              <div className="divide-y divide-gray-800">
                {connections.filter(c => c.status === 'active').map(conn => (
                  <button
                    key={conn.id}
                    onClick={() => togglePlatform(conn.platform_name)}
                    className={`w-full p-3 flex items-center gap-3 transition-colors ${
                      selectedPlatforms.includes(conn.platform_name)
                        ? 'bg-purple-500/10'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                      selectedPlatforms.includes(conn.platform_name)
                        ? 'bg-purple-500'
                        : 'bg-gray-800'
                    }`}>
                      {selectedPlatforms.includes(conn.platform_name) 
                        ? <Check className="w-4 h-4" />
                        : platformIcons[conn.platform_name] || '📱'
                      }
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{conn.platform_display_name}</p>
                      <p className="text-xs text-gray-500">{conn.platform_username}</p>
                    </div>
                  </button>
                ))}
                
                {connections.filter(c => c.status === 'active').length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-gray-500 text-sm mb-3">No platforms connected</p>
                    <Link 
                      href="/javari-social/connect"
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Connect a platform →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Post Button */}
            <button
              onClick={handleSubmit}
              disabled={posting || !content.trim() || selectedPlatforms.length === 0}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {scheduleMode === 'now' ? 'Posting...' : 'Scheduling...'}
                </span>
              ) : (
                <>
                  {scheduleMode === 'now' ? (
                    <><Send className="w-5 h-5 inline mr-2" /> Post to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}</>
                  ) : (
                    <><Calendar className="w-5 h-5 inline mr-2" /> Schedule Post</>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
