import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY || 'cr-javari-social-encryption-key!';

function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

interface PublishResult {
  platform: string;
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
}

// Platform-specific publishers
async function publishToDiscord(content: string, credentials: { webhook_url: string }, mediaUrls?: string[]): Promise<PublishResult> {
  try {
    const payload: { content: string; embeds?: Array<{ image: { url: string } }> } = { content };
    if (mediaUrls?.length) {
      payload.embeds = mediaUrls.slice(0, 4).map(url => ({ image: { url } }));
    }
    
    const response = await fetch(credentials.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    return { 
      platform: 'discord', 
      success: response.ok, 
      error: response.ok ? undefined : 'Webhook failed' 
    };
  } catch (error) {
    return { platform: 'discord', success: false, error: String(error) };
  }
}

async function publishToSlack(content: string, credentials: { webhook_url: string }): Promise<PublishResult> {
  try {
    const response = await fetch(credentials.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content }),
    });
    
    return { 
      platform: 'slack', 
      success: response.ok, 
      error: response.ok ? undefined : 'Webhook failed' 
    };
  } catch (error) {
    return { platform: 'slack', success: false, error: String(error) };
  }
}

async function publishToTelegram(content: string, credentials: { bot_token: string; chat_id: string }): Promise<PublishResult> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${credentials.bot_token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: credentials.chat_id,
          text: content,
          parse_mode: 'HTML',
        }),
      }
    );
    
    const data = await response.json();
    return { 
      platform: 'telegram', 
      success: data.ok,
      platformPostId: data.result?.message_id?.toString(),
      error: data.ok ? undefined : data.description,
    };
  } catch (error) {
    return { platform: 'telegram', success: false, error: String(error) };
  }
}

async function publishToBluesky(content: string, credentials: { identifier: string; password: string }): Promise<PublishResult> {
  try {
    // Login
    const loginRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!loginRes.ok) {
      return { platform: 'bluesky', success: false, error: 'Authentication failed' };
    }
    
    const session = await loginRes.json();
    
    // Create post (300 char limit)
    const postContent = content.length > 300 ? content.substring(0, 297) + '...' : content;
    
    const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessJwt}`,
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record: {
          $type: 'app.bsky.feed.post',
          text: postContent,
          createdAt: new Date().toISOString(),
        },
      }),
    });
    
    const postData = await postRes.json();
    
    if (postRes.ok) {
      const postId = postData.uri.split('/').pop();
      return { 
        platform: 'bluesky', 
        success: true,
        platformPostId: postId,
        platformUrl: `https://bsky.app/profile/${session.handle}/post/${postId}`,
      };
    }
    
    return { platform: 'bluesky', success: false, error: postData.message };
  } catch (error) {
    return { platform: 'bluesky', success: false, error: String(error) };
  }
}

// Main publish endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, tenantId } = body;

    if (!postId || !tenantId) {
      return NextResponse.json({ error: 'postId and tenantId required' }, { status: 400 });
    }

    // Get post
    const { data: post, error: postError } = await supabase
      .from('js_posts')
      .select('*, brand:js_brand_profiles(*)')
      .eq('id', postId)
      .eq('tenant_id', tenantId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.status === 'published') {
      return NextResponse.json({ error: 'Post already published' }, { status: 400 });
    }

    // Update status to publishing
    await supabase
      .from('js_posts')
      .update({ status: 'publishing' })
      .eq('id', postId);

    // Get connections for target platforms
    const { data: connections } = await supabase
      .from('js_connections')
      .select(`
        *,
        platform:js_platforms(name, display_name, rate_limit_per_hour, rate_limit_per_day)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .in('platform_id', 
        await supabase
          .from('js_platforms')
          .select('id')
          .in('name', post.target_platforms)
          .then(r => r.data?.map(p => p.id) || [])
      );

    if (!connections?.length) {
      await supabase
        .from('js_posts')
        .update({ status: 'failed', last_error: 'No active connections for target platforms' })
        .eq('id', postId);
      
      return NextResponse.json({ 
        error: 'No active connections for target platforms',
        targetPlatforms: post.target_platforms,
      }, { status: 400 });
    }

    const results: PublishResult[] = [];

    // Publish to each platform
    for (const connection of connections) {
      const platformName = connection.platform?.name;
      
      // Get adapted content for this platform
      const adaptedContent = post.platform_content?.[platformName]?.content || post.original_content;
      
      // Decrypt credentials
      let credentials;
      try {
        credentials = JSON.parse(decrypt(connection.credentials_encrypted));
      } catch {
        results.push({ 
          platform: platformName, 
          success: false, 
          error: 'Failed to decrypt credentials' 
        });
        continue;
      }

      // Check rate limits
      const now = new Date();
      if (connection.posts_today >= (connection.platform?.rate_limit_per_day || 1000)) {
        results.push({
          platform: platformName,
          success: false,
          error: `Daily rate limit reached for ${connection.platform?.display_name}. Try again tomorrow.`,
        });
        continue;
      }

      // Publish based on platform
      let result: PublishResult;
      
      switch (platformName) {
        case 'discord':
          result = await publishToDiscord(adaptedContent, credentials, post.media_urls);
          break;
        case 'slack':
          result = await publishToSlack(adaptedContent, credentials);
          break;
        case 'telegram':
          result = await publishToTelegram(adaptedContent, credentials);
          break;
        case 'bluesky':
          result = await publishToBluesky(adaptedContent, credentials);
          break;
        default:
          result = { 
            platform: platformName, 
            success: false, 
            error: `Publisher not yet implemented for ${platformName}. Coming soon!` 
          };
      }

      results.push(result);

      // Save result
      await supabase.from('js_post_results').insert({
        post_id: postId,
        connection_id: connection.id,
        platform: platformName,
        status: result.success ? 'success' : 'failed',
        platform_post_id: result.platformPostId,
        platform_url: result.platformUrl,
        content_sent: adaptedContent,
        character_count: adaptedContent.length,
        error_message: result.error,
        posted_at: result.success ? new Date().toISOString() : null,
      });

      // Update connection rate limit counter
      if (result.success) {
        await supabase
          .from('js_connections')
          .update({ 
            posts_today: (connection.posts_today || 0) + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', connection.id);
      }
    }

    // Update post status
    const successCount = results.filter(r => r.success).length;
    const finalStatus = successCount === results.length ? 'published' 
      : successCount > 0 ? 'partially_published' 
      : 'failed';

    await supabase
      .from('js_posts')
      .update({ 
        status: finalStatus,
        last_error: successCount === 0 ? results[0]?.error : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    return NextResponse.json({
      success: successCount > 0,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
      },
      results,
      postStatus: finalStatus,
    });

  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get publish status for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const tenantId = searchParams.get('tenantId');

    if (!postId || !tenantId) {
      return NextResponse.json({ error: 'postId and tenantId required' }, { status: 400 });
    }

    const { data: results, error } = await supabase
      .from('js_post_results')
      .select(`
        *,
        connection:js_connections(
          platform_username,
          platform:js_platforms(name, display_name, icon)
        )
      `)
      .eq('post_id', postId)
      .order('created_at');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const successCount = results?.filter(r => r.status === 'success').length || 0;

    return NextResponse.json({
      results,
      summary: {
        total: results?.length || 0,
        successful: successCount,
        failed: (results?.length || 0) - successCount,
      },
    });

  } catch (error) {
    console.error('Get publish status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
