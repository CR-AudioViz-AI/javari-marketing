import { NextRequest, NextResponse } from 'next/server';

const BLUESKY_API = 'https://bsky.social/xrpc';

interface BlueskySession {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

// Create a session (login)
async function createSession(identifier: string, password: string): Promise<BlueskySession | null> {
  try {
    const response = await fetch(`${BLUESKY_API}/com.atproto.server.createSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

// POST - Create a Bluesky post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      identifier, // username or email
      password,   // app password (not main password)
      content,
      linkUrl,
      mediaUrls
    } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Bluesky identifier and password required' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check character limit
    if (content.length > 300) {
      return NextResponse.json(
        { error: 'Content exceeds 300 character limit' },
        { status: 400 }
      );
    }

    // Login to get session
    const session = await createSession(identifier, password);
    if (!session) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Bluesky' },
        { status: 401 }
      );
    }

    // Build the post record
    const now = new Date().toISOString();
    const record: {
      $type: string;
      text: string;
      createdAt: string;
      facets?: Array<{
        index: { byteStart: number; byteEnd: number };
        features: Array<{ $type: string; uri?: string; tag?: string }>;
      }>;
      embed?: {
        $type: string;
        external?: {
          uri: string;
          title: string;
          description: string;
        };
      };
    } = {
      $type: 'app.bsky.feed.post',
      text: content,
      createdAt: now,
    };

    // Extract URLs and hashtags for facets
    const facets: Array<{
      index: { byteStart: number; byteEnd: number };
      features: Array<{ $type: string; uri?: string; tag?: string }>;
    }> = [];

    // Find URLs in text
    const urlRegex = /https?:\/\/[^\s]+/g;
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      const byteStart = Buffer.from(content.slice(0, match.index)).length;
      const byteEnd = byteStart + Buffer.from(match[0]).length;
      facets.push({
        index: { byteStart, byteEnd },
        features: [{ $type: 'app.bsky.richtext.facet#link', uri: match[0] }],
      });
    }

    // Find hashtags
    const hashtagRegex = /#(\w+)/g;
    while ((match = hashtagRegex.exec(content)) !== null) {
      const byteStart = Buffer.from(content.slice(0, match.index)).length;
      const byteEnd = byteStart + Buffer.from(match[0]).length;
      facets.push({
        index: { byteStart, byteEnd },
        features: [{ $type: 'app.bsky.richtext.facet#tag', tag: match[1] }],
      });
    }

    if (facets.length > 0) {
      record.facets = facets;
    }

    // Add link card if provided
    if (linkUrl) {
      record.embed = {
        $type: 'app.bsky.embed.external',
        external: {
          uri: linkUrl,
          title: 'Shared Link',
          description: '',
        },
      };
    }

    // Create the post
    const postResponse = await fetch(`${BLUESKY_API}/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessJwt}`,
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record,
      }),
    });

    const postData = await postResponse.json();

    if (!postResponse.ok) {
      console.error('Bluesky post error:', postData);
      return NextResponse.json(
        { 
          error: 'Failed to create Bluesky post',
          details: postData.message 
        },
        { status: postResponse.status }
      );
    }

    // Build the post URL
    const postUrl = `https://bsky.app/profile/${session.handle}/post/${postData.uri.split('/').pop()}`;

    return NextResponse.json({
      success: true,
      platform: 'bluesky',
      postUrl,
      uri: postData.uri,
      cid: postData.cid,
      handle: session.handle,
      timestamp: now,
    });

  } catch (error) {
    console.error('Error in Bluesky API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Validate credentials
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');
  const password = searchParams.get('password');

  if (!identifier || !password) {
    return NextResponse.json(
      { error: 'Identifier and password required' },
      { status: 400 }
    );
  }

  const session = await createSession(identifier, password);
  
  if (session) {
    return NextResponse.json({
      valid: true,
      handle: session.handle,
      did: session.did,
    });
  } else {
    return NextResponse.json(
      { valid: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
