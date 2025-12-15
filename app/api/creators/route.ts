import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/creators - Fetch all creators from user_profiles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Fetch creators from user_profiles
    let query = (supabase as any)
      .from('user_profiles')
      .select(`
        id,
        profile_data,
        created_at
      `)
      .eq('user_type', 'creator')
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (search) {
      // Since profile_data is JSON, we can't easily search it
      // For now, we'll skip search filtering for user_profiles
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: creators, error } = await query;

    if (error) {
      console.error('Error fetching creators:', error);
      return NextResponse.json({ error: 'Failed to fetch creators' }, { status: 500 });
    }

    // Transform the data to include creator names from profile_data
    const transformedCreators = creators?.map((creator: any) => {
      let name = 'Unknown Creator';
      let username = creator.id;

      if (creator.profile_data) {
        try {
          const profileData = typeof creator.profile_data === 'string'
            ? JSON.parse(creator.profile_data)
            : creator.profile_data;

          name = profileData.name || profileData.displayName || profileData.fullName || 
                (profileData.firstName && profileData.lastName ? `${profileData.firstName} ${profileData.lastName}` : name);
          username = profileData.username || profileData.handle || username;
        } catch (e) {
          console.warn('Failed to parse profile_data for creator:', creator.id);
        }
      }

      return {
        id: creator.id,
        name: name,
        username: username,
        created_at: creator.created_at
      };
    }) || [];

    // If no creators found, return some test data for development
    const finalCreators = transformedCreators.length > 0 ? transformedCreators : [
      {
        id: 'test-creator-1',
        name: 'Test Creator 1',
        username: 'testcreator1',
        created_at: new Date().toISOString()
      },
      {
        id: 'test-creator-2', 
        name: 'Test Creator 2',
        username: 'testcreator2',
        created_at: new Date().toISOString()
      },
      {
        id: 'test-creator-3',
        name: 'Test Creator 3', 
        username: 'testcreator3',
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      data: finalCreators,
      success: true
    });

  } catch (error) {
    console.error('Error in creators API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}