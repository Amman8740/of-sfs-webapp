import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// POST /api/smart-match/send-request - Send SFS request from smart match
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Validate required fields
    if (!body.sender_model_id || !body.receiver_only_profile_id) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'sender_model_id and receiver_only_profile_id are required' 
      }, { status: 400 });
    }

    let senderModel: any = null;
    let senderError: any = null;

    // First try to find model by model.id
    const { data: modelById, error: modelByIdError } = await (supabase as any)
      .from('models')
      .select('id, user_id, username')
      .eq('id', body.sender_model_id)
      .single();

    if (!modelByIdError && modelById) {
      senderModel = modelById;
    } else if (modelByIdError?.code === 'PGRST116') {
      const { data: modelByUser, error: modelByUserError } = await (supabase as any)
        .from('models')
        .select('id, user_id, username')
        .eq('user_id', body.sender_model_id)
        .single();

      console.log('📌 Model by user_id search result:', { modelByUser, error: modelByUserError?.message });

      if (!modelByUserError && modelByUser) {
        senderModel = modelByUser;
        console.log('✅ Found model by user_id:', modelByUser);
      } else {
        senderError = modelByUserError || { message: 'Model not found' };
        console.error('❌ No model found by user_id either:', senderError?.message);
      }
    } else {
      senderError = modelByIdError;
      console.error('❌ Model ID lookup error:', modelByIdError?.message);
    }

    if (senderError || !senderModel) {
      console.error('❌ Final error: Sender model not found');
      console.error('📊 Debug Info:', {
        sender_model_id: body.sender_model_id,
        auth_user_id: user.id,
        model_by_id_error: modelByIdError?.message,
        searched_model_id: body.sender_model_id,
        searched_user_id: body.sender_model_id
      });
      
      return NextResponse.json({ 
        error: 'Sender model not found',
        details: `Could not find any model associated with ID: ${body.sender_model_id}. 
                 Make sure you have a model entry in the "models" table where either:
                 1. model.id = ${body.sender_model_id}, OR
                 2. model.user_id = ${body.sender_model_id}
                 
                 Also ensure that model.user_id matches your authenticated user ID: ${user.id}`,
        debug: {
          sender_model_id_sent: body.sender_model_id,
          your_auth_user_id: user.id,
          search_methods_attempted: [
            `Find model WHERE id = '${body.sender_model_id}'`,
            `Find model WHERE user_id = '${body.sender_model_id}'`
          ],
          suggestion: 'Check your models table in Supabase dashboard to verify the data'
        }
      }, { status: 404 });
    }

    if (senderModel.user_id !== user.id) {
      console.error('❌ Permission denied: Model user_id does not match auth user_id', {
        model_user_id: senderModel.user_id,
        auth_user_id: user.id
      });
      return NextResponse.json({ 
        error: 'You do not have permission to send requests for this model',
        details: `Model user_id (${senderModel.user_id}) does not match your user_id (${user.id})`
      }, { status: 403 });
    }

    console.log('✅ Permission check passed for model:', senderModel.id);

    // Get receiver profile details - lookup by user_id instead of profile id
    const { data: receiverProfile, error: receiverError } = await (supabase as any)
      .from('onlyfans_profiles')
      .select('id, user_id, username, display_name, fans')
      .eq('user_id', body.receiver_only_profile_id)
      .single();

    console.log('📌 Receiver profile search by user_id:', { receiverProfile, error: receiverError?.message });

    if (receiverError || !receiverProfile) {
      console.error('❌ Receiver profile not found:', receiverError?.message);
      return NextResponse.json({ 
        error: 'Receiver profile not found',
        details: `Could not find profile with user_id: ${body.receiver_only_profile_id}. Make sure the receiver has an entry in onlyfans_profiles table.`
      }, { status: 404 });
    }

    console.log('✅ Found receiver profile:', receiverProfile.username);
    console.log('✅ Ready to create SFS request to onlyfans_profile_id:', receiverProfile.id);

    // Create SFS request with all required fields from the table schema
    // Ensure all fields are properly typed and formatted
    const sfsRequestData = {
      user_id: senderModel.user_id,  // SENDER (the user/model sending the request)
      onlyfans_profile_id: receiverProfile.id,  // RECEIVER (the onlyfans_profile_id for the receiver)
      requester_username: String(body.requester_username || senderModel.username).trim(),
      requester_fan_count: body.requester_fan_count ? parseInt(String(body.requester_fan_count), 10) : null,
      requester_media_url: body.requester_media_url ? String(body.requester_media_url).trim() : null,
      requester_tags: null,
      proposed_date: new Date().toISOString().split('T')[0],
      proposed_time: null,
      content_slot: body.content_slot ? parseInt(String(body.content_slot), 10) : null,
      compatibility_score: body.compatibility_score ? parseInt(String(body.compatibility_score), 10) : null,
      match_reasons: null,
      status: 'pending',
      match_score: body.match_score ? parseInt(String(body.match_score), 10) : null,
    };

    const { data: sfsRequest, error: sfsError } = await (supabase as any)
      .from('sfs_requests')
      .insert(sfsRequestData)
      .select('*')
      .single();

    if (sfsError) {
      console.error('❌ Failed to create SFS request:', sfsError.message);
      console.error('📊 Full error details:', sfsError);
      console.error('📋 Data that was sent:', JSON.stringify(sfsRequestData, null, 2));
      return NextResponse.json({ 
        error: 'Failed to send SFS request', 
        details: sfsError.message,
        debug: sfsError.code
      }, { status: 500 });
    }
    // Create notification for receiver
    const notificationData = {
      user_id: receiverProfile.user_id,
      type: 'sfs_request',
      title: 'New SFS Request',
      message: `${body.requester_username || senderModel.username} sent you an SFS request`,
      is_read: false,
      created_at: new Date().toISOString()
    };

    // Create notification (non-blocking - if it fails, we don't want to fail the whole request)
    try {
      const { error: notificationError } = await (supabase as any)
        .from('notifications')
        .insert(notificationData);
      
      if (notificationError) {
        console.warn('⚠️ Notification creation failed (non-blocking):', notificationError.message);
      } else {
        console.log('✅ Notification created successfully');
      }
    } catch (notificationErr) {
      console.warn('⚠️ Notification creation error (non-blocking):', notificationErr);
    }

    console.log('✅✅ SFS request flow completed successfully');

    return NextResponse.json({ 
      success: true,
      data: {
        request_id: sfsRequest.id,
        status: sfsRequest.status,
        receiver: {
          id: receiverProfile.id,
          username: receiverProfile.username,
          display_name: receiverProfile.display_name
        }
      },
      message: 'SFS request sent successfully' 
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Unexpected error in send-request:', errorMessage);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
}
