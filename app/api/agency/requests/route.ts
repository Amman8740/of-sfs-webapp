import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

/**
 * POST /api/agency/requests
 * Agency approves or rejects a creator's join request
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Get the current user (agency)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check if they're an agency
    const { data: agencyProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !agencyProfile || agencyProfile.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Only agencies can manage join requests' 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log('Processing request:', { requestId, action, agencyId: user.id });

    // Get the join request using admin client to bypass RLS
    const { data: joinRequest, error: requestError } = await (supabaseAdmin as any)
      .from('agency_join_requests')
      .select('*')
      .eq('id', requestId)
      .eq('agency_id', user.id)
      .single();

    console.log('Join request lookup result:', { joinRequest, error: requestError });

    if (requestError || !joinRequest) {
      console.error('Request not found or error:', requestError);
      return NextResponse.json({ 
        error: 'Request not found',
        debug: requestError?.message || 'No request found'
      }, { status: 404 });
    }

    if (joinRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: `Request is already ${joinRequest.status}` 
      }, { status: 400 });
    }

    // Update request status using admin client
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { data: updatedRequest, error: updateError } = await (supabaseAdmin as any)
      .from('agency_join_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating join request:', updateError);
      return NextResponse.json({ error: 'Failed to update request', debug: updateError.message }, { status: 500 });
    }

    console.log('Request updated successfully:', { requestId, newStatus });

    // Get creator's email for notification
    const { data: { user: creatorUser }, error: creatorError } = await supabase.auth.admin.getUserById(joinRequest.creator_id);
    const creatorEmail = creatorUser?.email || 'Unknown';

    // Create notification for the creator
    const notificationTitle = action === 'approve' 
      ? 'Agency Join Request Approved'
      : 'Agency Join Request Rejected';
    
    const notificationMessage = action === 'approve'
      ? 'Your request to join the agency has been approved!'
      : 'Your request to join the agency has been rejected.';

    const { error: notifError } = await (supabaseAdmin as any)
      .from('notifications')
      .insert({
        user_id: joinRequest.creator_id,
        type: action === 'approve' ? 'success' : 'warning',
        title: notificationTitle,
        message: notificationMessage,
        related_entity_id: requestId,
        related_entity_type: 'agency_join_request',
        is_read: false
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the request if notification fails
    }

    // If approved, optionally update creator's profile to link with agency
    if (action === 'approve') {
      const { error: updateProfileError } = await (supabaseAdmin as any)
        .from('user_profiles')
        .update({ agency_id: user.id })
        .eq('id', joinRequest.creator_id);

      if (updateProfileError) {
        console.error('Error updating creator profile:', updateProfileError);
        // Don't fail the request
      }

      // Also update the models table to link the creator's model with the agency
      const { error: updateModelError } = await (supabaseAdmin as any)
        .from('models')
        .update({ agency_id: user.id })
        .eq('user_id', joinRequest.creator_id);

      if (updateModelError) {
        console.error('Error updating creator model:', updateModelError);
        // Don't fail the request
      }
    }

    return NextResponse.json({
      success: true,
      message: `Join request ${action}ed successfully`,
      request: updatedRequest
    });

  } catch (error) {
    console.error('Error in POST /api/agency/requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/agency/requests
 * Get all join requests for an agency
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Get the current user (agency)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check if they're an agency
    const { data: agencyProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !agencyProfile || agencyProfile.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Only agencies can view join requests' 
      }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // First, check ALL data in the table (bypass RLS with admin client)
    const { data: allRequests, error: allError } = await (supabaseAdmin as any)
      .from('agency_join_requests')
      .select('*');

    // Get join requests for this specific agency using admin client
    let query = (supabaseAdmin as any)
      .from('agency_join_requests')
      .select('*', { count: 'exact' })
      .eq('agency_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error, count } = await query.range(offset, offset + limit - 1);

    console.log('Fetched requests for agency:', requests?.length, 'Total count:', count, 'User ID:', user.id);

    if (error) {
      console.error('Error fetching requests:', error);
      console.error('User ID:', user.id);
      console.error('Status filter:', status);
      return NextResponse.json({ error: 'Failed to fetch requests', details: error }, { status: 500 });
    }

    // Enrich requests with creator information if not already present
    const enrichedRequests = await Promise.all((requests || []).map(async (req: any) => {
      // If creator info is already in the request, use it
      if (req.creator_name || req.creator_email || req.creator_username || req.creator_avatar_url) {
        return req;
      }

      // Otherwise, fetch from users and user_profiles tables
      const { data: creatorUser } = await (supabaseAdmin as any)
        .from('users')
        .select('full_name, email, avatar_url')
        .eq('id', req.creator_id)
        .single();

      const { data: creatorProfile } = await (supabaseAdmin as any)
        .from('user_profiles')
        .select('profile_data')
        .eq('id', req.creator_id)
        .single();

      const profileData = creatorProfile?.profile_data || {};
      const username = profileData.username || creatorUser?.email?.split('@')[0] || 'unknown';

      return {
        ...req,
        creator_name: req.creator_name || creatorUser?.full_name || 'Unknown',
        creator_email: req.creator_email || creatorUser?.email || 'Unknown',
        creator_username: req.creator_username || username,
        creator_avatar_url: req.creator_avatar_url || creatorUser?.avatar_url || null,
      };
    }));

    return NextResponse.json({
      requests: enrichedRequests,
      total: count || 0,
      limit,
      offset,
      debug: {
        userId: user.id,
        userEmail: user.email,
        totalInDB: allRequests?.length || 0,
        matchingAgency: enrichedRequests?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in GET /api/agency/requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
