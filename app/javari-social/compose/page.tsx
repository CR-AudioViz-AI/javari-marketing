'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Calendar, 
  Image as ImageIcon,
  Link2,
  Hash,
  Sparkles,
  AlertCircle,
  Check,
  X,
  Clock,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Platform {
  name: string;
  display_name: string;
  character_limit: number | null;
  media_required: boolean;
  limit_explanation: string;
}

interface Connection {
  id: string;
  platform_name: string;
  platform_username: string;
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
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Check for warnings based on content and selected platforms
    const newWarnings: string[] = [];
    
    for (const platformName of selectedPlatforms) {
      const platform = platforms.find(p => p.name === platformName);
      if (platform) {
        if (platform.character_limit && content.length > platform.character_limit) {
          newWarnings.push(`${platform.display_name}: Content exceeds ${platform.character_limit} character limit`);
        }
        if (platform.media_required && !content.includes('http')) {
          newWarnings.push(`${platform.display_name}: Requires image or video`);
        }
      }
    }
    
    setWarnings(newWarnings);
  }, [content, selectedPlatforms, platforms]);

  async function loadData() {
    try {
      // Load platforms
      const platformsRes = await fetch('/api/javari-social/platforms');
      if (platformsRes.ok) {
        const data = await platformsRes.json();
        setPlatforms(data.platforms || []);
      }

      // Load connections (demo data)
      setConnections([
        { id: '1', platform_name: 'bluesky', platform_username: '@craudiovizai', status: 'active' },
        { id: '2', platform_name: 'discord', platform_username: 'CR AudioViz AI', status: 'active' },
        { id: '3', platform_name: 'telegram', platform_username: '@craudioviz_channel', status: 'active' },
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  function togglePlatform(platformName: string) {
    setSelectedPlatforms(prev => 
      prev.includes(platformName)
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  }

  function getCharacterCount(platformName: string): { current: number; max: number | null; color: string } {
    const platform = platforms.find(p => p.name === platformName);
    const max = platform?.character_limit || null;
    const current = content.length;
    
    let color = 'text-gray-400';
    if (max) {
      const ratio = current / max;
      if (ratio > 1) color = 'text-red-400';
      else if (ratio > 0.9) color = 'text-yellow-400';
      else if (ratio > 0.7) color = 'text-blue-400';
    }
    
    return { current, max, color };
  }

  async function handlePost() {
    if (!content.trim() || selectedPlatforms.length === 0) return;
    
    setPosting(true);
    
    try {
      // Create post
      const postRes = await fetch('/api/javari-social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant',
          originalContent: content,
          targetPlatforms: selectedPlatforms,
          scheduledFor: isScheduled && scheduleDate && scheduleTime 
            ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
            : null,
        }),
      });

      const postData = await postRes.json();

      if (postData.success && !isScheduled) {
        // Publish immediately
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
          alert('Posted successfully!');
          setContent('');
          setSelectedPlatforms([]);
        } else {
          alert('Failed to post: ' + (publishData.error || 'Unknown error'));
        }
      } else if (postData.success && isScheduled) {
        alert('Post scheduled successfully!');
        setContent('');
        setSelectedPlatforms([]);
        setIsScheduled(false);
        setScheduleDate('');
        setScheduleTime('');
      } else {
        alert('Failed to create post: ' + (postData.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + String(error));
    }
    
    setPosting(false);
  }

  const connectedPlatformNames = connections.filter(c => c.status === 'active').map(c => c.platform_name);

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
          <p className="text-gray-400 mt-2">Write once, publish everywhere.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Editor */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Write your content here..."
                className="w-full bg-transparent border-none resize-none focus:outline-none text-lg min-h-[200px]"
                rows={6}
              />
              
              {/* Toolbar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
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
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1" title="AI assist">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-purple-400">AI</span>
                  </button>
                </div>
                <span className="text-sm text-gray-500">{content.length} characters</span>
              </div>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-400 mb-2">Platform Warnings</p>
                    <ul className="space-y-1">
                      {warnings.map((warning, i) => (
                        <li key={i} className="text-sm text-gray-400">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Option */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">Schedule Post</span>
                </div>
                <button
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`w-12 h-6 rounded-full transition-colors ${isScheduled ? 'bg-purple-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isScheduled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              
              {isScheduled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Time</label>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Select Platforms */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-4">Select Platforms</h3>
              <div className="space-y-2">
                {connections.filter(c => c.status === 'active').map(conn => {
                  const isSelected = selectedPlatforms.includes(conn.platform_name);
                  const charInfo = getCharacterCount(conn.platform_name);
                  
                  return (
                    <button
                      key={conn.id}
                      onClick={() => togglePlatform(conn.platform_name)}
                      className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-500/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                          {platformIcons[conn.platform_name] || '📱'}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{conn.platform_username}</p>
                          <p className={`text-xs ${charInfo.color}`}>
                            {charInfo.max ? `${charInfo.current}/${charInfo.max}` : 'No limit'}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
                
                {connections.filter(c => c.status === 'active').length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="mb-2">No platforms connected</p>
                    <Link href="/javari-social/connect" className="text-purple-400 hover:text-purple-300 text-sm">
                      Connect platforms →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>

            {/* Post Button */}
            <button
              onClick={handlePost}
              disabled={!content.trim() || selectedPlatforms.length === 0 || posting}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isScheduled ? 'Scheduling...' : 'Posting...'}
                </>
              ) : (
                <>
                  {isScheduled ? <Clock className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  {isScheduled ? 'Schedule Post' : 'Post Now'}
                </>
              )}
            </button>

            {/* Selection Summary */}
            {selectedPlatforms.length > 0 && (
              <p className="text-center text-sm text-gray-400">
                Posting to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
