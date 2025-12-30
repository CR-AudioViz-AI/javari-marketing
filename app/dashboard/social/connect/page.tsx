'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, ExternalLink, Check, Loader2, AlertCircle,
  Globe, MessageSquare, Zap, Crown, Lock, Unlock,
  ChevronRight, Copy, Eye, EyeOff
} from 'lucide-react';

// Platform configuration
interface Platform {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  category: 'social' | 'video' | 'community' | 'publishing' | 'messaging';
  authType: 'oauth' | 'webhook' | 'bot' | 'api_key' | 'manual';
  isFreeTier: boolean;
  description: string;
  connectUrl?: string;
  setupInstructions?: string[];
}

const PLATFORMS: Platform[] = [
  // OAuth Platforms (Direct API Access)
  {
    id: 'twitter',
    name: 'twitter',
    displayName: 'Twitter / X',
    icon: '𝕏',
    color: '#000000',
    category: 'social',
    authType: 'oauth',
    isFreeTier: true,
    description: 'FREE tier: 500 tweets/month. Connect via OAuth.',
    connectUrl: '/api/social/connect/twitter',
  },
  {
    id: 'linkedin',
    name: 'linkedin',
    displayName: 'LinkedIn',
    icon: 'in',
    color: '#0A66C2',
    category: 'social',
    authType: 'oauth',
    isFreeTier: true,
    description: 'FREE API access for personal profiles.',
    connectUrl: '/api/social/connect/linkedin',
  },
  {
    id: 'facebook',
    name: 'facebook',
    displayName: 'Facebook',
    icon: 'f',
    color: '#1877F2',
    category: 'social',
    authType: 'oauth',
    isFreeTier: true,
    description: 'FREE for Pages via Graph API. Requires Business approval.',
    connectUrl: '/api/social/connect/facebook',
  },
  {
    id: 'instagram',
    name: 'instagram',
    displayName: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    category: 'social',
    authType: 'oauth',
    isFreeTier: true,
    description: 'Business/Creator accounts via Facebook Graph API.',
    connectUrl: '/api/social/connect/instagram',
  },

  // Fully Free Open APIs
  {
    id: 'mastodon',
    name: 'mastodon',
    displayName: 'Mastodon',
    icon: '🐘',
    color: '#6364FF',
    category: 'social',
    authType: 'oauth',
    isFreeTier: true,
    description: '100% FREE, open API. No limits.',
    connectUrl: '/api/social/connect/mastodon',
  },
  {
    id: 'bluesky',
    name: 'bluesky',
    displayName: 'Bluesky',
    icon: '🦋',
    color: '#0085FF',
    category: 'social',
    authType: 'api_key',
    isFreeTier: true,
    description: '100% FREE, open API. Use app password.',
    setupInstructions: [
      'Go to bsky.app → Settings → App Passwords',
      'Create a new app password',
      'Enter your handle and app password below',
    ],
  },

  // Webhooks/Bots (Unlimited FREE)
  {
    id: 'discord',
    name: 'discord',
    displayName: 'Discord',
    icon: '🎮',
    color: '#5865F2',
    category: 'community',
    authType: 'webhook',
    isFreeTier: true,
    description: 'UNLIMITED FREE via webhooks. No rate limits.',
    setupInstructions: [
      'Open your Discord server settings',
      'Go to Integrations → Webhooks',
      'Create a new webhook and copy the URL',
    ],
  },
  {
    id: 'telegram',
    name: 'telegram',
    displayName: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    category: 'messaging',
    authType: 'bot',
    isFreeTier: true,
    description: 'UNLIMITED FREE via Bot API.',
    setupInstructions: [
      'Message @BotFather on Telegram',
      'Create a new bot with /newbot',
      'Copy the bot token',
      'Get your channel ID (e.g., @yourchannel)',
    ],
  },
  {
    id: 'slack',
    name: 'slack',
    displayName: 'Slack',
    icon: '#',
    color: '#4A154B',
    category: 'community',
    authType: 'webhook',
    isFreeTier: true,
    description: 'UNLIMITED FREE via Incoming Webhooks.',
    setupInstructions: [
      'Go to your Slack workspace settings',
      'Apps → Manage → Custom Integrations → Incoming Webhooks',
      'Create a new webhook and copy the URL',
    ],
  },

  // Video Platforms
  {
    id: 'youtube',
    name: 'youtube',
    displayName: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    category: 'video',
    authType: 'oauth',
    isFreeTier: true,
    description: 'FREE API: 10,000 quota units/day.',
    connectUrl: '/api/social/connect/youtube',
  },
  {
    id: 'tiktok',
    name: 'tiktok',
    displayName: 'TikTok',
    icon: '🎵',
    color: '#000000',
    category: 'video',
    authType: 'oauth',
    isFreeTier: false,
    description: 'Limited API access. Manual posting recommended.',
    connectUrl: '/api/social/connect/tiktok',
  },

  // Other Platforms
  {
    id: 'reddit',
    name: 'reddit',
    displayName: 'Reddit',
    icon: '🔴',
    color: '#FF4500',
    category: 'community',
    authType: 'oauth',
    isFreeTier: true,
    description: 'FREE API: 60 requests/minute.',
    connectUrl: '/api/social/connect/reddit',
  },
  {
    id: 'pinterest',
    name: 'pinterest',
    displayName: 'Pinterest',
    icon: '📌',
    color: '#E60023',
    category: 'social',
    authType: 'oauth',
    isFreeTier: true,
    description: 'FREE API for business accounts.',
    connectUrl: '/api/social/connect/pinterest',
  },
  {
    id: 'threads',
    name: 'threads',
    displayName: 'Threads',
    icon: '@',
    color: '#000000',
    category: 'social',
    authType: 'oauth',
    isFreeTier: true,
    description: 'Via Instagram/Facebook Graph API.',
    connectUrl: '/api/social/connect/threads',
  },
  {
    id: 'tumblr',
    name: 'tumblr',
    displayName: 'Tumblr',
    icon: 't',
    color: '#36465D',
    category: 'publishing',
    authType: 'oauth',
    isFreeTier: true,
    description: 'FREE API: 250 posts/day.',
    connectUrl: '/api/social/connect/tumblr',
  },
];

