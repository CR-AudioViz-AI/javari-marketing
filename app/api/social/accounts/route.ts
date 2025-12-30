import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET - Fetch all connected accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('social_accounts')
      .select(`
        id,
        platform_user_id,
        username,
        display_name,
        profile_image_url,
        is_active,
        last_sync_at,
        created_at,
        platform:social_platforms(
          id,
          name,
          display_name,
          icon,
          category,
          api_type,
          character_limit,
          is_free_tier
        )
      `)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (platform) {
      query = query.eq('platform.name', platform);
    }

    const { data: accounts, error } = await query;

    if (error) {
      console.error('Error fetching accounts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      );
    }

    // Transform to cleaner format
    const transformedAccounts = (accounts || []).map(account => ({
      id: account.id,
      platform: account.platform?.name || 'unknown',
      platformDisplayName: account.platform?.display_name,
      username: account.username,
      displayName: account.display_name,
      profileImage: account.profile_image_url,
      isActive: account.is_active,
      isFreeTier: account.platform?.is_free_tier,
      characterLimit: account.platform?.character_limit,
      category: account.platform?.category,
      apiType: account.platform?.api_type,
      lastSync: account.last_sync_at,
      createdAt: account.created_at,
      followers: 0, // Would come from analytics
    }));

    return NextResponse.json({ accounts: transformedAccounts });

  } catch (error) {
    console.error('Error in GET /api/social/accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Connect a new account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      platformName,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      platformUserId,
      username,
      displayName,
      profileImageUrl,
      webhookSecret,
      botToken,
      channelId,
      metadata,
    } = body;

    if (!platformName) {
      return NextResponse.json(
        { error: 'Platform name is required' },
        { status: 400 }
      );
    }

    // Get platform ID
    const { data: platform, error: platformError } = await supabase
      .from('social_platforms')
      .select('id')
      .eq('name', platformName)
      .single();

    if (platformError || !platform) {
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      );
    }

    // Create or update the account
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .upsert({
        platform_id: platform.id,
        platform_user_id: platformUserId,
        username,
        display_name: displayName,
        profile_image_url: profileImageUrl,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        webhook_secret: webhookSecret,
        bot_token: botToken,
        channel_id: channelId,
        metadata: metadata || {},
        is_active: true,
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'platform_id,platform_user_id',
      })
      .select()
      .single();

    if (accountError) {
      console.error('Error creating account:', accountError);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platform: platformName,
        username: account.username,
        displayName: account.display_name,
      },
    });

  } catch (error) {
    console.error('Error in POST /api/social/accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update an account
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Map camelCase to snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.accessToken) dbUpdates.access_token = updates.accessToken;
    if (updates.refreshToken) dbUpdates.refresh_token = updates.refreshToken;
    if (updates.tokenExpiresAt) dbUpdates.token_expires_at = updates.tokenExpiresAt;
    if (updates.displayName) dbUpdates.display_name = updates.displayName;
    if (updates.profileImageUrl) dbUpdates.profile_image_url = updates.profileImageUrl;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.metadata) dbUpdates.metadata = updates.metadata;

    const { data: account, error } = await supabase
      .from('social_accounts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      return NextResponse.json(
        { error: 'Failed to update account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, account });

  } catch (error) {
    console.error('Error in PATCH /api/social/accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting account:', error);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/social/accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
