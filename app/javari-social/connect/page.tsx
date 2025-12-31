'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  Clock,
  Zap,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface Platform {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  category: string;
  auth_type: string;
  character_limit: number | null;
  rate_limit_per_day: number;
  limit_explanation: string;
  is_active: boolean;
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

const authTypeInfo: Record<string, { label: string; color: string; icon: string }> = {
  oauth2: { label: 'OAuth Login', color: 'blue', icon: '🔐' },
  webhook: { label: 'Webhook URL', color: 'green', icon: '🔗' },
  bot_token: { label: 'Bot Token', color: 'purple', icon: '🤖' },
  api_key: { label: 'App Password', color: 'orange', icon: '🔑' },
};

// Which platforms need developer approval
const requiresApproval = ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'threads'];

export default function ConnectPlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function loadPlatforms() {
    try {
      const res = await fetch('/api/javari-social/platforms');
      if (res.ok) {
        const data = await res.json();
        setPlatforms(data.platforms || []);
      }
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
    setLoading(false);
  }

  async function handleConnect() {
    if (!selectedPlatform) return;
    
    setConnecting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/javari-social/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo-tenant', // Replace with actual tenant ID
          platformName: selectedPlatform.name,
          credentials: credentials,
          platformUsername: credentials.username || credentials.identifier || 'Connected',
          platformDisplayName: selectedPlatform.display_name,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Successfully connected to ${selectedPlatform.display_name}!` });
        setSelectedPlatform(null);
        setCredentials({});
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to connect' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect. Please try again.' });
    }

    setConnecting(false);
  }

  function renderCredentialFields() {
    if (!selectedPlatform) return null;

    switch (selectedPlatform.auth_type) {
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={credentials.webhook_url || ''}
                onChange={(e) => setCredentials({ ...credentials, webhook_url: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                {selectedPlatform.name === 'discord' && 'Server Settings → Integrations → Webhooks → New Webhook'}
                {selectedPlatform.name === 'slack' && 'Apps → Incoming Webhooks → Add New Webhook'}
              </p>
            </div>
          </div>
        );

      case 'bot_token':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bot Token
              </label>
              <div className="relative">
                <input
                  type={showCredentials.bot_token ? 'text' : 'password'}
                  value={credentials.bot_token || ''}
                  onChange={(e) => setCredentials({ ...credentials, bot_token: e.target.value })}
                  placeholder="123456789:ABCdefGhIjKlmNoPQRsTUVwxyZ"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCredentials({ ...showCredentials, bot_token: !showCredentials.bot_token })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCredentials.bot_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chat/Channel ID
              </label>
              <input
                type="text"
                value={credentials.chat_id || ''}
                onChange={(e) => setCredentials({ ...credentials, chat_id: e.target.value })}
                placeholder="-1001234567890"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Create a bot with @BotFather, add it to your channel as admin
              </p>
            </div>
          </div>
        );

      case 'api_key':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username/Handle
              </label>
              <input
                type="text"
                value={credentials.identifier || ''}
                onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
                placeholder="yourhandle.bsky.social"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                App Password
              </label>
              <div className="relative">
                <input
                  type={showCredentials.password ? 'text' : 'password'}
                  value={credentials.password || ''}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCredentials({ ...showCredentials, password: !showCredentials.password })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCredentials.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Settings → App Passwords → Add App Password (NOT your main password)
              </p>
            </div>
          </div>
        );

      case 'oauth2':
        return (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-400">Developer Approval Required</p>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedPlatform.display_name} requires developer account approval before users can connect.
                  This typically takes 1-4 weeks.
                </p>
                <button className="mt-3 text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
                  View Setup Instructions <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  const groupedPlatforms = platforms.reduce((acc, platform) => {
    const group = requiresApproval.includes(platform.name) ? 'approval' : 'immediate';
    if (!acc[group]) acc[group] = [];
    acc[group].push(platform);
    return acc;
  }, {} as Record<string, Platform[]>);

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
          <h1 className="text-3xl font-bold">Connect Platforms</h1>
          <p className="text-gray-400 mt-2">
            Connect your social media accounts to start posting everywhere at once.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
            <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>{message.text}</span>
          </div>
        )}

        {/* Selected Platform Modal */}
        {selectedPlatform && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
                      {platformIcons[selectedPlatform.name] || '📱'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedPlatform.display_name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-${authTypeInfo[selectedPlatform.auth_type]?.color || 'gray'}-500/20 text-${authTypeInfo[selectedPlatform.auth_type]?.color || 'gray'}-400`}>
                        {authTypeInfo[selectedPlatform.auth_type]?.label || selectedPlatform.auth_type}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedPlatform(null); setCredentials({}); }}
                    className="p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Platform Info */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{selectedPlatform.limit_explanation}</p>
                  </div>
                </div>

                {/* Credential Fields */}
                {renderCredentialFields()}

                {/* Connect Button */}
                {selectedPlatform.auth_type !== 'oauth2' && (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {connecting ? 'Connecting...' : `Connect ${selectedPlatform.display_name}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Works Immediately */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold">Works Immediately</h2>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">No Approval Needed</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {groupedPlatforms.immediate?.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform)}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-left hover:border-purple-500/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xl group-hover:bg-gray-700 transition-colors">
                    {platformIcons[platform.name] || '📱'}
                  </div>
                  <div>
                    <p className="font-medium">{platform.display_name}</p>
                    <p className="text-xs text-gray-500">
                      {authTypeInfo[platform.auth_type]?.icon} {authTypeInfo[platform.auth_type]?.label}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Requires Approval */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Requires Developer Approval</h2>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">1-4 weeks</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {groupedPlatforms.approval?.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform)}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-left hover:border-yellow-500/50 transition-colors group opacity-75"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xl group-hover:bg-gray-700 transition-colors">
                    {platformIcons[platform.name] || '📱'}
                  </div>
                  <div>
                    <p className="font-medium">{platform.display_name}</p>
                    <p className="text-xs text-yellow-500">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Approval required
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