export default function ConnectAccountsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for non-OAuth connections
  const [webhookUrl, setWebhookUrl] = useState('');
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [handle, setHandle] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleOAuthConnect = async (platform: Platform) => {
    if (!platform.connectUrl) return;
    setIsConnecting(true);
    setError(null);
    
    // Redirect to OAuth flow
    window.location.href = platform.connectUrl;
  };

  const handleWebhookConnect = async () => {
    if (!selectedPlatform || !webhookUrl) {
      setError('Please enter a webhook URL');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName: selectedPlatform.name,
          webhookSecret: webhookUrl,
          username: selectedPlatform.displayName,
          displayName: `${selectedPlatform.displayName} Channel`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect');
      }

      setSuccess(`${selectedPlatform.displayName} connected successfully!`);
      setWebhookUrl('');
      setSelectedPlatform(null);
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      setError('Failed to connect. Please check your webhook URL.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBotConnect = async () => {
    if (!selectedPlatform || !botToken || !channelId) {
      setError('Please enter both bot token and channel ID');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName: selectedPlatform.name,
          botToken,
          channelId,
          username: channelId,
          displayName: `${selectedPlatform.displayName} Channel`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect');
      }

      setSuccess(`${selectedPlatform.displayName} connected successfully!`);
      setBotToken('');
      setChannelId('');
      setSelectedPlatform(null);
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      setError('Failed to connect. Please check your credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBlueskyConnect = async () => {
    if (!handle || !appPassword) {
      setError('Please enter both handle and app password');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Verify credentials with Bluesky
      const authRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: handle, password: appPassword }),
      });

      if (!authRes.ok) {
        throw new Error('Invalid credentials');
      }

      const authData = await authRes.json();

      const response = await fetch('/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName: 'bluesky',
          platformUserId: authData.did,
          username: handle,
          displayName: authData.displayName || handle,
          metadata: { app_password: appPassword },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save account');
      }

      setSuccess('Bluesky connected successfully!');
      setHandle('');
      setAppPassword('');
      setSelectedPlatform(null);
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      setError('Failed to connect. Please check your credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  const groupedPlatforms = PLATFORMS.reduce((acc, platform) => {
    if (!acc[platform.category]) {
      acc[platform.category] = [];
    }
    acc[platform.category].push(platform);
    return acc;
  }, {} as Record<string, Platform[]>);

  const categoryLabels: Record<string, string> = {
    social: 'Social Networks',
    video: 'Video Platforms',
    community: 'Community & Chat',
    publishing: 'Publishing',
    messaging: 'Messaging',
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/social"
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Connect Accounts</h1>
              <p className="text-sm text-gray-400">Link your social media accounts</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
          >
            <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{success}</p>
          </motion.div>
        )}

        {/* Selected Platform Setup */}
        {selectedPlatform && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-slate-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: selectedPlatform.color + '20', color: selectedPlatform.color }}
              >
                {selectedPlatform.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedPlatform.displayName}</h2>
                <p className="text-sm text-gray-400">{selectedPlatform.description}</p>
              </div>
              <button
                onClick={() => setSelectedPlatform(null)}
                className="ml-auto p-2 hover:bg-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Setup Instructions */}
            {selectedPlatform.setupInstructions && (
              <div className="mb-4 p-4 bg-slate-700/50 rounded-lg">
                <h3 className="font-medium mb-2">Setup Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400">
                  {selectedPlatform.setupInstructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* OAuth Platforms */}
            {selectedPlatform.authType === 'oauth' && selectedPlatform.connectUrl && (
              <button
                onClick={() => handleOAuthConnect(selectedPlatform)}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-5 w-5" />
                    Connect with {selectedPlatform.displayName}
                  </>
                )}
              </button>
            )}

            {/* Webhook Setup */}
            {selectedPlatform.authType === 'webhook' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleWebhookConnect}
                  disabled={isConnecting || !webhookUrl}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Bot Token Setup (Telegram) */}
            {selectedPlatform.authType === 'bot' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bot Token</label>
                  <input
                    type="text"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Channel ID</label>
                  <input
                    type="text"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="@yourchannel or -1001234567890"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleBotConnect}
                  disabled={isConnecting || !botToken || !channelId}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}

            {/* API Key Setup (Bluesky) */}
            {selectedPlatform.authType === 'api_key' && selectedPlatform.name === 'bluesky' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Handle</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="yourname.bsky.social"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">App Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={appPassword}
                      onChange={(e) => setAppPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleBlueskyConnect}
                  disabled={isConnecting || !handle || !appPassword}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Platform Grid */}
        <div className="space-y-8">
          {Object.entries(groupedPlatforms).map(([category, platforms]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {category === 'social' && <Globe className="h-5 w-5 text-indigo-400" />}
                {category === 'video' && <Zap className="h-5 w-5 text-red-400" />}
                {category === 'community' && <MessageSquare className="h-5 w-5 text-green-400" />}
                {category === 'publishing' && <Crown className="h-5 w-5 text-yellow-400" />}
                {category === 'messaging' && <MessageSquare className="h-5 w-5 text-blue-400" />}
                {categoryLabels[category]}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {platforms.map(platform => (
                  <motion.button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors ${
                      selectedPlatform?.id === platform.id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                      style={{ backgroundColor: platform.color + '20', color: platform.color }}
                    >
                      {platform.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{platform.displayName}</span>
                        {platform.isFreeTier && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            FREE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{platform.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-slate-800 rounded-xl">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Unlock className="h-5 w-5 text-indigo-400" />
            FREE API Tiers Available
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span><strong>Twitter/X:</strong> 500 tweets/month</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span><strong>Discord:</strong> Unlimited webhooks</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span><strong>Telegram:</strong> Unlimited bot messages</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span><strong>Mastodon:</strong> 100% free, open API</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span><strong>Bluesky:</strong> 100% free, open API</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span><strong>Slack:</strong> Unlimited incoming webhooks</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
