-- ============================================================================
-- Social Media Command Center Database Schema
-- Migration: 007_social_media.sql
-- Timestamp: Monday, December 30, 2025 - 2:50 AM EST
-- CR AudioViz AI - Fortune 50 Quality
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. SOCIAL PLATFORMS (Reference Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  category VARCHAR(50) NOT NULL,
  api_type VARCHAR(50) NOT NULL,
  api_endpoint TEXT,
  oauth_url TEXT,
  token_url TEXT,
  scopes TEXT[],
  character_limit INTEGER,
  media_types TEXT[],
  rate_limit_per_hour INTEGER,
  rate_limit_per_day INTEGER,
  is_free_tier BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. SOCIAL ACCOUNTS (User Connected Accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
  platform_user_id VARCHAR(255),
  username VARCHAR(255),
  display_name VARCHAR(255),
  profile_image_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  webhook_secret TEXT,
  bot_token TEXT,
  channel_id VARCHAR(255),
  permissions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform_id, platform_user_id)
);

-- ============================================================================
-- 3. SOCIAL POSTS (Content Repository)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'text',
  media_urls TEXT[],
  link_url TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  template_id UUID,
  campaign_id UUID,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'draft',
  visibility VARCHAR(50) DEFAULT 'public',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. POST RESULTS (Multi-Platform Publishing Results)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_post_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform_post_id VARCHAR(255),
  platform_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  engagement JSONB DEFAULT '{"likes": 0, "shares": 0, "comments": 0, "views": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. POST TEMPLATES (Reusable Content Templates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  content TEXT NOT NULL,
  variables TEXT[],
  hashtag_sets TEXT[],
  recommended_platforms TEXT[],
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. CAMPAIGNS (Marketing Campaigns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal VARCHAR(255),
  target_audience TEXT,
  platforms TEXT[],
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  budget DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'draft',
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. SCHEDULING QUEUE
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_log TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. HASHTAG SETS (Reusable Hashtag Groups)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_hashtag_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  hashtags TEXT[] NOT NULL,
  category VARCHAR(50),
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. ANALYTICS (Per-Account Analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, date)
);

