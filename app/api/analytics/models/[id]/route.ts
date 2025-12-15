import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/analytics/models/[id] - Get analytics for a specific model
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

    // Verify the model exists and user has access
    const { data: model, error: modelError } = await (supabase as any)
      .from('models')
      .select('id, name, username, fan_count, user_id, agency_id')
      .eq('id', params.id)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Check if user has access to this model
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to view analytics for this model' 
      }, { status: 403 });
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const period = searchParams.get('period') || '30'; // days

    // Calculate date range
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get model's promo links
    const { data: promoLinks, error: promoLinksError } = await (supabase as any)
      .from('promo_links')
      .select(`
        id,
        title,
        promo_url,
        is_active,
        discount_percentage,
        created_at,
        start_date,
        end_date
      `)
      .eq('model_id', params.id)
      .gte('created_at', startDateObj.toISOString())
      .lte('created_at', endDateObj.toISOString());

    if (promoLinksError) {
      console.error('Error fetching promo links:', promoLinksError);
      return NextResponse.json({ error: 'Failed to fetch promo links' }, { status: 500 });
    }

    // Get analytics for model's promo links
    const promoLinkIds = promoLinks?.map((pl: any) => pl.id) || [];
    let analyticsQuery = (supabase as any)
      .from('promo_link_analytics')
      .select('*');

    if (promoLinkIds.length > 0) {
      analyticsQuery = analyticsQuery.in('promo_link_id', promoLinkIds);
    }

    if (startDate) {
      analyticsQuery = analyticsQuery.gte('date', startDateObj.toISOString());
    }
    if (endDate) {
      analyticsQuery = analyticsQuery.lte('date', endDateObj.toISOString());
    }

    const { data: analytics, error: analyticsError } = await analyticsQuery.order('date', { ascending: true });

    // Get SFS requests for this model
    const { data: sfsRequests, error: sfsRequestsError } = await (supabase as any)
      .from('sfs_requests')
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:sender_id (
          id,
          name,
          username
        ),
        receiver:receiver_id (
          id,
          name,
          username
        )
      `)
      .or(`sender_id.eq.${params.id},receiver_id.eq.${params.id}`)
      .gte('created_at', startDateObj.toISOString())
      .lte('created_at', endDateObj.toISOString());

    // Get scheduled SFS for this model
    const { data: scheduledSfs, error: scheduledSfsError } = await (supabase as any)
      .from('scheduled_sfs')
      .select(`
        id,
        partner_model_id,
        scheduled_date,
        status,
        created_at,
        models:partner_model_id (
          id,
          name,
          username
        )
      `)
      .eq('model_id', params.id)
      .gte('created_at', startDateObj.toISOString())
      .lte('created_at', endDateObj.toISOString());

    if (analyticsError || sfsRequestsError || scheduledSfsError) {
      console.error('Error fetching model analytics:', { analyticsError, sfsRequestsError, scheduledSfsError });
    }

    const analyticsData = analytics || [];

    // Calculate performance metrics
    const totalClicks = analyticsData.reduce((sum: number, a: any) => sum + (a.clicks || 0), 0);
    const totalConversions = analyticsData.reduce((sum: number, a: any) => sum + (a.conversions || 0), 0);
    const totalRevenue = analyticsData.reduce((sum: number, a: any) => sum + parseFloat(a.revenue || 0), 0);
    const totalNewFans = analyticsData.reduce((sum: number, a: any) => sum + (a.new_fans || 0), 0);
    const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const avgROI = analyticsData.length > 0 
      ? analyticsData.reduce((sum: number, a: any) => sum + (a.roi || 0), 0) / analyticsData.length 
      : 0;

    // Calculate daily performance (group by date)
    const dailyPerformance: Record<string, any> = {};
    analyticsData.forEach((record: any) => {
      const date = record.date;
      if (!dailyPerformance[date]) {
        dailyPerformance[date] = {
          date,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          new_fans: 0,
          roi: 0,
          records: 0
        };
      }
      dailyPerformance[date].clicks += record.clicks || 0;
      dailyPerformance[date].conversions += record.conversions || 0;
      dailyPerformance[date].revenue += parseFloat(record.revenue || 0);
      dailyPerformance[date].new_fans += record.new_fans || 0;
      dailyPerformance[date].roi += record.roi || 0;
      dailyPerformance[date].records += 1;
    });

    // Calculate averages for daily performance
    Object.values(dailyPerformance).forEach((day: any) => {
      if (day.records > 0) {
        day.roi = day.roi / day.records;
        day.conversion_rate = day.clicks > 0 ? (day.conversions / day.clicks) * 100 : 0;
      }
      delete day.records;
    });

    const dailyPerformanceArray = Object.values(dailyPerformance).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate promo link performance
    const promoLinksPerformance = promoLinks?.map((pl: any) => {
      const plAnalytics = analyticsData.filter((a: any) => a.promo_link_id === pl.id);
      const plClicks = plAnalytics.reduce((sum: number, a: any) => sum + (a.clicks || 0), 0);
      const plConversions = plAnalytics.reduce((sum: number, a: any) => sum + (a.conversions || 0), 0);
      const plRevenue = plAnalytics.reduce((sum: number, a: any) => sum + parseFloat(a.revenue || 0), 0);
      const plNewFans = plAnalytics.reduce((sum: number, a: any) => sum + (a.new_fans || 0), 0);
      const plROI = plAnalytics.length > 0 
        ? plAnalytics.reduce((sum: number, a: any) => sum + (a.roi || 0), 0) / plAnalytics.length 
        : 0;

      return {
        id: pl.id,
        title: pl.title,
        promo_url: pl.promo_url,
        is_active: pl.is_active,
        discount_percentage: pl.discount_percentage,
        total_clicks: plClicks,
        total_conversions: plConversions,
        total_revenue: plRevenue,
        total_new_fans: plNewFans,
        average_roi: plROI,
        conversion_rate: plClicks > 0 ? (plConversions / plClicks) * 100 : 0,
        created_at: pl.created_at
      };
    }) || [];

    // Calculate SFS performance
    const sfsStats = {
      total_requests_sent: sfsRequests?.filter((sr: any) => sr.sender_id === params.id).length || 0,
      total_requests_received: sfsRequests?.filter((sr: any) => sr.receiver_id === params.id).length || 0,
      pending_requests: sfsRequests?.filter((sr: any) => sr.status === 'pending').length || 0,
      accepted_requests: sfsRequests?.filter((sr: any) => sr.status === 'accepted').length || 0,
      completed_requests: sfsRequests?.filter((sr: any) => sr.status === 'completed').length || 0,
      total_scheduled_posts: scheduledSfs?.length || 0,
      upcoming_posts: scheduledSfs?.filter((ss: any) => 
        new Date(ss.scheduled_date) > new Date() && ss.status === 'scheduled'
      ).length || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        model: {
          id: model.id,
          name: model.name,
          username: model.username,
          fan_count: model.fan_count
        },
        overview: {
          total_promo_links: promoLinks?.length || 0,
          total_clicks: totalClicks,
          total_conversions: totalConversions,
          total_revenue: totalRevenue,
          total_new_fans: totalNewFans,
          average_conversion_rate: avgConversionRate,
          average_roi: avgROI,
          total_sfs_requests: sfsRequests?.length || 0,
          total_scheduled_posts: scheduledSfs?.length || 0
        },
        daily_performance: dailyPerformanceArray,
        promo_links_performance: promoLinksPerformance,
        sfs_performance: sfsStats,
        date_range: {
          start: startDateObj.toISOString(),
          end: endDateObj.toISOString(),
          period_days: parseInt(period)
        }
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
