import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// POST /api/notifications/mark-all-read - Mark all notifications as read for user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Build update query
    let updateQuery = (supabase as any)
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_read', false); // Only update unread notifications

    // Add type filter if provided
    if (type) {
      updateQuery = updateQuery.eq('type', type);
    }

    const { data: notifications, error } = await updateQuery.select('id');

    if (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: {
        updated_count: notifications?.length || 0,
        updated_notifications: notifications
      },
      message: `${notifications?.length || 0} notifications marked as read` 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
