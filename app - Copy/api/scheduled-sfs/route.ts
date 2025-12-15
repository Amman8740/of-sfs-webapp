import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

// GET /api/scheduled-sfs - Fetch scheduled SFS posts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check user type
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('model_id');
    const userIdParam = searchParams.get('user_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const type = searchParams.get('type') || 'sent'; // 'sent', 'received', or 'all'

    let query = (supabase as any)
      .from('scheduled_sfs')
      .select(`
        *
      `)
      .order('scheduled_date', { ascending: true });

    console.log('📊 Query built for scheduled_sfs');

    // Filter by type (sent/received) based on user role
    if (type === 'sent') {
      // For creators: SENT means user_id (sender) matches current user
      // For agencies: SENT means agency_id matches current user
      if (userProfile?.user_type === 'agency') {
        console.log('📊 Fetching SENT SFS for AGENCY:', { userId: user.id, userType: userProfile?.user_type });
        query = query.eq('agency_id', user.id);
      } else {
        console.log('📊 Fetching SENT SFS for CREATOR:', { userId: user.id, userType: userProfile?.user_type });
        query = query.eq('user_id', user.id);
      }
    } else if (type === 'received') {
      // RECEIVED: model_id (receiver) matches current user - they are the receiver
      console.log('📊 Fetching RECEIVED SFS:', { userId: user.id });
      query = query.eq('model_id', user.id);
    }

    // Filter by model
    if (modelId) {
      query = query.eq('model_id', modelId);
    }

    // Filter by user_id if provided (override type filter if explicit user_id given)
    if (userIdParam) {
      query = query.eq('user_id', userIdParam);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by date range
    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }

    const { data: scheduledSFS, error } = await query;

    if (error) {
      console.error('❌ Error fetching scheduled SFS:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch scheduled SFS', 
        details: error,
        userType: userProfile?.user_type,
        userId: user.id,
        queryType: type
      }, { status: 500 });
    }

    console.log('✅ Found scheduled SFS:', { 
      count: scheduledSFS?.length || 0, 
      userType: userProfile?.user_type,
      userId: user.id,
      data: scheduledSFS 
    });

    // Fetch media details separately if media_id exists
    let mediaMap: any = {};
    const mediaIds = Array.from(new Set((scheduledSFS as any)?.map((sfs: any) => sfs.media_id).filter(Boolean) || []));
    if (mediaIds.length > 0) {
      console.log('📸 Fetching media for IDs:', mediaIds);
      const { data: mediaItems, error: mediaError } = await supabase
        .from('media_items')
        .select('id, file_url, thumbnail_url, file_type')
        .in('id', mediaIds);

      if (mediaError) {
        console.error('⚠️ Error fetching media:', mediaError);
      } else {
        mediaMap = (mediaItems as any)?.reduce((map: any, media: any) => {
          map[media.id] = media;
          return map;
        }, {}) || {};
        console.log('✅ Media fetched:', { count: Object.keys(mediaMap).length });
      }
    }

    // Fetch promo links for the scheduled SFS
    const promoLinkIds = Array.from(new Set((scheduledSFS as any)?.map((sfs: any) => sfs.promo_link).filter(Boolean) || []));
    let promoLinksMap: any = {};
    if (promoLinkIds.length > 0) {
      console.log('🔗 Fetching promo links for IDs:', promoLinkIds);
      const { data: promoLinks, error: promoError } = await supabase
        .from('promo_links')
        .select('id, promo_name, url')
        .in('id', promoLinkIds);

      if (promoError) {
        console.error('⚠️ Error fetching promo links:', promoError);
      } else {
        promoLinksMap = (promoLinks as any)?.reduce((map: any, promo: any) => {
          map[promo.id] = promo;
          return map;
        }, {}) || {};
        console.log('✅ Promo links fetched:', { count: Object.keys(promoLinksMap).length });
      }
    }

    // Attach media and promo links to scheduled SFS
    const dataWithRelations = (scheduledSFS as any)?.map((sfs: any) => ({
      ...sfs,
      media: sfs.media_id ? mediaMap[sfs.media_id] : null,
      promo_links: sfs.promo_link ? promoLinksMap[sfs.promo_link] : null
    }));

    console.log('📦 Final response data:', { count: dataWithRelations?.length || 0 });

    return NextResponse.json({ 
      success: true,
      data: dataWithRelations,
      count: dataWithRelations?.length || 0
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/scheduled-sfs - Create a new scheduled SFS
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseService = await createServiceRoleClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    let body: any;
    let uploadedMediaId: string | null = null;

    // Handle multipart/form-data or JSON
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      // Upload file if present
      const file = formData.get('media') as File | null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabaseService.storage
          .from('media')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
        }

        const { data: { publicUrl } } = supabaseService.storage
          .from('media')
          .getPublicUrl(fileName);

        const mediaData = {
          model_id: formData.get('model_id') as string,
          file_url: publicUrl,
          thumbnail_url: file.type.startsWith('image/') ? publicUrl : null,
          file_type: file.type.startsWith('image/') ? 'image' : 'video',
          file_size: file.size,
          file_name: fileName,
          user_id: user.id,
        };

        const { data: mediaItem, error: mediaError } = await supabaseService
          .from('media_items')
          .insert(mediaData)
          .select('id')
          .single();

        if (mediaError) {
          console.error('Error creating media item:', mediaError);
          return NextResponse.json({ error: 'Failed to create media item' }, { status: 500 });
        }

        uploadedMediaId = mediaItem.id;
      }

      body = {
        model_id: formData.get('model_id'),
        partner_model_id: formData.get('partner_model_id'),
        scheduled_date: formData.get('scheduled_date'),
        scheduled_time: formData.get('scheduled_time'),
        media_id: uploadedMediaId || formData.get('media_id'),
        promo_link_id: formData.get('promo_link_id'),
        content_slot: formData.get('content_slot'),
        caption: formData.get('caption'),
        tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
      };
    } else {
      body = await request.json();
    }

    // Validate required fields
    if (!body.model_id || !body.partner_model_id || !body.scheduled_date) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'model_id, partner_model_id, and scheduled_date are required',
        },
        { status: 400 }
      );
    }

    // Get user profile to check user type
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // Verify model exists and user has access
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('id, user_id, agency_id')
      .eq('id', body.model_id)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: 'Model not found or access denied' }, { status: 404 });
    }

    // Debug logging
    console.log('🔐 Permission Check:', {
      modelId: body.model_id,
      userId: user.id,
      userType: userProfile?.user_type,
      modelUserId: (model as any).user_id,
      modelAgencyId: (model as any).agency_id,
      userIdMatch: (model as any).user_id === user.id,
      agencyIdMatch: (model as any).agency_id === user.id,
    });

    // Permission check: User has access if:
    // 1. They are the model owner (user_id matches), OR
    // 2. They are the model's agency (agency_id matches), OR
    // 3. They are an agency and model belongs to them (agency_id is set and matches)
    const hasDirectOwnership = (model as any).user_id === user.id;
    const hasAgencyOwnership = (model as any).agency_id === user.id;
    const isAgency = userProfile?.user_type === 'agency';
    const canAccessAsAgency = isAgency && ((model as any).agency_id === user.id || (model as any).agency_id === null);

    if (!hasDirectOwnership && !hasAgencyOwnership && !canAccessAsAgency) {
      return NextResponse.json(
        { 
          error: 'You do not have permission to schedule SFS for this model',
          debug: {
            modelUserId: (model as any).user_id,
            modelAgencyId: (model as any).agency_id,
            currentUserId: user.id,
            userType: userProfile?.user_type,
            hasDirectOwnership,
            hasAgencyOwnership,
            canAccessAsAgency
          }
        },
        { status: 403 }
      );
    }

    // Get SENDER ID (Model Being Promoted owner)
    const senderId = (model as any).user_id || (model as any).agency_id;

    // Verify partner model exists
    const { data: partnerModel, error: partnerError } = await supabase
      .from('models')
      .select('id, username, name, user_id, agency_id, fan_count, display_picture_url')
      .eq('id', body.partner_model_id)
      .single();

    if (partnerError || !partnerModel) {
      return NextResponse.json({ error: 'Partner model not found' }, { status: 404 });
    }

    // Get RECEIVER ID (Model Promoting owner)
    const receiverId = (partnerModel as any).user_id || (partnerModel as any).agency_id;

    // Prepare scheduled SFS data
    const scheduledSFSData = {
      model_id: receiverId,     // Receiver: Model Promoting owner's user_id
      partner_creator: (partnerModel as any).username || (partnerModel as any).name,
      partner_fan_count: (partnerModel as any).fan_count,
      scheduled_date: body.scheduled_date,
      scheduled_time: body.scheduled_time || null,
      media_id: body.media_id || null,
      promo_link: body.promo_link_id || null,
      content_slot: body.content_slot || 1,
      caption: body.caption || null,
      status: 'pending',
      user_id: senderId,        // Sender: Model Being Promoted owner's user_id
      agency_id: isAgency ? user.id : null,  // For agencies, store the logged-in agency user's ID
    };

    // Insert scheduled SFS using service role (bypasses RLS)
    const { data: scheduledSFS, error } = await supabaseService
      .from('scheduled_sfs')
      .insert(scheduledSFSData)
      .select(`
        *,
        media:media_id (
          id,
          file_url,
          thumbnail_url,
          file_type
        ),
        promo_links(id, promo_name, url)
      `)
      .single();

    if (error) {
      console.error('Error creating scheduled SFS:', error);
      return NextResponse.json({ error: 'Failed to create scheduled SFS', details: error }, { status: 500 });
    }

    // Create corresponding SFS request
    const requesterFanCount = (model as any).fan_count;
    const sfsRequestData = {
      user_id: receiverId,                    // SFS request goes to receiver (Model Promoting owner)
      requester_username: (model as any).username || (model as any).name,
      requester_fan_count: requesterFanCount,
      requester_media_url: (model as any).display_picture_url,
      requester_tags: null,
      proposed_date: body.scheduled_date,
      content_slot: body.content_slot || 1,
      status: 'pending',
    };

    const { error: requestError } = await supabaseService
      .from('sfs_requests')
      .insert(sfsRequestData);

    if (requestError) {
      console.error('Error creating SFS request:', requestError);
      // Don't fail the whole operation, just log the error
    }

    // Create notification for the receiver
    const notificationData = {
      user_id: receiverId,
      type: 'scheduled_sfs',
      title: 'New Scheduled SFS',
      message: `You have a new scheduled SFS with ${(model as any).name || (model as any).username} on ${body.scheduled_date} at ${body.scheduled_time || 'TBD'}.`,
      is_read: false,
    };

    const { error: notificationError } = await supabaseService
      .from('notifications')
      .insert(notificationData);

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the whole operation, just log the error
    }

    // Create notification for the agency if the model belongs to one
    if ((model as any).agency_id) {
      const agencyNotificationData = {
        user_id: (model as any).agency_id,
        type: 'scheduled_sfs',
        title: 'New Scheduled SFS for Your Creator',
        message: `Your creator ${(model as any).name || (model as any).username} has a new scheduled SFS with ${(partnerModel as any).username || (partnerModel as any).name} on ${body.scheduled_date} at ${body.scheduled_time || 'TBD'}.`,
        read: false,
      };

      const { error: agencyNotificationError } = await supabaseService
        .from('notifications')
        .insert(agencyNotificationData);

      if (agencyNotificationError) {
        console.error('Error creating agency notification:', agencyNotificationError);
        // Don't fail the whole operation, just log the error
      }
    }

    return NextResponse.json(
      { success: true, data: scheduledSFS, message: 'SFS scheduled successfully' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err }, { status: 500 });
  }
}


