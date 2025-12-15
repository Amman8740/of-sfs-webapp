import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/analytics/dashboard - Get comprehensive analytics dashboard data
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
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const modelId = searchParams.get('model_id');
    const period = searchParams.get('period') || '30'; // days

    // Calculate date range
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get user's models (either owned by user or managed by agency)
    let modelsQuery = (supabase as any)
      .from('models')
      .select('id, name, username, fan_count, user_id, agency_id')
      .or(`user_id.eq.${user.id},agency_id.eq.${user.id}`);

    if (modelId) {
      modelsQuery = modelsQuery.eq('id', modelId);
    }

    const { data: models, error: modelsError } = await modelsQuery;

    if (modelsError) {
      console.error('Error fetching models:', modelsError);
      return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
    }

    const modelIds = models?.map((m: any) => m.id) || [];

    if (modelIds.length === 0) {
      return NextResponse.json({ 
        success: true,
        data: {
          overview: {
            total_models: 0,
            total_promo_links: 0,
            total_clicks: 0,
            total_revenue: 0,
            total_sfs_requests: 0,
            average_roi: 0,
            fan_growth: 0
          },
          models: [],
          promo_links_performance: [],
          sfs_performance: [],
          recent_activity: []
        }
      });
    }

    // Get promo links performance
    const { data: promoLinks, error: promoLinksError } = await (supabase as any)
      .from('promo_links')
      .select(`
        id,
        title,
        model_id,
        is_active,
        discount_percentage,
        created_at,
        models:model_id (
          id,
          name
        )
      `)
      .in('model_id', modelIds)
      .gte('created_at', startDateObj.toISOString())
      .lte('created_at', endDateObj.toISOString());

    // Get promo link analytics
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

    const { data: analytics, error: analyticsError } = await analyticsQuery;

    // Get SFS requests data
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
          name
        ),
        receiver:receiver_id (
          id,
          name
        )
      `)
      .or(`sender_id.in.(${modelIds.join(',')}),receiver_id.in.(${modelIds.join(',')})`)
      .gte('created_at', startDateObj.toISOString())
      .lte('created_at', endDateObj.toISOString());

    // Get scheduled SFS data
    const { data: scheduledSfs, error: scheduledSfsError } = await (supabase as any)
      .from('scheduled_sfs')
      .select(`
        id,
        model_id,
        scheduled_date,
        status,
        created_at,
        models:model_id (
          id,
          name
        )
      `)
      .in('model_id', modelIds)
      .gte('created_at', startDateObj.toISOString())
      .lte('created_at', endDateObj.toISOString());

    if (promoLinksError || analyticsError || sfsRequestsError || scheduledSfsError) {
      console.error('Error fetching analytics data:', { promoLinksError, analyticsError, sfsRequestsError, scheduledSfsError });
    }

    // Calculate overview metrics
    const analyticsData = analytics || [];
    const totalClicks = analyticsData.reduce((sum: number, a: any) => sum + (a.clicks || 0), 0);
    const totalRevenue = analyticsData.reduce((sum: number, a: any) => sum + parseFloat(a.revenue || 0), 0);
    const totalConversions = analyticsData.reduce((sum: number, a: any) => sum + (a.conversions || 0), 0);
    const averageROI = analyticsData.length > 0 
      ? analyticsData.reduce((sum: number, a: any) => sum + (a.roi || 0), 0) / analyticsData.length 
      : 0;

    // Calculate fan growth (compare current vs previous period)
    const previousStartDate = new Date(startDateObj.getTime() - (endDateObj.getTime() - startDateObj.getTime()));
    const previousEndDate = new Date(startDateObj);

    // Get current fan counts
    const currentFanCounts = models?.reduce((sum: number, m: any) => sum + (m.fan_count || 0), 0) || 0;
    
    // For simplicity, we'll assume fan growth based on conversions and new fans from analytics
    const fanGrowth = analyticsData.reduce((sum: number, a: any) => sum + (a.new_fans || 0), 0);

    // Build performance data by model
    const modelPerformance = models?.map((model: any) => {
      const modelPromoLinks = promoLinks?.filter((pl: any) => pl.model_id === model.id) || [];
      const modelPromoLinkIds = modelPromoLinks.map((pl: any) => pl.id);
      const modelAnalytics = analyticsData.filter((a: any) => modelPromoLinkIds.includes(a.promo_link_id));
      
      const modelClicks = modelAnalytics.reduce((sum: number, a: any) => sum + (a.clicks || 0), 0);
      const modelRevenue = modelAnalytics.reduce((sum: number, a: any) => sum + parseFloat(a.revenue || 0), 0);
      const modelSfsRequests = sfsRequests?.filter((sr: any) => 
        sr.sender_id === model.id || sr.receiver_id === model.id
      ) || [];
      const modelScheduledSfs = scheduledSfs?.filter((ss: any) => ss.model_id === model.id) || [];

      return {
        model_id: model.id,
        model_name: model.name,
        username: model.username,
        fan_count: model.fan_count,
        promo_links_count: modelPromoLinks.length,
        total_clicks: modelClicks,
        total_revenue: modelRevenue,
        sfs_requests_count: modelSfsRequests.length,
        scheduled_sfs_count: modelScheduledSfs.length,
        avg_conversion_rate: modelAnalytics.length > 0 
          ? modelAnalytics.reduce((sum: number, a: any) => sum + (a.conversion_rate || 0), 0) / modelAnalytics.length 
          : 0
      };
    }) || [];

    // Build promo links performance data
    const promoLinksPerformance = promoLinks?.map((pl: any) => {
      const plAnalytics = analyticsData.filter((a: any) => a.promo_link_id === pl.id);
      const totalClicks = plAnalytics.reduce((sum: number, a: any) => sum + (a.clicks || 0), 0);
      const totalRevenue = plAnalytics.reduce((sum: number, a: any) => sum + parseFloat(a.revenue || 0), 0);
      const totalConversions = plAnalytics.reduce((sum: number, a: any) => sum + (a.conversions || 0), 0);
      
      return {
        id: pl.id,
        title: pl.title,
        model_name: (pl as any).models?.name,
        is_active: pl.is_active,
        total_clicks: totalClicks,
        total_revenue: totalRevenue,
        total_conversions: totalConversions,
        conversion_rate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        created_at: pl.created_at
      };
    }) || [];

    // Build SFS performance data
    const sfsPerformance = {
      total_requests: sfsRequests?.length || 0,
      pending_requests: sfsRequests?.filter((sr: any) => sr.status === 'pending').length || 0,
      accepted_requests: sfsRequests?.filter((sr: any) => sr.status === 'accepted').length || 0,
      completed_requests: sfsRequests?.filter((sr: any) => sr.status === 'completed').length || 0,
      total_scheduled: scheduledSfs?.length || 0,
      upcoming_posts: scheduledSfs?.filter((ss: any) => 
        new Date(ss.scheduled_date) > new Date() && ss.status === 'scheduled'
      ).length || 0
    };

    // Build recent activity
    const recentActivity = [
      ...(sfsRequests || []).map((sr: any) => ({
        type: 'sfs_request',
        title: `SFS Request ${sr.status}`,
        message: `${(sr as any).sender?.name} → ${(sr as any).receiver?.name}`,
        date: sr.created_at,
        status: sr.status
      })),
      ...(scheduledSfs || []).map((ss: any) => ({
        type: 'scheduled_sfs',
        title: 'Scheduled SFS Created',
        message: `Post scheduled for ${(ss as any).models?.name}`,
        date: ss.created_at,
        status: ss.status
      })),
      ...(promoLinks || []).map((pl: any) => ({
        type: 'promo_link',
        title: 'Promo Link Created',
        message: `${pl.title} for ${(pl as any).models?.name}`,
        date: pl.created_at,
        status: pl.is_active ? 'active' : 'inactive'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    const overview = {
      total_models: models?.length || 0,
      total_promo_links: promoLinks?.length || 0,
      total_clicks: totalClicks,
      total_conversions: totalConversions,
      total_revenue: totalRevenue,
      total_sfs_requests: sfsRequests?.length || 0,
      average_roi: averageROI,
      fan_growth: fanGrowth
    };

    return NextResponse.json({
      success: true,
      data: {
        overview,
        models: modelPerformance,
        promo_links_performance: promoLinksPerformance,
        sfs_performance: sfsPerformance,
        recent_activity: recentActivity,
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
