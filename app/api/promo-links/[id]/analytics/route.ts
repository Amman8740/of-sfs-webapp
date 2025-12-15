import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/promo-links/[id]/analytics - Fetch analytics for a specific promo link
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

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // First, verify the promo link exists and user has access
    const { data: promoLink, error: promoError } = await (supabase as any)
      .from('promo_links')
      .select(`
        *,
        models:model_id (
          id,
          name,
          user_id,
          agency_id
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (promoError || !promoLink) {
      return NextResponse.json({ error: 'Promo link not found' }, { status: 404 });
    }

    // Check if user has access
    const model = (promoLink as any).models;
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to view this promo link analytics' 
      }, { status: 403 });
    }

    // Build analytics query
    let analyticsQuery = (supabase as any)
      .from('promo_link_analytics')
      .select('*')
      .eq('promo_link_id', resolvedParams.id)
      .order('date', { ascending: false });

    // Apply date filters if provided
    if (startDate) {
      analyticsQuery = analyticsQuery.gte('date', startDate);
    }
    if (endDate) {
      analyticsQuery = analyticsQuery.lte('date', endDate);
    }

    const { data: analytics, error: analyticsError } = await analyticsQuery;

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    // Calculate summary statistics
    const analyticsData = analytics || [];
    const summary = {
      total_clicks: 0,
      total_conversions: 0,
      total_revenue: 0,
      total_new_fans: 0,
      average_conversion_rate: 0,
      average_roi: 0,
      date_range: {
        start: startDate || (analyticsData[analyticsData.length - 1] as any)?.date,
        end: endDate || (analyticsData[0] as any)?.date
      }
    };

    if (analytics && analytics.length > 0) {
      analytics.forEach((record: any) => {
        summary.total_clicks += record.clicks || 0;
        summary.total_conversions += record.conversions || 0;
        summary.total_revenue += parseFloat(record.revenue || 0);
        summary.total_new_fans += record.new_fans || 0;
      });

      // Calculate averages
      const recordsWithConversions = analytics.filter((r: any) => r.conversion_rate > 0);
      const recordsWithROI = analytics.filter((r: any) => r.roi !== null);

      if (recordsWithConversions.length > 0) {
        summary.average_conversion_rate = 
          recordsWithConversions.reduce((sum: number, r: any) => sum + (r.conversion_rate || 0), 0) / 
          recordsWithConversions.length;
      }

      if (recordsWithROI.length > 0) {
        summary.average_roi = 
          recordsWithROI.reduce((sum: number, r: any) => sum + (r.roi || 0), 0) / 
          recordsWithROI.length;
      }
    }

    return NextResponse.json({ 
      success: true,
      data: {
        promo_link: {
          id: (promoLink as any).id,
          title: (promoLink as any).title,
          promo_url: (promoLink as any).promo_url,
          is_active: (promoLink as any).is_active
        },
        summary,
        analytics: analyticsData,
        count: analyticsData?.length || 0
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/promo-links/[id]/analytics - Record analytics data (for tracking)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Get the current user (optional for tracking - could be public)
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();

    // Validate required fields
    if (!body.date) {
      return NextResponse.json({ 
        error: 'Date is required' 
      }, { status: 400 });
    }

    // Verify the promo link exists
    const { data: promoLink, error: promoError } = await (supabase as any)
      .from('promo_links')
      .select('id')
      .eq('id', resolvedParams.id)
      .single();

    if (promoError || !promoLink) {
      return NextResponse.json({ error: 'Promo link not found' }, { status: 404 });
    }

    // Prepare analytics data
    const analyticsData = {
      promo_link_id: resolvedParams.id,
      date: body.date,
      clicks: body.clicks || 0,
      conversions: body.conversions || 0,
      revenue: body.revenue || 0,
      new_fans: body.new_fans || 0,
      conversion_rate: body.conversion_rate || null,
      roi: body.roi || null
    };

    // Upsert analytics data (update if exists for this date, insert if not)
    const { data: analytics, error } = await (supabase as any)
      .from('promo_link_analytics')
      .upsert(analyticsData, {
        onConflict: 'promo_link_id,date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording analytics:', error);
      return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: analytics,
      message: 'Analytics recorded successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

