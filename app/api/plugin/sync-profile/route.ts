import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

/**
 * Bridge API: Receive OnlyFans profile data from plugin
 * This endpoint allows the plugin to sync scraped data to the webapp
 * Note: Each user can only have ONE profile - subsequent syncs update existing profile
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get tokens from headers (sent by plugin)
    const authHeader = request.headers.get('Authorization');
    const refreshToken = request.headers.get('x-refresh-token');

    // If tokens are provided in headers, use them
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      
      // Set the session with provided tokens
      const { data: { session }, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (sessionError) {
        return NextResponse.json({ error: 'Invalid session tokens' }, { status: 401 });
      }
    }

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body with error handling
    let body: any = {};
    try {
      const text = await request.text();
      console.log('📨 Raw request body:', text);
      
      if (!text || text.trim() === '') {
        console.log('⚠️ Empty request body received');
        return NextResponse.json(
          { error: 'Request body is empty. Please send profile data.' },
          { status: 400 }
        );
      }
      
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: String(parseError) },
        { status: 400 }
      );
    }

    const { 
      username, 
      onlyfans_url, 
      fans, 
      subscription_type, 
      price, 
      verified,
      display_name,
      bio,
      location,
      website,
      profile_image_url,
      cover_image_url,
      posts,
      media,
      photos,
      videos,
      likes,
      joined_date,
      last_seen,
      social_links
    } = body;
    console.log('Received profile data from plugin:', body);
    // Validate required fields
    if (!username || !onlyfans_url) {
      return NextResponse.json(
        { error: 'Missing required fields: username and onlyfans_url' },
        { status: 400 }
      );
    }

    // Parse numeric values
    const parseFans = (val: any) => typeof val === 'number' ? val : parseInt(String(val).replace(/[^\d]/g, '')) || 0;
    const parsePrice = (val: any) => typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.]/g, '')) || 0;

    // Check if profile already exists for this user_id (one profile per user)
    const { data: existingProfile } = await (supabase as any)
      .from('onlyfans_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const profileData = {
      user_id: user.id,
      username,
      display_name: display_name || username,
      onlyfans_url,
      fans: parseFans(fans),
      posts: parseFans(posts),
      media: parseFans(media),
      photos: parseFans(photos),
      videos: parseFans(videos),
      likes: parseFans(likes),
      subscription_type: subscription_type || 'Free',
      price: parsePrice(price),
      bio: bio || '',
      location: location || '',
      website: website || '',
      profile_image_url: profile_image_url || '',
      cover_image_url: cover_image_url || '',
      is_verified: verified || false,
      joined_date: joined_date || '',
      last_seen: last_seen || '',
      social_links: social_links || {},
      last_updated: new Date().toISOString(),
      scraped_at: new Date().toISOString(),
    };

    // If profile exists, update it
    if (existingProfile) {
      const { data: updatedProfile, error: updateError } = await (supabase as any)
        .from('onlyfans_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        profile: updatedProfile
      });
    }

    // Create new profile
    const { data: newProfile, error: createError } = await (supabase as any)
      .from('onlyfans_profiles')
      .insert({
        ...profileData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create profile', 
          details: createError.message,
          code: createError.code,
          hint: createError.hint 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: newProfile
    });

  } catch (error: any) {
    console.error('Error syncing profile from plugin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync profile' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch sync status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get tokens from headers (sent by plugin)
    const authHeader = request.headers.get('Authorization');
    const refreshToken = request.headers.get('x-refresh-token');

    // If tokens are provided in headers, use them
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      
      // Set the session with provided tokens
      const { data: { session }, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (sessionError) {
        return NextResponse.json({ error: 'Invalid session tokens' }, { status: 401 });
      }
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Check if profile exists for this user (one profile per user)
    const { data: profile, error } = await (supabase as any)
      .from('onlyfans_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({
        exists: false,
        message: 'Profile not found'
      });
    }

    return NextResponse.json({
      exists: true,
      profile
    });
  } catch (error: any) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}

