import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Get current user (agency)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to confirm agency status
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.user_type !== 'agency') {
      return NextResponse.json({ error: 'Only agencies can access this endpoint' }, { status: 403 });
    }

    // Get current user details for admin
    const { data: adminProfile } = await (supabase as any)
      .from('user_profiles')
      .select('profile_data')
      .eq('id', user.id)
      .single();

    // Fetch all approved creators linked to this agency (have agency_id)
    const { data: linkedCreators, error: linkedError } = await (supabaseAdmin as any)
      .from('user_profiles')
      .select('id, profile_data')
      .eq('agency_id', user.id)
      .eq('user_type', 'creator');

    if (linkedError) {
      console.error('Error fetching linked creators:', linkedError);
    }


    // Fetch join requests (both pending and approved) for this agency
    const { data: joinRequests, error: requestsError } = await (supabaseAdmin as any)
      .from('agency_join_requests')
      .select('*')
      .eq('agency_id', user.id)
      .in('status', ['pending', 'approved']);

    if (requestsError) {
      console.error('Error fetching join requests:', requestsError);
    }


    // Combine both sources and deduplicate
    const creatorSet = new Map();

    // Add linked creators first
    (linkedCreators || []).forEach((creator: any) => {
      creatorSet.set(creator.id, {
        id: creator.id,
        name: creator.profile_data?.full_name || creator.profile_data?.firstName || 'Unknown Creator',
        email: creator.profile_data?.email || 'unknown@email.com',
        role: 'Creator',
        status: 'approved',
        source: 'linked'
      });
    });

    // Add join request creators
    (joinRequests || []).forEach((req: any) => {
      const creatorId = req.creator_id;
      
      // Only add if not already added from linked creators, or if we want to show join request status
      if (!creatorSet.has(creatorId)) {
        creatorSet.set(creatorId, {
          id: creatorId,
          name: req.creator_name || 'Unknown Creator',
          email: req.creator_email || 'unknown@email.com',
          username: req.creator_username || 'unknown',
          avatar_url: req.creator_avatar_url || null,
          role: 'Creator',
          status: req.status, // 'pending' or 'approved'
          source: 'join_request'
        });
      }
    });

    const creators = Array.from(creatorSet.values());

    return NextResponse.json({
      success: true,
      agencyId: user.id,
      agencyAdmin: {
        id: user.id,
        email: user.email,
        name: adminProfile?.profile_data?.full_name || user.user_metadata?.full_name || 'Admin',
        role: 'Admin'
      },
      creators,
      total: creators.length,
      stats: {
        linked: linkedCreators?.length || 0,
        joinRequests: joinRequests?.length || 0,
        pending: (joinRequests || []).filter((r: any) => r.status === 'pending').length,
        approved: (joinRequests || []).filter((r: any) => r.status === 'approved').length
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/agency/people:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
