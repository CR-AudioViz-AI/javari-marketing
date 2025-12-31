-- ============================================================================
-- Javari Social - Complete Database Schema
-- CRITICAL: Table names MUST match API routes (js_* prefix)
-- Timestamp: Monday, December 30, 2025 - 8:05 AM EST
-- CR AudioViz AI - Henderson Standard
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. JS_PLAN_CONFIGS (Pricing Plans)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_plan_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE, -- trial, starter, pro, agency
  display_name VARCHAR(100) NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
  price_yearly INTEGER NOT NULL DEFAULT 0,
  max_platforms INTEGER NOT NULL DEFAULT 5,
  max_posts_per_month INTEGER NOT NULL DEFAULT 30,
  max_team_members INTEGER NOT NULL DEFAULT 1,
  max_brands INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '{}',
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO js_plan_configs (name, display_name, price_monthly, price_yearly, max_platforms, max_posts_per_month, max_team_members, max_brands, features) VALUES
  ('trial', 'Free Trial', 0, 0, 5, 30, 1, 1, '{"scheduling": true, "analytics": false, "api_access": false}'),
  ('starter', 'Starter', 2900, 29000, 5, 100, 2, 2, '{"scheduling": true, "analytics": true, "bulk_upload": true}'),
  ('pro', 'Professional', 7900, 79000, 12, 500, 5, 5, '{"scheduling": true, "analytics": true, "bulk_upload": true, "rss_autopublish": true, "best_time": true}'),
  ('agency', 'Agency', 19900, 199000, 100, 10000, 25, 50, '{"scheduling": true, "analytics": true, "bulk_upload": true, "rss_autopublish": true, "best_time": true, "api_access": true, "white_label": true}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. JS_PLATFORMS (Social Platforms)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  auth_type VARCHAR(50) NOT NULL, -- oauth, api_key, webhook, bot_token
  character_limit INTEGER,
  supports_media BOOLEAN DEFAULT true,
  supports_scheduling BOOLEAN DEFAULT true,
  rate_limit_per_hour INTEGER DEFAULT 100,
  rate_limit_per_day INTEGER DEFAULT 1000,
  oauth_config JSONB DEFAULT '{}',
  is_free_tier BOOLEAN DEFAULT false, -- Available on free plan
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert platforms
INSERT INTO js_platforms (name, display_name, icon, auth_type, character_limit, is_free_tier, rate_limit_per_day) VALUES
  ('discord', 'Discord', 'discord', 'webhook', 2000, true, 10000),
  ('slack', 'Slack', 'slack', 'webhook', 40000, true, 10000),
  ('telegram', 'Telegram', 'telegram', 'bot_token', 4096, true, 30),
  ('bluesky', 'Bluesky', 'bluesky', 'api_key', 300, true, 1666),
  ('mastodon', 'Mastodon', 'mastodon', 'oauth', 500, true, 300),
  ('twitter', 'X (Twitter)', 'twitter', 'oauth', 280, false, 50),
  ('linkedin', 'LinkedIn', 'linkedin', 'oauth', 3000, false, 100),
  ('facebook', 'Facebook', 'facebook', 'oauth', 63206, false, 200),
  ('instagram', 'Instagram', 'instagram', 'oauth', 2200, false, 25),
  ('youtube', 'YouTube', 'youtube', 'oauth', 5000, false, 100),
  ('tiktok', 'TikTok', 'tiktok', 'oauth', 2200, false, 50),
  ('reddit', 'Reddit', 'reddit', 'oauth', 40000, false, 100),
  ('tumblr', 'Tumblr', 'tumblr', 'oauth', NULL, false, 250)
ON CONFLICT (name) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  character_limit = EXCLUDED.character_limit,
  is_free_tier = EXCLUDED.is_free_tier;

-- ============================================================================
-- 3. JS_TENANTS (Customer Accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'trial',
  subscription_status VARCHAR(50) DEFAULT 'trialing', -- trialing, active, past_due, canceled
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_ends_at TIMESTAMPTZ,
  max_platforms INTEGER DEFAULT 5,
  max_posts_per_month INTEGER DEFAULT 30,
  posts_this_month INTEGER DEFAULT 0,
  billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{}',
  is_owner_bypass BOOLEAN DEFAULT false, -- CR AudioViz AI owners bypass credits
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 4. JS_BRAND_PROFILES (Multi-Brand Support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES js_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  handle VARCHAR(100),
  logo_url TEXT,
  brand_voice TEXT, -- AI tone description
  default_hashtags TEXT[],
  color_primary VARCHAR(7),
  color_secondary VARCHAR(7),
  website_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. JS_CONNECTIONS (Platform Connections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES js_tenants(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES js_platforms(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES js_brand_profiles(id) ON DELETE SET NULL,
  platform_username VARCHAR(255),
  platform_display_name VARCHAR(255),
  platform_user_id VARCHAR(255),
  credentials_encrypted TEXT NOT NULL, -- AES-256 encrypted
  status VARCHAR(50) DEFAULT 'active', -- active, expired, revoked, error
  token_expires_at TIMESTAMPTZ,
  posts_today INTEGER DEFAULT 0,
  posts_this_hour INTEGER DEFAULT 0,
  last_post_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, platform_id, platform_user_id)
);

-- ============================================================================
-- 6. JS_CAMPAIGNS (Marketing Campaigns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES js_tenants(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES js_brand_profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  goals JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. JS_POSTS (Content)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES js_tenants(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES js_brand_profiles(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES js_campaigns(id) ON DELETE SET NULL,
  original_content TEXT NOT NULL,
  platform_content JSONB DEFAULT '{}', -- Platform-specific adaptations
  media_urls TEXT[],
  link_url TEXT,
  target_platforms TEXT[] NOT NULL,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, publishing, published, failed
  publish_results JSONB DEFAULT '{}',
  last_error TEXT,
  credits_charged INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. JS_TEAM_MEMBERS (Team Access)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES js_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, editor, member
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- ============================================================================
-- 9. JS_USAGE_TRACKING (Monthly Usage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES js_tenants(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- YYYY-MM format
  posts_count INTEGER DEFAULT 0,
  platforms_used TEXT[],
  api_calls INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, month_year)
);

-- ============================================================================
-- 10. JS_ANALYTICS (Engagement Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS js_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES js_tenants(id) ON DELETE CASCADE,
  post_id UUID REFERENCES js_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_post_id VARCHAR(255),
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB DEFAULT '{}'
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_js_tenants_user_id ON js_tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_js_connections_tenant_id ON js_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_js_connections_platform_id ON js_connections(platform_id);
CREATE INDEX IF NOT EXISTS idx_js_posts_tenant_id ON js_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_js_posts_status ON js_posts(status);
CREATE INDEX IF NOT EXISTS idx_js_posts_scheduled_for ON js_posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_js_analytics_tenant_id ON js_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_js_analytics_post_id ON js_analytics(post_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE js_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE js_brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE js_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE js_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE js_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE js_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE js_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE js_analytics ENABLE ROW LEVEL SECURITY;

-- Tenants: Users can see their own tenant
CREATE POLICY "Users view own tenant" ON js_tenants
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (for API routes)
CREATE POLICY "Service manages tenants" ON js_tenants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service manages brands" ON js_brand_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service manages connections" ON js_connections
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service manages posts" ON js_posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service manages campaigns" ON js_campaigns
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service manages team" ON js_team_members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service manages usage" ON js_usage_tracking
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service manages analytics" ON js_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- OWNER BYPASS SETUP (For Roy & Cindy)
-- ============================================================================
-- Run this after creating your tenant to enable owner bypass:
-- UPDATE js_tenants SET is_owner_bypass = true WHERE user_id = 'YOUR_USER_ID';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is owner (bypasses credits)
CREATE OR REPLACE FUNCTION is_owner_bypass(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM js_tenants 
    WHERE id = p_tenant_id AND is_owner_bypass = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment monthly posts
CREATE OR REPLACE FUNCTION increment_monthly_posts(p_tenant_id UUID)
RETURNS void AS $$
DECLARE
  current_month VARCHAR(7);
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  INSERT INTO js_usage_tracking (tenant_id, month_year, posts_count)
  VALUES (p_tenant_id, current_month, 1)
  ON CONFLICT (tenant_id, month_year) 
  DO UPDATE SET posts_count = js_usage_tracking.posts_count + 1;
  
  UPDATE js_tenants 
  SET posts_this_month = posts_this_month + 1, updated_at = NOW()
  WHERE id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT SELECT ON js_platforms TO authenticated;
GRANT SELECT ON js_plan_configs TO authenticated;
GRANT EXECUTE ON FUNCTION is_owner_bypass TO authenticated;
GRANT EXECUTE ON FUNCTION increment_monthly_posts TO service_role;

COMMENT ON TABLE js_tenants IS 'Javari Social customer accounts with owner bypass support';
COMMENT ON COLUMN js_tenants.is_owner_bypass IS 'Set to true for CR AudioViz AI owners to bypass credit charges';
