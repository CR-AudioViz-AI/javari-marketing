import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CRON_SECRET = process.env.CRON_SECRET || 'cr-javari-cron-2025';

// GET - Process scheduled posts (called by Vercel cron)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Get posts that are scheduled and due
    const { data: duePosts, error } = await supabase
      .from('js_posts')
      .select(`
        id,
        tenant_id,
        tenant:js_tenants(subscription_status, trial_ends_at, plan)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())
      .lt('retry_count', 3)
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!duePosts?.length) {
      return NextResponse.json({
        processed: 0,
        message: 'No scheduled posts due',
        timestamp: now.toISOString(),
      });
    }

    const results: Array<{
      postId: string;
      tenantId: string;
      success: boolean;
      error?: string;
      skipped?: boolean;
    }> = [];

    for (const post of duePosts) {
      const tenant = post.tenant as { subscription_status: string; trial_ends_at: string | null; plan: string } | null;
      
      // Check tenant status
      if (!tenant) {
        results.push({ postId: post.id, tenantId: post.tenant_id, success: false, error: 'Tenant not found' });
        continue;
      }

      // Check if trial expired
      if (tenant.plan === 'trial' && tenant.trial_ends_at) {
        if (new Date(tenant.trial_ends_at) < now) {
          await supabase
            .from('js_posts')
            .update({ 
              status: 'paused',
              last_error: 'Trial expired. Upgrade to publish.',
            })
            .eq('id', post.id);
          
          results.push({ postId: post.id, tenantId: post.tenant_id, success: false, skipped: true, error: 'Trial expired' });
          continue;
        }
      }

      // Check subscription status
      if (['canceled', 'paused', 'expired'].includes(tenant.subscription_status)) {
        await supabase
          .from('js_posts')
          .update({ 
            status: 'paused',
            last_error: 'Subscription inactive. Reactivate to publish.',
          })
          .eq('id', post.id);
        
        results.push({ postId: post.id, tenantId: post.tenant_id, success: false, skipped: true, error: 'Subscription inactive' });
        continue;
      }

      // Call publish endpoint
      try {
        const baseUrl = request.nextUrl.origin;
        const response = await fetch(`${baseUrl}/api/javari-social/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post.id,
            tenantId: post.tenant_id,
          }),
        });

        const result = await response.json();

        results.push({
          postId: post.id,
          tenantId: post.tenant_id,
          success: result.success,
          error: result.error,
        });
      } catch (err) {
        // Increment retry count
        await supabase
          .from('js_posts')
          .update({ 
            retry_count: (post as { retry_count?: number }).retry_count || 0 + 1,
            last_error: String(err),
          })
          .eq('id', post.id);

        results.push({
          postId: post.id,
          tenantId: post.tenant_id,
          success: false,
          error: String(err),
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const skippedCount = results.filter(r => r.skipped).length;

    return NextResponse.json({
      processed: results.length,
      successful: successCount,
      skipped: skippedCount,
      failed: results.length - successCount - skippedCount,
      results,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Cron handler failed' }, { status: 500 });
  }
}

// POST - Also handle trial expiry checks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, action } = body;

    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'check_trials') {
      const now = new Date();
      
      // Find expired trials
      const { data: expiredTrials, error } = await supabase
        .from('js_tenants')
        .select('id, name, owner_user_id, trial_ends_at')
        .eq('plan', 'trial')
        .eq('subscription_status', 'trialing')
        .lt('trial_ends_at', now.toISOString());

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      let processed = 0;

      for (const tenant of expiredTrials || []) {
        // Update tenant status
        await supabase
          .from('js_tenants')
          .update({
            subscription_status: 'trial_expired',
            paused_at: now.toISOString(),
            data_deletion_scheduled_at: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            max_posts_per_month: 0,
            updated_at: now.toISOString(),
          })
          .eq('id', tenant.id);

        // Pause scheduled posts
        await supabase
          .from('js_posts')
          .update({ 
            status: 'paused',
            last_error: 'Trial expired. Upgrade to continue.',
          })
          .eq('tenant_id', tenant.id)
          .eq('status', 'scheduled');

        processed++;
      }

      return NextResponse.json({
        action: 'check_trials',
        processed,
        expiredTrials: expiredTrials?.length || 0,
        timestamp: now.toISOString(),
      });
    }

    if (action === 'cleanup_old_data') {
      const now = new Date();
      
      // Find tenants scheduled for data deletion
      const { data: toDelete } = await supabase
        .from('js_tenants')
        .select('id, name')
        .lte('data_deletion_scheduled_at', now.toISOString());

      let deleted = 0;

      for (const tenant of toDelete || []) {
        // Archive instead of delete (soft delete)
        await supabase
          .from('js_tenants')
          .update({
            is_active: false,
            metadata: {
              archived_at: now.toISOString(),
              reason: 'Data retention period expired',
            },
          })
          .eq('id', tenant.id);

        deleted++;
      }

      return NextResponse.json({
        action: 'cleanup_old_data',
        archived: deleted,
        timestamp: now.toISOString(),
      });
    }

    if (action === 'reset_daily_limits') {
      // Reset daily post counters on connections
      const { error } = await supabase
        .from('js_connections')
        .update({ 
          posts_today: 0,
          posts_today_reset_at: new Date().toISOString(),
        })
        .lt('posts_today_reset_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        action: 'reset_daily_limits',
        success: true,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Cron POST error:', error);
    return NextResponse.json({ error: 'Cron handler failed' }, { status: 500 });
  }
}
