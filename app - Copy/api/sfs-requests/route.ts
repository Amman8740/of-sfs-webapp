import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { Database } from '@/types_db';
import { match } from 'assert';

// GET /api/sfs-requests - Fetch SFS requests (sent or received)
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
    const status = searchParams.get('status');
    const type = searchParams.get('type') || 'sent'; // 'sent', 'received', or 'incoming'/'outgoing' for backwards compatibility

    // Map old parameter names to new ones
    let requestType = type;
    if (type === 'outgoing') requestType = 'sent';
    if (type === 'incoming') requestType = 'received';

    console.log(`📨 Fetching ${requestType} SFS requests for user:`, user.id);

    // Get user profile to check if they're an agency
    const { data: userProfile } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    const isAgency = userProfile?.user_type === 'agency';
    console.log(`👤 User type: ${isAgency ? 'AGENCY' : 'CREATOR'}`);

    let query = (supabase as any)
      .from('sfs_requests')
      .select(`
        id,
        user_id,
        agency_id,
        onlyfans_profile_id,
        requester_username,
        requester_fan_count,
        requester_media_url,
        requester_tags,
        proposed_date,
        proposed_time,
        content_slot,
        status,
        created_at,
        compatibility_score,
        match_score,
        match_reasons
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(50); // Reduced from 100 for faster response

    // Filter by type (sent/received)
    if (requestType === 'sent') {
      // Sent requests: Filter by agency_id OR user_id (for both agencies and creators)
      // Agency sends: agency_id matches current user
      // Creator sends: user_id matches current user
      console.log(`📤 Fetching SENT requests - WHERE agency_id OR user_id = current user: ${user.id}`);
      console.log(`👤 User type: ${isAgency ? 'AGENCY' : 'CREATOR'}`);
      query = query.or(`agency_id.eq.${user.id},user_id.eq.${user.id}`);
    } else if (requestType === 'received') {
      // Received requests: Different logic based on user type
      if (isAgency) {
        // For agencies: Requests sent TO their models
        // Need to find requests where the onlyfans_profile_id belongs to a creator in this agency
        console.log('📥 Fetching RECEIVED requests (AGENCY) - Finding profiles belonging to this agency');
        
        // Get all models owned by this agency
        const { data: agencyModels, error: modelsError } = await (supabase as any)
          .from('models')
          .select('user_id')
          .eq('agency_id', user.id);

        if (modelsError || !agencyModels || agencyModels.length === 0) {
          console.log('⚠️ Agency has no models or error fetching models');
          const response = NextResponse.json({ 
            success: true,
            data: [],
            type: requestType,
            count: 0
          }, { status: 200 });
          response.headers.set('Cache-Control', 'private, max-age=60');
          return response;
        }

        // Get all onlyfans profiles owned by creators in this agency
        const creatorUserIds = agencyModels.map((m: any) => m.user_id);
        const { data: agencyProfiles, error: profilesError } = await (supabase as any)
          .from('onlyfans_profiles')
          .select('id')
          .in('user_id', creatorUserIds);

        if (profilesError || !agencyProfiles || agencyProfiles.length === 0) {
          console.log('⚠️ Agency creators have no onlyfans profiles or error fetching profiles');
          const response = NextResponse.json({ 
            success: true,
            data: [],
            type: requestType,
            count: 0
          }, { status: 200 });
          response.headers.set('Cache-Control', 'private, max-age=60');
          return response;
        }

        const profileIds = agencyProfiles.map((p: any) => p.id);
        console.log(`📦 Found ${profileIds.length} onlyfans profiles for agency`);
        query = query.in('onlyfans_profile_id', profileIds);
      } else {
        // For creators: Requests sent to their onlyfans profiles
        console.log('📥 Fetching RECEIVED requests (CREATOR) - WHERE onlyfans_profile_id is their profile');
        
        // First get all onlyfans profiles owned by this creator
        const { data: creatorProfiles, error: profilesError } = await (supabase as any)
          .from('onlyfans_profiles')
          .select('id')
          .eq('user_id', user.id);

        if (profilesError || !creatorProfiles || creatorProfiles.length === 0) {
          console.log('⚠️ Creator has no onlyfans profiles or error fetching profiles');
          const response = NextResponse.json({ 
            success: true,
            data: [],
            type: requestType,
            count: 0
          }, { status: 200 });
          response.headers.set('Cache-Control', 'private, max-age=60');
          return response;
        }

        const profileIds = creatorProfiles.map((p: any) => p.id);
        console.log(`📦 Found ${profileIds.length} onlyfans profiles for creator`);
        query = query.in('onlyfans_profile_id', profileIds);
      }
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    console.log(`🔍 Querying ${requestType} SFS requests for user:`, user.id);

    const { data: sfsRequests, error } = await query;

    if (error) {
      console.error(`❌ Error fetching ${requestType} SFS requests:`, error);
      console.error('Error details:', { code: error.code, message: error.message });
      return NextResponse.json({ 
        error: `Failed to fetch ${requestType} SFS requests`,
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log(`📊 Found ${sfsRequests?.length || 0} ${requestType} requests`);

    // Get sender model details for all requests
    const senderUserIds = Array.from(new Set((sfsRequests || []).map((req: any) => req.user_id)));
    let modelsByUserId: { [key: string]: any } = {};
    
    if (senderUserIds.length > 0) {
      console.log(`🔍 Fetching model details for ${senderUserIds.length} sender users`);
      const { data: models, error: modelsError } = await (supabase as any)
        .from('models')
        .select('id, user_id, name, username, fan_count')
        .in('user_id', senderUserIds);
      
      if (!modelsError && models) {
        // Create a map of user_id -> model for quick lookup
        modelsByUserId = models.reduce((acc: any, model: any) => {
          acc[model.user_id] = model;
          return acc;
        }, {});
        console.log(`✅ Loaded model details:`, modelsByUserId);
      } else if (modelsError) {
        console.warn(`⚠️ Failed to fetch model details:`, modelsError);
      }
    }

    // Transform data for frontend
    const transformedRequests = (sfsRequests || []).map((req: any) => {
      const statusMap: { [key: string]: string } = {
        'pending': 'Waiting',
        'approved': 'Approved',
        'declined': 'Denied',
        'completed': 'Completed',
        'waiting': 'Waiting'
      };

      // Get sender model details
      const senderModel = modelsByUserId[req.user_id];
      const senderModelName = senderModel?.name || senderModel?.username || req.requester_username || 'Unknown Model';

      return {
        id: req.id,
        media: {
          thumbnail: req.requester_media_url || '/placeholder.jpg',
          selected: false
        },
        matchScore: req.match_score,
        compatibilityScore: req.compatibility_score,
        creator: `@${req.requester_username || 'unknown'}`,
        modelName: senderModelName,  // Add model name
        fanCount: req.requester_fan_count || 0,
        tags: req.requester_tags || [],
        date: new Date(req.proposed_date || req.created_at).toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: new Date(req.proposed_date || req.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        contentSlot: req.content_slot || 1,
        status: statusMap[req.status?.toLowerCase()] || req.status || 'Waiting',
        actions: req.status?.toLowerCase() === 'pending' && requestType === 'received' 
          ? ['approve', 'decline', 'details'] 
          : ['details'],
        requestId: req.id
      };
      
    });

    console.log(`✅ Transformed ${transformedRequests.length} requests for frontend`);

    // Add cache headers for faster response
    const response = NextResponse.json({ 
      success: true,
      data: transformedRequests,
      type: requestType,
      count: transformedRequests.length
    }, { status: 200 });
    
    response.headers.set('Cache-Control', 'private, max-age=60'); // 1 minute cache
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Unexpected error in GET SFS requests:', errorMessage);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
}

// POST /api/sfs-requests - Create a new SFS request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields - accept both sender_id/receiver_id and user_id/onlyfans_profile_id
    const senderId = body.sender_id || body.user_id;
    const receiverId = body.receiver_id || body.onlyfans_profile_id;

    console.log('📨 POST /api/sfs-requests - Request received:', {
      senderId,
      receiverId,
      senderName: body.sender_name,
      receiverName: body.receiver_name,
      compatibilityScore: body.compatibility_score,
      allBodyKeys: Object.keys(body)
    });

    if (!senderId || !receiverId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'sender_id (user_id) and receiver_id (onlyfans_profile_id) are required',
        received: { sender_id: body.sender_id, user_id: body.user_id, receiver_id: body.receiver_id, onlyfans_profile_id: body.onlyfans_profile_id }
      }, { status: 400 });
    }

    // Prevent self-requests
    if (senderId === receiverId) {
      return NextResponse.json({ 
        error: 'Cannot send SFS request to yourself' 
      }, { status: 400 });
    }

    // Verify sender model exists
    console.log(`🔍 Looking up sender model with ID: ${senderId}`);
    const { data: senderModel, error: senderError } = await (supabase as any)
      .from('models')
      .select('id, user_id, agency_id, name, username, fan_count')
      .eq('id', senderId)
      .single();

    if (senderError || !senderModel) {
      console.error(`❌ Sender model not found:`, senderError);
      return NextResponse.json({ 
        error: 'Sender model not found',
        details: `Could not find model with ID: ${senderId}`,
        error_details: senderError
      }, { status: 404 });
    }

    console.log(`✅ Found sender model:`, { id: senderModel.id, name: senderModel.name });

    // Check if user owns the sender model or is the agency
    if (senderModel.user_id !== user.id && senderModel.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to send requests for this model' 
      }, { status: 403 });
    }

    // Verify receiver model exists and get its onlyfans profile
    console.log(`🔍 Looking up receiver model with ID: ${receiverId}`);
    const { data: receiverModel, error: receiverError } = await (supabase as any)
      .from('models')
      .select('id, name, username, fan_count, user_id, agency_id')
      .eq('id', receiverId)
      .single();

    if (receiverError || !receiverModel) {
      console.error(`❌ Receiver model not found:`, receiverError);
      return NextResponse.json({ 
        error: 'Receiver model not found',
        details: `Could not find model with ID: ${receiverId}`,
        error_details: receiverError
      }, { status: 404 });
    }

    console.log(`✅ Found receiver model:`, { id: receiverModel.id, name: receiverModel.name });

    // Get the receiver's onlyfans profile(s)
    console.log(`🔍 Looking up onlyfans profiles for receiver user: ${receiverModel.user_id}`);
    const { data: receiverProfiles, error: profilesError } = await (supabase as any)
      .from('onlyfans_profiles')
      .select('id, username')
      .eq('user_id', receiverModel.user_id)
      .limit(1);

    if (profilesError || !receiverProfiles || receiverProfiles.length === 0) {
      console.error(`❌ No OnlyFans profiles found for receiver:`, profilesError);
      return NextResponse.json({ 
        error: 'Receiver has no OnlyFans profile',
        details: `Could not find OnlyFans profile for model ${receiverModel.name || receiverModel.username}`
      }, { status: 404 });
    }

    const receiverOnlyFansProfileId = receiverProfiles[0].id;
    console.log(`✅ Found receiver's OnlyFans profile:`, { id: receiverOnlyFansProfileId, username: receiverProfiles[0].username });

    // Prepare SFS request data - using ONLY the columns that exist in the schema
    // NOTE: 
    // - user_id must be the ACTUAL USER ID (from auth.users), not the model ID
    // - onlyfans_profile_id must be the actual OnlyFans profile ID from the onlyfans_profiles table
    const sfsRequestData = {
      user_id: senderModel.user_id,  // sender's actual user_id (from auth.users)
      onlyfans_profile_id: receiverOnlyFansProfileId,  // receiver's actual onlyfans_profile ID
      requester_username: body.sender_name || senderModel.name || senderModel.username,
      requester_fan_count: body.sender_fans || senderModel.fan_count || 0,
      compatibility_score: body.compatibility_score || null,
      match_score: body.match_score || null,
      match_reasons: body.match_reasons || null,
      proposed_date: body.proposed_date || null,
      proposed_time: body.proposed_time || null,
      content_slot: body.content_slot || null,
      status: body.status || 'pending',
      agency_id: user.id  // Current logged-in agency user ID
    };

    console.log('📝 Preparing SFS request data:', {
      senderModelId: senderId,
      senderUserId: senderModel.user_id,
      receiverModelId: receiverId,
      receiverOnlyFansProfileId,
      senderName: senderModel.name || senderModel.username,
      receiverName: receiverModel.name || receiverModel.username,
      agencyId: user.id,
      compatibilityScore: body.compatibility_score,
      matchScore: body.match_score
    });

    // Insert the SFS request
    const { data: sfsRequest, error: insertError } = await (supabase as any)
      .from('sfs_requests')
      .insert(sfsRequestData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating SFS request:', insertError);
      console.error('❌ Request data that failed:', sfsRequestData);
      return NextResponse.json({ 
        error: 'Failed to create SFS request',
        details: insertError.message || insertError.details,
        hint: insertError.hint
      }, { status: 500 });
    }

    console.log('✅ SFS request created successfully:', {
      id: sfsRequest.id,
      senderId,
      receiverId,
      agencyId: sfsRequest.agency_id,
      status: sfsRequest.status
    });

    // Create notification for the receiver using Admin client (bypasses RLS)
    const notificationMessage = `${senderModel.name || senderModel.username} sent you a collaboration request (${Math.round(body.compatibility_score || 0)}% match)`;
    
    // Get receiver's user ID to send notification
    console.log(`🔍 Getting receiver user_id for notifications - receiverId: ${receiverId}`);
    const { data: receiverUser, error: receiverUserError } = await (supabase as any)
      .from('models')
      .select('user_id')
      .eq('id', receiverId)
      .single();

    console.log(`📋 Receiver model query result:`, { 
      receiverUser, 
      receiverUserError, 
      receiverUserId: receiverUser?.user_id 
    });

    // Initialize admin client for notifications (to bypass RLS)
    const supabaseAdmin = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    if (receiverUser?.user_id) {
      console.log(`📤 Creating notification for receiver user: ${receiverUser.user_id}`);
      // Try to create notification for the receiver using admin client
      const { data: notifData, error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: receiverUser.user_id,
          type: 'sfs_request',
          title: 'New Collaboration Request',
          message: notificationMessage,
          related_entity_id: sfsRequest.id,
          related_entity_type: 'sfs_request',
          action_url: `/dashboard/sfs-requests/${sfsRequest.id}`,
          is_read: false
        })
        .select();

      if (notificationError) {
        console.error('⚠️ Failed to create notification for receiver:', notificationError);
        // Don't fail the entire request if notification fails
      } else {
        console.log('✅ Notification created for receiver:', notifData);
      }
    } else {
      console.warn(`⚠️ Receiver has no user_id, cannot send notification. Receiver model:`, receiverUser);
    }

    // Create notification for the agency
    const agencyNotificationMessage = `Your model ${senderModel.name || senderModel.username} sent a collaboration request to ${receiverModel.name || receiverModel.username} (${Math.round(body.compatibility_score || 0)}% match)`;
    
    console.log(`📤 Creating notification for agency user: ${user.id}`);
    const { data: agencyNotifData, error: agencyNotificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user.id,  // Agency user ID
        type: 'sfs_request',  // Use same valid type
        title: 'Collaboration Request Sent',
        message: agencyNotificationMessage,
        related_entity_id: sfsRequest.id,
        related_entity_type: 'sfs_request',
        action_url: `/dashboard/smart-match/${sfsRequest.id}`,
        is_read: false
      })
      .select();

    if (agencyNotificationError) {
      console.error('⚠️ Failed to create notification for agency:', agencyNotificationError);
      // Don't fail the entire request if notification fails
    } else {
      console.log('✅ Notification created for agency:', agencyNotifData);
    }

    return NextResponse.json({ 
      success: true,
      data: sfsRequest,
      message: 'SFS request created successfully and notifications sent to receiver and agency' 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Unexpected error in POST /api/sfs-requests:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PATCH /api/sfs-requests/:id - Update SFS request status (approve/decline)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, status } = body;

    console.log(`📨 PATCH request body received:`, { requestId, status, fullBody: body });

    if (!requestId || !status) {
      console.error(`❌ Validation failed - Missing fields:`, { 
        hasRequestId: !!requestId, 
        hasStatus: !!status,
        requestId: requestId ? 'present' : 'MISSING',
        status: status ? 'present' : 'MISSING'
      });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: `requestId${!requestId ? ' (MISSING)' : ''} and status${!status ? ' (MISSING)' : ''} are required`,
        received: { requestId, status }
      }, { status: 400 });
    }

    if (!['approved', 'declined'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status',
        details: 'Status must be "approved" or "declined"'
      }, { status: 400 });
    }

    console.log(`📝 Updating SFS request ${requestId} to status: ${status}`);

    // Get the SFS request details
    const { data: sfsRequest, error: fetchError } = await (supabase as any)
      .from('sfs_requests')
      .select('id, user_id, agency_id, onlyfans_profile_id, created_at')
      .eq('id', requestId)
      .single();

    if (fetchError || !sfsRequest) {
      console.error('❌ SFS request not found:', fetchError);
      return NextResponse.json({ 
        error: 'SFS request not found',
        details: `Could not find request with ID: ${requestId}`
      }, { status: 404 });
    }

    console.log('✅ Found SFS request:', sfsRequest);

    // Check if user is authorized to approve/decline this request
    // Allow: agency receiving it, sender, or creator owning the profile that received it
    let isAuthorized = false;
    
    // Check 1: Is this the agency that received the request?
    if (sfsRequest.agency_id === user.id) {
      isAuthorized = true;
      console.log(`✅ Authorized: User is the receiving agency`);
    }
    
    // Check 2: Is this the user who sent the request?
    if (sfsRequest.user_id === user.id) {
      isAuthorized = true;
      console.log(`✅ Authorized: User is the request sender`);
    }
    
    // Check 3: Is this the creator who owns the OnlyFans profile that received the request?
    if (!isAuthorized && sfsRequest.onlyfans_profile_id) {
      const { data: profileOwner, error: profileError } = await (supabase as any)
        .from('onlyfans_profiles')
        .select('user_id')
        .eq('id', sfsRequest.onlyfans_profile_id)
        .single();
      
      if (profileOwner?.user_id === user.id) {
        isAuthorized = true;
        console.log(`✅ Authorized: User owns the receiving OnlyFans profile`);
      } else if (profileError) {
        console.warn(`⚠️ Could not verify profile ownership:`, profileError);
      }
    }
    
    if (!isAuthorized) {
      console.error(`❌ User ${user.id} is not authorized for request ${requestId}`);
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'You do not have permission to update this request'
      }, { status: 403 });
    }

    // Update the SFS request status
    const { data: updatedRequest, error: updateError } = await (supabase as any)
      .from('sfs_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating SFS request:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update SFS request',
        details: updateError.message
      }, { status: 500 });
    }

    console.log('✅ SFS request updated successfully:', updatedRequest.id);

    // Get sender and receiver model names for notifications
    console.log(`🔍 Fetching model details for notifications...`);
    
    const { data: senderModel, error: senderModelError } = await (supabase as any)
      .from('models')
      .select('name, username')
      .eq('user_id', sfsRequest.user_id)
      .single();
    
    const { data: receiverProfile, error: receiverProfileError } = await (supabase as any)
      .from('onlyfans_profiles')
      .select('user_id')
      .eq('id', sfsRequest.onlyfans_profile_id)
      .single();
    
    const receiverUserId = receiverProfile?.user_id;
    let receiverModelName = 'a creator';
    
    if (receiverUserId) {
      const { data: receiverModel } = await (supabase as any)
        .from('models')
        .select('name, username')
        .eq('user_id', receiverUserId)
        .limit(1)
        .single();
      
      receiverModelName = receiverModel?.name || receiverModel?.username || 'a creator';
    }

    const senderName = senderModel?.name || senderModel?.username || 'A model';
    
    console.log(`✅ Model details retrieved - Sender: ${senderName}, Receiver: ${receiverModelName}`);

    // Initialize admin client for notifications
    const supabaseAdmin = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Send notification to the sender user (user_id from sfs_requests)
    console.log(`📤 Creating notification for sender user: ${sfsRequest.user_id}`);
    const senderNotificationMessage = status === 'approved'
      ? `Your collaboration request to ${receiverModelName} was approved!`
      : `Your collaboration request to ${receiverModelName} was declined.`;

    const { error: senderNotifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: sfsRequest.user_id,
        type: 'sfs_request',
        title: status === 'approved' ? 'Request Approved!' : 'Request Declined',
        message: senderNotificationMessage,
        related_entity_id: requestId,
        related_entity_type: 'sfs_request',
        action_url: `/dashboard/sfs-requests/${requestId}`,
        is_read: false
      });

    if (senderNotifError) {
      console.error('⚠️ Failed to create notification for sender user:', senderNotifError);
    } else {
      console.log('✅ Notification created for sender user');
    }

    // Send notification to the agency (agency_id from sfs_requests)
    console.log(`📤 Creating notification for agency: ${sfsRequest.agency_id}`);
    const agencyNotificationMessage = status === 'approved'
      ? `${senderName}'s collaboration request to ${receiverModelName} was approved!`
      : `${senderName}'s collaboration request to ${receiverModelName} was declined.`;

    const { error: agencyNotifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: sfsRequest.agency_id,
        type: 'sfs_request',
        title: status === 'approved' ? 'Request Approved!' : 'Request Declined',
        message: agencyNotificationMessage,
        related_entity_id: requestId,
        related_entity_type: 'sfs_request',
        action_url: `/dashboard/sfs-requests/${requestId}`,
        is_read: false
      });

    if (agencyNotifError) {
      console.error('⚠️ Failed to create notification for agency:', agencyNotifError);
    } else {
      console.log('✅ Notification created for agency');
    }

    return NextResponse.json({ 
      success: true,
      data: updatedRequest,
      message: `SFS request ${status} successfully and notifications sent to user_id and agency_id`
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Unexpected error in PATCH /api/sfs-requests:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

