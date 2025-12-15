import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

// POST /api/sfs-requests/send-to-agency - Send SFS request to an agency
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseService = await createServiceRoleClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.sender_model_id || !body.receiver_agency_id) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'sender_model_id and receiver_agency_id are required' 
      }, { status: 400 });
    }

    console.log('📨 Creating SFS request to agency:', {
      sender_model_id: body.sender_model_id,
      receiver_agency_id: body.receiver_agency_id
    });

    // Verify sender model exists and user has access
    const { data: senderModel, error: senderError } = await (supabase as any)
      .from('models')
      .select('id, user_id, agency_id, username')
      .eq('id', body.sender_model_id)
      .single();

    if (senderError || !senderModel) {
      return NextResponse.json({ 
        error: 'Sender model not found',
        details: `Model with ID ${body.sender_model_id} does not exist`
      }, { status: 404 });
    }

    // Check if user owns the sender model or is the agency
    if (senderModel.user_id !== user.id && senderModel.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to send requests for this model' 
      }, { status: 403 });
    }

    console.log('✅ Sender model verified:', senderModel.id);

    // Verify receiver agency exists and has user_type = 'agency'
    const { data: receiverAgency, error: agencyError } = await (supabase as any)
      .from('user_profiles')
      .select('id, user_type')
      .eq('id', body.receiver_agency_id)
      .single();

    if (agencyError || !receiverAgency) {
      return NextResponse.json({ 
        error: 'Receiver agency not found',
        details: `Agency with ID ${body.receiver_agency_id} does not exist`
      }, { status: 404 });
    }

    if (receiverAgency.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Receiver is not an agency',
        details: `User ${body.receiver_agency_id} is not an agency account`
      }, { status: 400 });
    }

    console.log('✅ Receiver agency verified:', body.receiver_agency_id);

    // Prevent self-requests
    if (senderModel.user_id === body.receiver_agency_id || senderModel.agency_id === body.receiver_agency_id) {
      return NextResponse.json({ 
        error: 'Cannot send SFS request to yourself or your own agency' 
      }, { status: 400 });
    }

    // Create SFS request with agency_id set
    // Note: We don't set onlyfans_profile_id since this is to the agency, not a specific profile
    const sfsRequestData = {
      user_id: senderModel.user_id,  // SENDER
      agency_id: body.receiver_agency_id,  // RECEIVER AGENCY
      onlyfans_profile_id: null,  // No specific profile target since this is to the agency
      requester_username: String(body.requester_username || senderModel.username).trim(),
      requester_fan_count: body.requester_fan_count ? parseInt(String(body.requester_fan_count), 10) : null,
      requester_media_url: body.requester_media_url ? String(body.requester_media_url).trim() : null,
      requester_tags: Array.isArray(body.requester_tags) ? body.requester_tags : null,
      proposed_date: body.proposed_date ? String(body.proposed_date).trim() : new Date().toISOString().split('T')[0],
      proposed_time: body.proposed_time ? String(body.proposed_time).trim() : null,
      content_slot: body.content_slot ? parseInt(String(body.content_slot), 10) : null,
      compatibility_score: body.compatibility_score ? parseInt(String(body.compatibility_score), 10) : null,
      match_reasons: body.match_reasons || null,
      status: 'pending',
      match_score: body.match_score ? parseInt(String(body.match_score), 10) : null,
    };

    console.log('📝 Creating SFS request with data:', sfsRequestData);

    const { data: sfsRequest, error: sfsError } = await (supabaseService as any)
      .from('sfs_requests')
      .insert(sfsRequestData)
      .select('*')
      .single();

    if (sfsError) {
      console.error('❌ Failed to create SFS request:', sfsError.message);
      return NextResponse.json({ 
        error: 'Failed to send SFS request to agency', 
        details: sfsError.message
      }, { status: 500 });
    }

    console.log('✅ SFS request created:', sfsRequest.id);

    // Create notification for agency
    const notificationData = {
      user_id: body.receiver_agency_id,
      type: 'sfs_request',
      title: 'New SFS Request',
      message: `${body.requester_username || senderModel.username} sent you an SFS request`,
      is_read: false,
      created_at: new Date().toISOString()
    };

    try {
      const { error: notificationError } = await (supabaseService as any)
        .from('notifications')
        .insert(notificationData);
      
      if (notificationError) {
        console.warn('⚠️ Notification creation failed (non-blocking):', notificationError.message);
      } else {
        console.log('✅ Notification created for agency:', body.receiver_agency_id);
      }
    } catch (notificationErr) {
      console.warn('⚠️ Notification creation error (non-blocking):', notificationErr);
    }

    return NextResponse.json({ 
      success: true,
      data: sfsRequest,
      message: 'SFS request sent to agency successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 });
  }
}
