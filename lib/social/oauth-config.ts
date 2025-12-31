// OAuth Configuration for Social Platforms
// These require developer accounts and approval from each platform

export interface OAuthConfig {
  platform: string;
  displayName: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  approvalRequired: boolean;
  approvalTime: string;
  setupInstructions: string[];
  envVars: string[];
}

export const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  // ===== REQUIRES DEVELOPER APPROVAL =====
  
  twitter: {
    platform: 'twitter',
    displayName: 'Twitter/X',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    approvalRequired: true,
    approvalTime: '1-7 days',
    setupInstructions: [
      '1. Go to https://developer.twitter.com/en/portal/dashboard',
      '2. Create a new Project and App',
      '3. Enable OAuth 2.0 (User Authentication)',
      '4. Set callback URL: https://your-domain.com/api/auth/callback/twitter',
      '5. Copy Client ID and Client Secret',
      '6. Apply for Elevated access if needed for higher rate limits',
    ],
    envVars: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
  },

  facebook: {
    platform: 'facebook',
    displayName: 'Facebook',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'public_profile'],
    approvalRequired: true,
    approvalTime: '2-4 weeks',
    setupInstructions: [
      '1. Go to https://developers.facebook.com/',
      '2. Create a new App (Business type)',
      '3. Add Facebook Login product',
      '4. Configure OAuth redirect URI',
      '5. Add required permissions',
      '6. Submit for App Review (required for publishing)',
      '7. Business Verification may be required',
    ],
    envVars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
  },

  instagram: {
    platform: 'instagram',
    displayName: 'Instagram',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
    approvalRequired: true,
    approvalTime: '2-4 weeks',
    setupInstructions: [
      '1. Instagram API requires a Facebook App',
      '2. Go to https://developers.facebook.com/',
      '3. Add Instagram Basic Display or Instagram Graph API',
      '4. Connect to a Business or Creator Instagram account',
      '5. For publishing, you need Instagram Graph API + Business account',
      '6. Submit for App Review',
    ],
    envVars: ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET'],
  },

  linkedin: {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    approvalRequired: true,
    approvalTime: '1-2 weeks',
    setupInstructions: [
      '1. Go to https://www.linkedin.com/developers/',
      '2. Create a new App',
      '3. Request Marketing API access (for posting)',
      '4. Add OAuth 2.0 redirect URLs',
      '5. Verify your company page',
      '6. Request necessary permissions in Products tab',
    ],
    envVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  },

  youtube: {
    platform: 'youtube',
    displayName: 'YouTube',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    approvalRequired: true,
    approvalTime: '1-3 weeks',
    setupInstructions: [
      '1. Go to https://console.cloud.google.com/',
      '2. Create a new Project',
      '3. Enable YouTube Data API v3',
      '4. Create OAuth 2.0 credentials',
      '5. Configure OAuth consent screen',
      '6. Submit for verification if accessing sensitive scopes',
    ],
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },

  tiktok: {
    platform: 'tiktok',
    displayName: 'TikTok',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'video.publish', 'video.upload'],
    approvalRequired: true,
    approvalTime: '2-4 weeks',
    setupInstructions: [
      '1. Go to https://developers.tiktok.com/',
      '2. Create a new App',
      '3. Apply for Content Posting API access',
      '4. Business Verification required',
      '5. Wait for approval before users can connect',
    ],
    envVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
  },

  pinterest: {
    platform: 'pinterest',
    displayName: 'Pinterest',
    authUrl: 'https://api.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scopes: ['boards:read', 'pins:read', 'pins:write', 'user_accounts:read'],
    approvalRequired: true,
    approvalTime: '1-2 weeks',
    setupInstructions: [
      '1. Go to https://developers.pinterest.com/',
      '2. Create a new App',
      '3. Request access to necessary scopes',
      '4. Submit for review',
    ],
    envVars: ['PINTEREST_APP_ID', 'PINTEREST_APP_SECRET'],
  },

  // ===== NO APPROVAL NEEDED (Works Immediately) =====

  mastodon: {
    platform: 'mastodon',
    displayName: 'Mastodon',
    authUrl: 'https://{instance}/oauth/authorize',
    tokenUrl: 'https://{instance}/oauth/token',
    scopes: ['read', 'write', 'follow'],
    approvalRequired: false,
    approvalTime: 'Instant',
    setupInstructions: [
      '1. Each Mastodon instance has its own OAuth',
      '2. Users enter their instance URL',
      '3. We dynamically register our app with their instance',
      '4. No central approval needed',
    ],
    envVars: [], // Dynamic per instance
  },

  reddit: {
    platform: 'reddit',
    displayName: 'Reddit',
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
    scopes: ['identity', 'submit', 'read', 'mysubreddits'],
    approvalRequired: false,
    approvalTime: 'Instant (but strict rules)',
    setupInstructions: [
      '1. Go to https://www.reddit.com/prefs/apps',
      '2. Create a new app (script or web app)',
      '3. Note: Reddit has strict self-promotion rules',
      '4. Each subreddit has its own posting rules',
    ],
    envVars: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET'],
  },

  tumblr: {
    platform: 'tumblr',
    displayName: 'Tumblr',
    authUrl: 'https://www.tumblr.com/oauth2/authorize',
    tokenUrl: 'https://api.tumblr.com/v2/oauth2/token',
    scopes: ['basic', 'write'],
    approvalRequired: false,
    approvalTime: 'Instant',
    setupInstructions: [
      '1. Go to https://www.tumblr.com/oauth/apps',
      '2. Register a new application',
      '3. Copy OAuth credentials',
    ],
    envVars: ['TUMBLR_CONSUMER_KEY', 'TUMBLR_CONSUMER_SECRET'],
  },

  threads: {
    platform: 'threads',
    displayName: 'Threads',
    authUrl: 'https://threads.net/oauth/authorize',
    tokenUrl: 'https://graph.threads.net/oauth/access_token',
    scopes: ['threads_basic', 'threads_content_publish'],
    approvalRequired: true,
    approvalTime: '2-4 weeks (via Meta)',
    setupInstructions: [
      '1. Threads API is part of Meta/Instagram API',
      '2. Requires Facebook Developer account',
      '3. Requires Business or Creator account',
      '4. Submit for App Review',
    ],
    envVars: ['THREADS_APP_ID', 'THREADS_APP_SECRET'],
  },
};

// Get platforms that work immediately
export function getImmediatePlatforms(): string[] {
  return Object.entries(OAUTH_CONFIGS)
    .filter(([_, config]) => !config.approvalRequired)
    .map(([name]) => name);
}

// Get platforms requiring approval
export function getApprovalRequiredPlatforms(): string[] {
  return Object.entries(OAUTH_CONFIGS)
    .filter(([_, config]) => config.approvalRequired)
    .map(([name]) => name);
}

// Platforms that use webhooks/tokens instead of OAuth
export const NON_OAUTH_PLATFORMS = {
  discord: {
    type: 'webhook',
    instructions: 'Create a webhook in your Discord server settings',
  },
  slack: {
    type: 'webhook', 
    instructions: 'Create an Incoming Webhook in your Slack workspace',
  },
  telegram: {
    type: 'bot_token',
    instructions: 'Create a bot with @BotFather and get the token',
  },
  bluesky: {
    type: 'app_password',
    instructions: 'Generate an App Password in Bluesky settings',
  },
};
