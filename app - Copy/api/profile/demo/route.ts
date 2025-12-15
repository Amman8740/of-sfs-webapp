import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile/demo - Fetch demo OnlyFans profile data (no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return the real data received from plugin with working images
    const mockData = {
      username: 'danidanielstv',
      display_name: 'Musa Sohail',
      onlyfans_url: 'https://onlyfans.com/danidanielstv',
      fans: 4,
      posts: 459,
      media: 1886,
      photos: 0,
      videos: 0,
      likes: 28,
      subscription_type: 'Free',
      price: 0,
      verified: true,
      bio: '',
      location: '',
      website: 'https://Onlyfans.com/akaDaniDaniels',
      profile_image_url: 'https://thumbs.onlyfans.com/public/files/thumbs/c144/p/pf/pfg/pfgxqheeqydup6tojsxvcoc4punrdfpt1609967190/avatar.jpg', // Working placeholder
      cover_image_url: 'https://public.onlyfans.com/files/s/sz/szs/szs3ij5cbrdj6w4dkqy875ibjqzoh47p1706040628/392983124/header.jpg', // Working placeholder
      joined_date: '',
      last_seen: '459 POSTS',
      social_links: {
        youtube: 'https://youtube.com/@DaniDanielsOfficial',
        twitter: 'https://twitter.com/Akadanidaniels',
        instagram: 'https://instagram.com/Akadanidaniels'
      },
      last_updated: new Date().toISOString(),
      scraped_at: new Date().toISOString()
    };

    return NextResponse.json(mockData);
  } catch (error: any) {
    console.error('Error fetching demo profile data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}
