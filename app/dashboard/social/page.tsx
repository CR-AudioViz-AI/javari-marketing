'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Clock, Calendar, Hash, Image, Link2, Users,
  Settings, BarChart3, MessageSquare, Repeat2, Heart,
  Eye, Share2, TrendingUp, Plus, Trash2, Edit3,
  Check, X, AlertCircle, Loader2, RefreshCw, Filter,
  ChevronDown, ChevronRight, ExternalLink, Copy,
  Facebook, Instagram, Twitter, Linkedin, Youtube,
  Sparkles, Zap, Target, Megaphone, Globe
} from 'lucide-react';

// Platform Icons Component
const PlatformIcon = ({ platform, size = 20 }: { platform: string; size?: number }) => {
  const icons: Record<string, React.ReactNode> = {
    facebook: <Facebook size={size} className="text-[#1877F2]" />,
    instagram: <Instagram size={size} className="text-[#E4405F]" />,
    twitter: <Twitter size={size} className="text-[#1DA1F2]" />,
    linkedin: <Linkedin size={size} className="text-[#0A66C2]" />,
    youtube: <Youtube size={size} className="text-[#FF0000]" />,
  };
  return icons[platform] || <Globe size={size} className="text-gray-400" />;
};

// Types
interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  profileImage: string;
  isActive: boolean;
  followers: number;
  lastSync: string;
}

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledFor: string;
  status: 'pending' | 'published' | 'failed';
  media?: string[];
}

interface HashtagSet {
  id: string;
  name: string;
  hashtags: string[];
  category: string;
}

// Character limits by platform
const CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  threads: 500,
  mastodon: 500,
  bluesky: 300,
};