-- ============================================================================
-- 10. CONTENT CALENDAR
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50),
  platforms TEXT[],
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status VARCHAR(50) DEFAULT 'planned',
  post_id UUID REFERENCES social_posts(id),
  color VARCHAR(20) DEFAULT '#3B82F6',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. COMMUNITIES (Groups, Subreddits, Servers to Join)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  community_name VARCHAR(255) NOT NULL,
  community_url TEXT,
  category VARCHAR(100),
  member_count INTEGER,
  engagement_level VARCHAR(50),
  join_status VARCHAR(50) DEFAULT 'not_joined',
  notes TEXT,
  last_activity_at TIMESTAMPTZ,
  is_recommended BOOLEAN DEFAULT false,
  niche_tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. DRIP CAMPAIGNS (Automated Posting Sequences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_drip_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) DEFAULT 'manual',
  trigger_config JSONB DEFAULT '{}',
  posts JSONB[] NOT NULL,
  interval_hours INTEGER DEFAULT 24,
  status VARCHAR(50) DEFAULT 'draft',
  current_step INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 13. COMPETITOR TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competitor_name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  username VARCHAR(255) NOT NULL,
  profile_url TEXT,
  follower_count INTEGER,
  engagement_rate DECIMAL(5,2),
  posting_frequency VARCHAR(50),
  content_themes TEXT[],
  notes TEXT,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 14. BRAND ASSETS (Logos, Images, Templates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_brand_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  dimensions JSONB,
  file_size INTEGER,
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform_id ON social_accounts(platform_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_for ON social_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_social_post_results_post_id ON social_post_results(post_id);
CREATE INDEX IF NOT EXISTS idx_social_queue_scheduled_for ON social_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_social_queue_status ON social_queue(status);
CREATE INDEX IF NOT EXISTS idx_social_analytics_account_date ON social_analytics(account_id, date);
CREATE INDEX IF NOT EXISTS idx_social_calendar_user_date ON social_calendar(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_social_communities_platform ON social_communities(platform);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_hashtag_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_drip_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_brand_assets ENABLE ROW LEVEL SECURITY;

-- User can only see their own data
CREATE POLICY "Users can view own social_accounts" ON social_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social_accounts" ON social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social_accounts" ON social_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social_accounts" ON social_accounts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own social_posts" ON social_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social_posts" ON social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social_posts" ON social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social_posts" ON social_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own post_results" ON social_post_results FOR SELECT 
  USING (EXISTS (SELECT 1 FROM social_posts WHERE social_posts.id = social_post_results.post_id AND social_posts.user_id = auth.uid()));

CREATE POLICY "Users can view own social_templates" ON social_templates FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own social_templates" ON social_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social_templates" ON social_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social_templates" ON social_templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own social_campaigns" ON social_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social_campaigns" ON social_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social_campaigns" ON social_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social_campaigns" ON social_campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own social_queue" ON social_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social_queue" ON social_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social_queue" ON social_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social_queue" ON social_queue FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own hashtag_sets" ON social_hashtag_sets FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own hashtag_sets" ON social_hashtag_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hashtag_sets" ON social_hashtag_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hashtag_sets" ON social_hashtag_sets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON social_analytics FOR SELECT 
  USING (EXISTS (SELECT 1 FROM social_accounts WHERE social_accounts.id = social_analytics.account_id AND social_accounts.user_id = auth.uid()));

CREATE POLICY "Users can view own calendar" ON social_calendar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar" ON social_calendar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar" ON social_calendar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar" ON social_calendar FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own communities" ON social_communities FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own communities" ON social_communities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own communities" ON social_communities FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own drip_campaigns" ON social_drip_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drip_campaigns" ON social_drip_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drip_campaigns" ON social_drip_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drip_campaigns" ON social_drip_campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own competitors" ON social_competitors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own competitors" ON social_competitors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own competitors" ON social_competitors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own competitors" ON social_competitors FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own brand_assets" ON social_brand_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand_assets" ON social_brand_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand_assets" ON social_brand_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand_assets" ON social_brand_assets FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA: 28 Social Platforms
-- ============================================================================
INSERT INTO social_platforms (name, display_name, icon, category, api_type, character_limit, media_types, rate_limit_per_hour, rate_limit_per_day, is_free_tier, is_active, features) VALUES
-- Major Social Networks
('facebook', 'Facebook', 'facebook', 'social', 'oauth', 63206, ARRAY['image', 'video', 'link'], 200, 4800, true, true, '{"pages": true, "groups": true, "stories": true}'),
('instagram', 'Instagram', 'instagram', 'social', 'oauth', 2200, ARRAY['image', 'video', 'carousel'], 200, 4800, true, true, '{"reels": true, "stories": true, "business": true}'),
('twitter', 'Twitter/X', 'twitter', 'social', 'oauth', 280, ARRAY['image', 'video', 'gif', 'poll'], 50, 500, true, true, '{"threads": true, "spaces": true}'),
('linkedin', 'LinkedIn', 'linkedin', 'social', 'oauth', 3000, ARRAY['image', 'video', 'document'], 100, 1000, true, true, '{"articles": true, "newsletters": true}'),
('youtube', 'YouTube', 'youtube', 'video', 'oauth', 5000, ARRAY['video', 'shorts'], 50, 500, true, true, '{"community": true, "shorts": true}'),
('tiktok', 'TikTok', 'tiktok', 'video', 'oauth', 2200, ARRAY['video'], 50, 500, true, true, '{"duet": true, "stitch": true}'),
('pinterest', 'Pinterest', 'pinterest', 'visual', 'oauth', 500, ARRAY['image', 'video'], 100, 1000, true, true, '{"boards": true, "idea_pins": true}'),
('reddit', 'Reddit', 'reddit', 'community', 'oauth', 40000, ARRAY['image', 'video', 'link', 'poll'], 60, 1000, true, true, '{"subreddits": true, "awards": true}'),

-- Messaging & Community
('discord', 'Discord', 'discord', 'community', 'webhook', 2000, ARRAY['image', 'video', 'file'], NULL, NULL, true, true, '{"webhooks": true, "bots": true}'),
('telegram', 'Telegram', 'telegram', 'messaging', 'bot', 4096, ARRAY['image', 'video', 'file', 'audio'], NULL, 30, true, true, '{"bots": true, "channels": true}'),
('whatsapp', 'WhatsApp', 'whatsapp', 'messaging', 'api', 4096, ARRAY['image', 'video', 'file', 'audio'], NULL, NULL, false, true, '{"business": true}'),
('slack', 'Slack', 'slack', 'community', 'webhook', 40000, ARRAY['image', 'file'], NULL, NULL, true, true, '{"webhooks": true, "bots": true}'),

-- Emerging & Alt Platforms
('threads', 'Threads', 'threads', 'social', 'oauth', 500, ARRAY['image', 'video'], 100, 500, true, true, '{"reposts": true}'),
('mastodon', 'Mastodon', 'mastodon', 'social', 'oauth', 500, ARRAY['image', 'video', 'audio', 'poll'], NULL, NULL, true, true, '{"federated": true, "local": true}'),
('bluesky', 'Bluesky', 'bluesky', 'social', 'api', 300, ARRAY['image'], NULL, NULL, true, true, '{"feeds": true}'),

-- Content & Publishing
('medium', 'Medium', 'medium', 'publishing', 'api', 100000, ARRAY['image'], 10, 100, true, true, '{"publications": true, "series": true}'),
('substack', 'Substack', 'substack', 'publishing', 'api', NULL, ARRAY['image'], NULL, NULL, true, true, '{"newsletters": true, "podcasts": true}'),
('tumblr', 'Tumblr', 'tumblr', 'social', 'oauth', NULL, ARRAY['image', 'video', 'audio'], 250, 2500, true, true, '{"reblogs": true, "queue": true}'),

-- Professional & Niche
('github', 'GitHub', 'github', 'developer', 'oauth', NULL, ARRAY['markdown'], NULL, 5000, true, true, '{"discussions": true, "releases": true}'),
('twitch', 'Twitch', 'twitch', 'streaming', 'oauth', 500, ARRAY['image'], NULL, NULL, true, true, '{"chat": true, "clips": true}'),
('snapchat', 'Snapchat', 'snapchat', 'social', 'api', 80, ARRAY['image', 'video'], NULL, NULL, true, true, '{"stories": true, "spotlight": true}'),

-- Product & Q&A
('producthunt', 'Product Hunt', 'producthunt', 'product', 'api', NULL, ARRAY['image', 'video'], NULL, NULL, true, true, '{"launches": true, "discussions": true}'),
('quora', 'Quora', 'quora', 'qa', 'manual', NULL, ARRAY['image'], NULL, NULL, true, true, '{"spaces": true, "questions": true}'),

-- Audio & Creative
('soundcloud', 'SoundCloud', 'soundcloud', 'audio', 'oauth', 8000, ARRAY['audio'], NULL, NULL, true, true, '{"playlists": true, "reposts": true}'),
('spotify', 'Spotify', 'spotify', 'audio', 'oauth', NULL, ARRAY['audio'], NULL, NULL, true, true, '{"podcasts": true, "playlists": true}'),

-- Membership & Funding
('patreon', 'Patreon', 'patreon', 'membership', 'oauth', NULL, ARRAY['image', 'video', 'audio'], NULL, NULL, true, true, '{"tiers": true, "posts": true}'),

-- Emerging
('lemon8', 'Lemon8', 'lemon8', 'social', 'manual', 2200, ARRAY['image', 'video'], NULL, NULL, true, true, '{"lifestyle": true}'),

-- Job & Professional
('indeed', 'Indeed', 'indeed', 'job', 'manual', NULL, NULL, NULL, NULL, true, true, '{"jobs": true, "company": true}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_platforms_updated_at BEFORE UPDATE ON social_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_post_results_updated_at BEFORE UPDATE ON social_post_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_templates_updated_at BEFORE UPDATE ON social_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_campaigns_updated_at BEFORE UPDATE ON social_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_queue_updated_at BEFORE UPDATE ON social_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_hashtag_sets_updated_at BEFORE UPDATE ON social_hashtag_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_calendar_updated_at BEFORE UPDATE ON social_calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_communities_updated_at BEFORE UPDATE ON social_communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_drip_campaigns_updated_at BEFORE UPDATE ON social_drip_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_competitors_updated_at BEFORE UPDATE ON social_competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_brand_assets_updated_at BEFORE UPDATE ON social_brand_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration Complete
-- ============================================================================
COMMENT ON TABLE social_platforms IS 'Reference table of all supported social media platforms';
COMMENT ON TABLE social_accounts IS 'User-connected social media accounts with OAuth tokens';
COMMENT ON TABLE social_posts IS 'All social media posts (drafts, scheduled, published)';
COMMENT ON TABLE social_post_results IS 'Results of publishing to each platform';
COMMENT ON TABLE social_templates IS 'Reusable post templates';
COMMENT ON TABLE social_campaigns IS 'Marketing campaigns grouping multiple posts';
COMMENT ON TABLE social_queue IS 'Scheduled posts waiting to be published';
COMMENT ON TABLE social_hashtag_sets IS 'Saved hashtag groups for easy reuse';
COMMENT ON TABLE social_analytics IS 'Daily analytics snapshots per account';
COMMENT ON TABLE social_calendar IS 'Content calendar for planning';
COMMENT ON TABLE social_communities IS 'Groups, subreddits, servers to join and engage';
COMMENT ON TABLE social_drip_campaigns IS 'Automated posting sequences';
COMMENT ON TABLE social_competitors IS 'Competitor social media tracking';
COMMENT ON TABLE social_brand_assets IS 'Brand images, logos, templates';
