import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/notifications - Fetch user notifications
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
    const isRead = searchParams.get('is_read');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build the query
    let query = (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (isRead !== null && isRead !== undefined && isRead !== '') {
      query = query.eq('is_read', isRead === 'true');
    }
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = (supabase as any)
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    if (isRead !== null && isRead !== undefined && isRead !== '') {
      countQuery = countQuery.eq('is_read', isRead === 'true');
    }
    
    if (type) {
      countQuery = countQuery.eq('type', type);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching notifications count:', countError);
    }

    return NextResponse.json({ 
      success: true,
      data: notifications || [],
      count: count || 0,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification
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
    if (!body.title || !body.message || !body.type) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'title, message, and type are required' 
      }, { status: 400 });
    }

    // Validate notification type
    const validTypes = ['info', 'success', 'warning', 'error', 'sfs_request', 'smart_match', 'scheduled_sfs', 'analytics'];
    if (body.type && !validTypes.includes(body.type)) {
      return NextResponse.json({ 
        error: 'Invalid notification type',
        details: `Type must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Prepare notification data
    const notificationData = {
      user_id: user.id,
      title: body.title,
      message: body.message,
      type: body.type,
      action_url: body.action_url || null,
      related_entity_id: body.related_entity_id || null,
      related_entity_type: body.related_entity_type || null,
      is_read: body.is_read || false,
      read_at: body.is_read ? new Date().toISOString() : null
    };

    // Insert the notification
    const { data: notification, error } = await (supabase as any)
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: notification,
      message: 'Notification created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications - Batch update notifications (mark as read/unread)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.notification_ids || !Array.isArray(body.notification_ids)) {
      return NextResponse.json({ 
        error: 'Missing notification_ids array' 
      }, { status: 400 });
    }

    if (body.is_read === undefined) {
      return NextResponse.json({ 
        error: 'Missing is_read field' 
      }, { status: 400 });
    }

    // Update multiple notifications at once
    const updateData: any = {
      is_read: body.is_read
    };

    if (body.is_read) {
      updateData.read_at = new Date().toISOString();
    } else {
      updateData.read_at = null;
    }

    const { data: notifications, error } = await (supabase as any)
      .from('notifications')
      .update(updateData)
      .in('id', body.notification_ids)
      .eq('user_id', user.id) // Ensure user can only update their own notifications
      .select();

    if (error) {
      console.error('Error updating notifications:', error);
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: notifications,
      message: `${notifications?.length || 0} notifications updated successfully` 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
