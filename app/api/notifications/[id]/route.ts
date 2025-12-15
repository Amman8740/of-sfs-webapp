import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/notifications/[id] - Get a specific notification
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the notification
    const { data: notification, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id) // Ensure user can only access their own notifications
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      console.error('Error fetching notification:', error);
      return NextResponse.json({ error: 'Failed to fetch notification' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications/[id] - Update a specific notification
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // First, verify the notification exists and belongs to the user
    const { data: existingNotification, error: fetchError } = await (supabase as any)
      .from('notifications')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      console.error('Error fetching notification:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch notification' }, { status: 500 });
    }

    // Prepare update data - only allow certain fields to be updated
    const updateData: any = {};
    
    if (body.is_read !== undefined) {
      updateData.is_read = body.is_read;
      updateData.read_at = body.is_read ? new Date().toISOString() : null;
    }
    
    if (body.title !== undefined) {
      updateData.title = body.title;
    }
    
    if (body.message !== undefined) {
      updateData.message = body.message;
    }

    // Validate notification type if provided
    if (body.type !== undefined) {
      const validTypes = ['info', 'success', 'warning', 'error', 'sfs_request', 'smart_match', 'scheduled_sfs', 'analytics'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json({ 
          error: 'Invalid notification type',
          details: `Type must be one of: ${validTypes.join(', ')}` 
        }, { status: 400 });
      }
      updateData.type = body.type;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update' 
      }, { status: 400 });
    }

    // Update the notification
    const { data: notification, error } = await (supabase as any)
      .from('notifications')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification:', error);
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: notification,
      message: 'Notification updated successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notifications/[id] - Delete a specific notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, verify the notification exists and belongs to the user
    const { data: existingNotification, error: fetchError } = await (supabase as any)
      .from('notifications')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      console.error('Error fetching notification:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch notification' }, { status: 500 });
    }

    // Delete the notification
    const { error } = await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting notification:', error);
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
