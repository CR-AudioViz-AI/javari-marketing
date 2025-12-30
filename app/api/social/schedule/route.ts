import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET - Fetch scheduled posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data: scheduledPosts, error } = await supabase
      .from('social_queue')
      .select(`
        id,
        scheduled_for,
        status,
        attempts,
        last_attempt_at,
        error_log,
        created_at,
        post:social_posts(
          id,
          content,
          link_url,
          hashtags,
          media_urls
        ),
        account:social_accounts(
          id,
          username,
          display_name,
          platform:social_platforms(name, display_name, icon)
        )
      `)
      .eq('status', status)
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching scheduled posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      );
    }

    // Transform and group by post
    const groupedPosts = new Map<string, {
      id: string;
      content: string;
      scheduledFor: string;
      status: string;
      platforms: string[];
      accounts: Array<{ id: string; platform: string; username: string }>;
      media?: string[];
    }>();

    for (const item of scheduledPosts || []) {
      const postId = item.post?.id;
      if (!postId) continue;

      if (!groupedPosts.has(postId)) {
        groupedPosts.set(postId, {
          id: postId,
          content: item.post?.content || '',
          scheduledFor: item.scheduled_for,
          status: item.status,
          platforms: [],
          accounts: [],
          media: item.post?.media_urls,
        });
      }

      const group = groupedPosts.get(postId)!;
      const platform = item.account?.platform?.name;
      if (platform && !group.platforms.includes(platform)) {
        group.platforms.push(platform);
      }
      group.accounts.push({
        id: item.account?.id,
        platform: platform || 'unknown',
        username: item.account?.username || '',
      });
    }

    return NextResponse.json({
      posts: Array.from(groupedPosts.values()),
    });

  } catch (error) {
    console.error('Error in GET /api/social/schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Schedule a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, accountIds, scheduledFor, linkUrl, hashtags, mediaUrls } = body;

    if (!content || !accountIds || accountIds.length === 0 || !scheduledFor) {
      return NextResponse.json(
        { error: 'Content, accounts, and scheduled time are required' },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Create the post record
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .insert({
        content,
        link_url: linkUrl,
        hashtags: hashtags || [],
        media_urls: mediaUrls || [],
        scheduled_for: scheduledFor,
        status: 'scheduled',
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // Create queue entries for each account
    const queueEntries = accountIds.map((accountId: string) => ({
      post_id: post.id,
      account_id: accountId,
      scheduled_for: scheduledFor,
      status: 'pending',
    }));

    const { error: queueError } = await supabase
      .from('social_queue')
      .insert(queueEntries);

    if (queueError) {
      console.error('Error creating queue entries:', queueError);
      // Rollback post creation
      await supabase.from('social_posts').delete().eq('id', post.id);
      return NextResponse.json(
        { error: 'Failed to schedule post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: post.id,
      scheduledFor,
      accountCount: accountIds.length,
    });

  } catch (error) {
    console.error('Error in POST /api/social/schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a scheduled post
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, content, scheduledFor, linkUrl, hashtags } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (content) updates.content = content;
    if (scheduledFor) updates.scheduled_for = scheduledFor;
    if (linkUrl !== undefined) updates.link_url = linkUrl;
    if (hashtags) updates.hashtags = hashtags;

    // Update the post
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (postError) {
      console.error('Error updating post:', postError);
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      );
    }

    // Update queue entries if scheduled time changed
    if (scheduledFor) {
      await supabase
        .from('social_queue')
        .update({ scheduled_for: scheduledFor })
        .eq('post_id', postId)
        .eq('status', 'pending');
    }

    return NextResponse.json({ success: true, post });

  } catch (error) {
    console.error('Error in PATCH /api/social/schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a scheduled post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Delete queue entries
    const { error: queueError } = await supabase
      .from('social_queue')
      .delete()
      .eq('post_id', postId);

    if (queueError) {
      console.error('Error deleting queue entries:', queueError);
    }

    // Delete the post
    const { error: postError } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);

    if (postError) {
      console.error('Error deleting post:', postError);
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/social/schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
