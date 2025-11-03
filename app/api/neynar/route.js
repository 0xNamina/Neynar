import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Cek apakah query adalah FID (angka) atau username
    const isFid = /^\d+$/.test(query.trim());
    
    let url;
    if (isFid) {
      url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${query.trim()}`;
    } else {
      const username = query.trim().replace('@', '');
      url = `https://api.neynar.com/v2/farcaster/user/search?q=${username}&limit=1`;
    }

    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch from Neynar API', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Parse response berdasarkan tipe query
    let user;
    if (isFid) {
      user = data.users && data.users[0];
    } else {
      user = data.result && data.result.users && data.result.users[0];
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return hanya data yang diperlukan
    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfp: user.pfp_url,
      score: user.experimental?.neynar_user_score || user.neynar_user_score || 0,
      followerCount: user.follower_count,
      followingCount: user.following_count
    });

  } catch (error) {
    console.error('Error fetching Neynar data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
