import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

// GET /api/scheduled-sfs/[id] - Fetch a specific scheduled SFS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: scheduledSFS, error } = await (supabase as any)
      .from('scheduled_sfs')
      .select(`*`)
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Scheduled SFS not found' }, { status: 404 });
      }
      console.error('Error fetching scheduled SFS:', error);
      return NextResponse.json({ error: 'Failed to fetch scheduled SFS' }, { status: 500 });
    }

    // Check if user has access (user_id = sender or model_id = receiver)
    if ((scheduledSFS as any).user_id !== user.id && (scheduledSFS as any).model_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to view this scheduled SFS' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true,
      data: scheduledSFS 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/scheduled-sfs/[id] - Update a scheduled SFS
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const supabaseService = await createServiceRoleClient();
    const resolvedParams = await params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // First, get the scheduled SFS to check permissions
    const { data: existingSFS, error: fetchError } = await (supabase as any)
      .from('scheduled_sfs')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingSFS) {
      return NextResponse.json({ error: 'Scheduled SFS not found' }, { status: 404 });
    }

    // For status changes (approve/reject), only receiver can do it
    if (body.status && (body.status === 'approved' || body.status === 'rejected')) {
      // Check if user is the receiver (model_id now stores the receiver's user_id)
      const isReceiver = (existingSFS as any).model_id === user.id;

      if (!isReceiver) {
        return NextResponse.json({ 
          error: 'Only the receiver can accept or reject this scheduled SFS' 
        }, { status: 403 });
      }

      console.log(`📝 Updating scheduled SFS ${resolvedParams.id} status to ${body.status}`);

      // Update the scheduled SFS status
      const { data: updatedScheduledSFS, error: updateError } = await supabaseService
        .from('scheduled_sfs')
        .update({
          status: body.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', resolvedParams.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating scheduled SFS:', updateError);
        return NextResponse.json({ error: 'Failed to update scheduled SFS' }, { status: 500 });
      }

      // Get sender user profile to get their name for notification
      const { data: senderProfile, error: senderProfileError } = await supabaseService
        .from('user_profiles')
        .select('profile_data')
        .eq('id', (existingSFS as any).user_id)
        .single();

      // Extract sender name from profile_data JSON or use partner_creator as fallback
      let senderName = 'A creator';
     
      if (senderProfile?.profile_data) {
        const profileData = senderProfile.profile_data as any;
      
        senderName = profileData?.full_name || profileData?.name || profileData?.username || (existingSFS as any).partner_creator || 'A creator';
       
      } else if (senderProfileError) {
        console.error('Error fetching sender profile:', senderProfileError);
        // Fallback to partner_creator from scheduled_sfs
        senderName = (existingSFS as any).partner_creator || 'A creator';
      } else {
        // If profile_data is empty, use partner_creator
        senderName = (existingSFS as any).partner_creator || 'A creator';
      }

      // Get receiver user profile to get their name for sender's notification
      const { data: receiverProfile, error: receiverProfileError } = await supabaseService
        .from('user_profiles')
        .select('profile_data')
        .eq('id', (existingSFS as any).model_id)
        .single();

      // Extract receiver name from profile_data JSON or use partner_creator as fallback
      let receiverName = 'A creator';
  
      if (receiverProfile?.profile_data) {
        const profileData = receiverProfile.profile_data as any;
    
        receiverName = profileData?.full_name || profileData?.name || profileData?.username || (existingSFS as any).partner_creator || 'A creator';
      
      } else if (receiverProfileError) {
        console.error('Error fetching receiver profile:', receiverProfileError);
        // Fallback to partner_creator from scheduled_sfs
        receiverName = (existingSFS as any).partner_creator || 'A creator';
      } else {
        // If profile_data is empty, use partner_creator
        receiverName = (existingSFS as any).partner_creator || 'A creator';
      }

      // Create notification for the sender (user who scheduled the SFS)
      const notificationData = {
        user_id: (existingSFS as any).user_id,
        type: 'scheduled_sfs',
        title: body.status === 'approved' ? 'Scheduled SFS Approved' : 'Scheduled SFS Rejected',
        message: `Your scheduled SFS with ${receiverName} has been ${body.status === 'approved' ? 'approved' : 'rejected'}.`,
        is_read: false,
      };

      const { error: notificationError } = await supabaseService
        .from('notifications')
        .insert(notificationData);

      if (notificationError) {
        console.error('Error creating notification for sender:', notificationError);
        // Don't fail the whole operation, just log the error
      }

      // Create notification for the receiver (user who approved/rejected)
      const receiverNotificationData = {
        user_id: (existingSFS as any).model_id,
        type: 'scheduled_sfs',
        title: body.status === 'approved' ? 'You Approved an SFS' : 'You Rejected an SFS',
        message: `You have ${body.status === 'approved' ? 'approved' : 'rejected'} a scheduled SFS from ${senderName}.`,
        is_read: false,
      };

      const { error: receiverNotificationError } = await supabaseService
        .from('notifications')
        .insert(receiverNotificationData);

      if (receiverNotificationError) {
        console.error('Error creating notification for receiver:', receiverNotificationError);
        // Don't fail the whole operation, just log the error
      }

      return NextResponse.json({ 
        success: true, 
        data: updatedScheduledSFS,
        message: `Scheduled SFS ${body.status === 'approved' ? 'approved' : 'rejected'} successfully`
      });
    }

    // Check if user has access (is sender or receiver) for other updates
    if ((existingSFS as any).user_id !== user.id && (existingSFS as any).model_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this scheduled SFS' 
      }, { status: 403 });
    }

    // Prepare update data
    const updateData: Record<string, any> = {};
    
    if (body.scheduled_date !== undefined) updateData.scheduled_date = body.scheduled_date;
    if (body.media_id !== undefined) updateData.media_id = body.media_id;
    if (body.promo_link_id !== undefined) updateData.promo_link_id = body.promo_link_id;
    if (body.content_slot !== undefined) updateData.content_slot = body.content_slot;
    if (body.caption !== undefined) updateData.caption = body.caption;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.status !== undefined) {
      // Validate status
      const validStatuses = ['pending', 'scheduled', 'posted', 'cancelled', 'failed', 'flagged', 'approved', 'rejected'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ 
          error: 'Invalid status',
          details: 'Status must be one of: pending, scheduled, posted, cancelled, failed, flagged, approved, rejected' 
        }, { status: 400 });
      }
      updateData.status = body.status;
    }
    if (body.posted_at !== undefined) updateData.posted_at = body.posted_at;
    if (body.flag_reason !== undefined) updateData.flag_reason = body.flag_reason;

    // Update the scheduled SFS
    const { data: scheduledSFS, error } = await (supabase as any)
      .from('scheduled_sfs')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select(`
        *,
        model:model_id (
          id,
          name,
          username,
          display_picture_url
        ),
        media:media_id (
          id,
          file_url,
          thumbnail_url,
          file_type
        )
      `)
      .single();

    if (error) {
      console.error('Error updating scheduled SFS:', error);
      return NextResponse.json({ error: 'Failed to update scheduled SFS' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: scheduledSFS,
      message: 'Scheduled SFS updated successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/scheduled-sfs/[id] - Delete a scheduled SFS
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the scheduled SFS to check permissions
    const { data: existingSFS, error: fetchError } = await (supabase as any)
      .from('scheduled_sfs')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingSFS) {
      return NextResponse.json({ error: 'Scheduled SFS not found' }, { status: 404 });
    }

    // Check if user has access (user_id = sender or model_id = receiver)
    if ((existingSFS as any).user_id !== user.id && (existingSFS as any).model_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this scheduled SFS' 
      }, { status: 403 });
    }

    // Delete the scheduled SFS
    const { error } = await (supabase as any)
      .from('scheduled_sfs')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Error deleting scheduled SFS:', error);
      return NextResponse.json({ error: 'Failed to delete scheduled SFS' }, { status: 500 });
    }

    // Also delete related SFS requests that match the same criteria
    // Find SFS requests that match the model, partner, and date/time
    const { data: relatedRequests, error: requestFetchError } = await (supabase as any)
      .from('sfs_requests')
      .select('id, model_id, requester_username, proposed_date, proposed_time')
      .eq('model_id', (existingSFS as any).model_id)
      .eq('requester_username', (existingSFS as any).partner_creator)
      .eq('proposed_date', (existingSFS as any).scheduled_date)
      .eq('proposed_time', (existingSFS as any).scheduled_time);

    if (requestFetchError) {
      console.error('Error fetching related SFS requests:', requestFetchError);
      // Don't fail the whole operation if this fails
    } else if (relatedRequests && relatedRequests.length > 0) {
      // Delete the related SFS requests
      const requestIds = relatedRequests.map((req: any) => req.id);
      const { error: requestDeleteError } = await (supabase as any)
        .from('sfs_requests')
        .delete()
        .in('id', requestIds);

      if (requestDeleteError) {
        console.error('Error deleting related SFS requests:', requestDeleteError);
        // Don't fail the whole operation if this fails
      } else {
        console.log(`Deleted ${requestIds.length} related SFS request(s)`);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Scheduled SFS and related requests deleted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

