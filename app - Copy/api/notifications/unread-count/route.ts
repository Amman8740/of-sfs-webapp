import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/notifications/unread-count - Get unread notification count for user
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
    const type = searchParams.get('type');

    // Build count query
    let countQuery = (supabase as any)
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false);

    // Add type filter if provided
    if (type) {
      countQuery = countQuery.eq('type', type);
    }

    const { count, error } = await countQuery;

    if (error) {
      console.error('Error fetching unread count:', error);
      return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
    }

    // Also get breakdown by notification type
    const { data: typeBreakdown, error: breakdownError } = await (supabase as any)
      .from('notifications')
      .select('type')
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (breakdownError) {
      console.error('Error fetching type breakdown:', breakdownError);
    }

    // Count by type
    const typeCounts = (typeBreakdown || []).reduce((acc: Record<string, number>, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ 
      success: true,
      data: {
        unread_count: count || 0,
        type_breakdown: typeCounts
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