export default function SocialCommandCenter() {
  // State
  const [activeTab, setActiveTab] = useState<'compose' | 'scheduled' | 'analytics' | 'accounts' | 'communities'>('compose');
  const [content, setContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [hashtagSets, setHashtagSets] = useState<HashtagSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load accounts
      const accountsRes = await fetch('/api/social/accounts');
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.accounts || []);
      }

      // Load scheduled posts
      const scheduleRes = await fetch('/api/social/schedule');
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        setScheduledPosts(scheduleData.posts || []);
      }

      // Sample hashtag sets (would come from API)
      setHashtagSets([
        { id: '1', name: 'AI Tools', hashtags: ['#AI', '#MachineLearning', '#Automation', '#Tech', '#Innovation'], category: 'Tech' },
        { id: '2', name: 'Startup', hashtags: ['#Startup', '#Entrepreneur', '#Business', '#Founder', '#SaaS'], category: 'Business' },
        { id: '3', name: 'Real Estate', hashtags: ['#RealEstate', '#Property', '#Investing', '#HomeOwnership', '#Realtor'], category: 'Industry' },
        { id: '4', name: 'Content Creator', hashtags: ['#Creator', '#ContentCreator', '#Influencer', '#SocialMedia', '#Marketing'], category: 'Creator' },
      ]);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate character count for selected platforms
  const getCharLimit = useCallback(() => {
    if (selectedAccounts.length === 0) return 280; // Default to Twitter limit
    const platforms = accounts
      .filter(a => selectedAccounts.includes(a.id))
      .map(a => a.platform);
    return Math.min(...platforms.map(p => CHAR_LIMITS[p] || 5000));
  }, [selectedAccounts, accounts]);

  const charLimit = getCharLimit();
  const charCount = content.length;
  const isOverLimit = charCount > charLimit;

  // Toggle account selection
  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  // Add hashtag set
  const addHashtagSet = (set: HashtagSet) => {
    const newHashtags = set.hashtags.filter(h => !selectedHashtags.includes(h));
    setSelectedHashtags(prev => [...prev, ...newHashtags]);
    setContent(prev => prev + ' ' + newHashtags.join(' '));
  };

  // Remove hashtag
  const removeHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => prev.filter(h => h !== hashtag));
    setContent(prev => prev.replace(hashtag, '').replace(/\s+/g, ' ').trim());
  };

  // Post now
  const handlePostNow = async () => {
    if (!content.trim() || selectedAccounts.length === 0) {
      setError('Please add content and select at least one account');
      return;
    }

    if (isOverLimit) {
      setError(`Content exceeds character limit (${charCount}/${charLimit})`);
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          accountIds: selectedAccounts,
          linkUrl: linkUrl || undefined,
          hashtags: selectedHashtags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post');
      }

      const result = await response.json();
      setSuccess(`Posted successfully to ${result.results?.length || 0} platform(s)!`);
      setContent('');
      setSelectedAccounts([]);
      setSelectedHashtags([]);
      setLinkUrl('');
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      setError('Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Schedule post
  const handleSchedulePost = async () => {
    if (!content.trim() || selectedAccounts.length === 0) {
      setError('Please add content and select at least one account');
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      setError('Please select a date and time to schedule');
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();

      const response = await fetch('/api/social/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          accountIds: selectedAccounts,
          scheduledFor,
          linkUrl: linkUrl || undefined,
          hashtags: selectedHashtags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule');
      }

      setSuccess('Post scheduled successfully!');
      setContent('');
      setSelectedAccounts([]);
      setSelectedHashtags([]);
      setScheduleDate('');
      setScheduleTime('');
      setLinkUrl('');
      loadData(); // Refresh scheduled posts
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      setError('Failed to schedule post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Delete scheduled post
  const deleteScheduledPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/social/schedule?id=${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      setScheduledPosts(prev => prev.filter(p => p.id !== postId));
      setSuccess('Scheduled post deleted');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError('Failed to delete scheduled post');
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading Social Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Social Command Center</h1>
                <p className="text-sm text-gray-400">Manage all your social media from one place</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadData}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <a
                href="/dashboard/social/connect"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Connect Account
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-4 mt-4"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="h-4 w-4 text-red-400" />
              </button>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-4 mt-4"
          >
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400">{success}</p>
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <X className="h-4 w-4 text-green-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'compose', label: 'Compose', icon: Edit3 },
            { id: 'scheduled', label: 'Scheduled', icon: Clock },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'accounts', label: 'Accounts', icon: Users },
            { id: 'communities', label: 'Communities', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors min-h-[48px] ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Post Composer */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-800 rounded-xl p-4">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    Create Post
                  </h2>

                  {/* Content textarea */}
                  <div className="relative">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className={`w-full h-40 bg-slate-700 border rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 resize-none ${
                        isOverLimit
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-600 focus:ring-indigo-500'
                      }`}
                    />
                    <div className={`absolute bottom-2 right-2 text-sm ${
                      isOverLimit ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {charCount}/{charLimit}
                    </div>
                  </div>

                  {/* Selected hashtags */}
                  {selectedHashtags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedHashtags.map(hashtag => (
                        <span
                          key={hashtag}
                          className="flex items-center gap-1 bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full text-sm"
                        >
                          {hashtag}
                          <button
                            onClick={() => removeHashtag(hashtag)}
                            className="hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Link URL input */}
                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Link2 className="h-4 w-4" />
                      Add Link (optional)
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowHashtags(!showHashtags)}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Hash className="h-4 w-4" />
                      Hashtags
                      <ChevronDown className={`h-4 w-4 transition-transform ${showHashtags ? 'rotate-180' : ''}`} />
                    </button>

                    <label className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors cursor-pointer">
                      <Image className="h-4 w-4" />
                      Media
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                      />
                    </label>
                  </div>

                  {/* Hashtag sets */}
                  <AnimatePresence>
                    {showHashtags && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
                      >
                        {hashtagSets.map(set => (
                          <button
                            key={set.id}
                            onClick={() => addHashtagSet(set)}
                            className="text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{set.name}</span>
                              <span className="text-xs text-gray-500">{set.category}</span>
                            </div>
                            <p className="text-sm text-indigo-400 truncate">
                              {set.hashtags.join(' ')}
                            </p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Schedule inputs */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Clock className="h-4 w-4" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Post/Schedule buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handlePostNow}
                      disabled={isPosting || !content.trim() || selectedAccounts.length === 0}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-gray-500 px-6 py-3 rounded-lg font-medium transition-colors min-h-[48px]"
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Post Now
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSchedulePost}
                      disabled={isPosting || !content.trim() || selectedAccounts.length === 0 || !scheduleDate || !scheduleTime}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-600 px-6 py-3 rounded-lg font-medium transition-colors min-h-[48px]"
                    >
                      <Clock className="h-5 w-5" />
                      Schedule
                    </button>
                  </div>
                </div>

                {/* Trending Hashtags */}
                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Trending Now
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['#AI', '#ChatGPT', '#Tech', '#Startup', '#Innovation', '#Developer', '#SaaS', '#Marketing'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (!selectedHashtags.includes(tag)) {
                            setSelectedHashtags(prev => [...prev, tag]);
                            setContent(prev => prev + ' ' + tag);
                          }
                        }}
                        className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-full text-sm text-indigo-400 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Account Selection Sidebar */}
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" />
                    Select Accounts
                  </h3>

                  {accounts.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">No accounts connected</p>
                      <a
                        href="/dashboard/social/connect"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Connect Account
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {accounts.map(account => (
                        <button
                          key={account.id}
                          onClick={() => toggleAccount(account.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            selectedAccounts.includes(account.id)
                              ? 'bg-indigo-600/20 border border-indigo-500'
                              : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                          }`}
                        >
                          <div className="relative">
                            {account.profileImage ? (
                              <img
                                src={account.profileImage}
                                alt={account.displayName}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                                <PlatformIcon platform={account.platform} />
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5">
                              <PlatformIcon platform={account.platform} size={14} />
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{account.displayName}</p>
                            <p className="text-sm text-gray-400">@{account.username}</p>
                          </div>
                          {selectedAccounts.includes(account.id) && (
                            <Check className="h-5 w-5 text-indigo-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-indigo-400">{scheduledPosts.length}</p>
                      <p className="text-sm text-gray-400">Scheduled</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-400">{accounts.length}</p>
                      <p className="text-sm text-gray-400">Connected</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Scheduled Tab */}
          {activeTab === 'scheduled' && (
            <motion.div
              key="scheduled"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-slate-800 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" />
                  Scheduled Posts
                </h2>

                {scheduledPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Scheduled Posts</h3>
                    <p className="text-gray-400 mb-4">Posts you schedule will appear here</p>
                    <button
                      onClick={() => setActiveTab('compose')}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledPosts.map(post => (
                      <div
                        key={post.id}
                        className="bg-slate-700 rounded-lg p-4 flex items-start gap-4"
                      >
                        <div className="flex-1">
                          <p className="text-white mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(post.scheduledFor).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(post.scheduledFor).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {post.platforms.map(p => (
                              <PlatformIcon key={p} platform={p} size={16} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setContent(post.content);
                              setActiveTab('compose');
                            }}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteScheduledPost(post.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-slate-800 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-400" />
                  Analytics
                </h2>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-400">Track your social media performance across all platforms</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" />
                    Connected Accounts
                  </h2>
                  <a
                    href="/dashboard/social/connect"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Connect New
                  </a>
                </div>

                {accounts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Accounts Connected</h3>
                    <p className="text-gray-400 mb-4">Connect your social media accounts to start posting</p>
                    <a
                      href="/dashboard/social/connect"
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Connect Account
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map(account => (
                      <div
                        key={account.id}
                        className="bg-slate-700 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            {account.profileImage ? (
                              <img
                                src={account.profileImage}
                                alt={account.displayName}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                                <PlatformIcon platform={account.platform} size={24} />
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-slate-700 rounded-full p-0.5">
                              <PlatformIcon platform={account.platform} size={14} />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{account.displayName}</p>
                            <p className="text-sm text-gray-400">@{account.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {account.followers.toLocaleString()} followers
                          </span>
                          <span className={`flex items-center gap-1 ${
                            account.isActive ? 'text-green-400' : 'text-red-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              account.isActive ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Communities Tab */}
          {activeTab === 'communities' && (
            <motion.div
              key="communities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-slate-800 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  Communities to Join
                </h2>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Communities Coming Soon</h3>
                  <p className="text-gray-400">Discover and join relevant groups, subreddits, and servers</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Social Command Center by CR AudioViz AI • "Your Story. Our Design"</p>
        </div>
      </footer>
    </div>
  );
}
