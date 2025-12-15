import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/analytics/performance - Get detailed performance metrics
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
    const metric = searchParams.get('metric'); // 'roi', 'conversion', 'revenue', 'clicks'
    const groupBy = searchParams.get('group_by') || 'day'; // 'day', 'week', 'month'

    // Calculate date range (default to last 30 days)
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get user's models
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
          metrics: [],
          summary: {},
          trends: {}
        }
      });
    }

    // Get promo links for the models
    const { data: promoLinks, error: promoLinksError } = await (supabase as any)
      .from('promo_links')
      .select('id, model_id')
      .in('model_id', modelIds);

    const promoLinkIds = promoLinks?.map((pl: any) => pl.id) || [];

    if (promoLinkIds.length === 0) {
      return NextResponse.json({ 
        success: true,
        data: {
          metrics: [],
          summary: {},
          trends: {}
        }
      });
    }

    // Get analytics data
    let analyticsQuery = (supabase as any)
      .from('promo_link_analytics')
      .select('*')
      .in('promo_link_id', promoLinkIds)
      .gte('date', startDateObj.toISOString())
      .lte('date', endDateObj.toISOString())
      .order('date', { ascending: true });

    const { data: analytics, error: analyticsError } = await analyticsQuery;

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    const analyticsData = analytics || [];

    // Group data by time period
    const groupedData: Record<string, any[]> = {};
    
    analyticsData.forEach((record: any) => {
      const date = new Date(record.date);
      let key: string;
      
      switch (groupBy) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          key = record.date;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record);
    });

    // Calculate metrics per time period
    const metrics = Object.entries(groupedData).map(([period, records]) => {
      const totalClicks = records.reduce((sum: number, r: any) => sum + (r.clicks || 0), 0);
      const totalConversions = records.reduce((sum: number, r: any) => sum + (r.conversions || 0), 0);
      const totalRevenue = records.reduce((sum: number, r: any) => sum + parseFloat(r.revenue || 0), 0);
      const totalNewFans = records.reduce((sum: number, r: any) => sum + (r.new_fans || 0), 0);
      
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const averageROI = records.length > 0 
        ? records.reduce((sum: number, r: any) => sum + (r.roi || 0), 0) / records.length 
        : 0;

      return {
        period,
        clicks: totalClicks,
        conversions: totalConversions,
        revenue: totalRevenue,
        new_fans: totalNewFans,
        conversion_rate: conversionRate,
        roi: averageROI,
        record_count: records.length
      };
    }).sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

    // Calculate summary statistics
    const totalClicks = analyticsData.reduce((sum: number, r: any) => sum + (r.clicks || 0), 0);
    const totalConversions = analyticsData.reduce((sum: number, r: any) => sum + (r.conversions || 0), 0);
    const totalRevenue = analyticsData.reduce((sum: number, r: any) => sum + parseFloat(r.revenue || 0), 0);
    const totalNewFans = analyticsData.reduce((sum: number, r: any) => sum + (r.new_fans || 0), 0);
    const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const avgROI = analyticsData.length > 0 
      ? analyticsData.reduce((sum: number, r: any) => sum + (r.roi || 0), 0) / analyticsData.length 
      : 0;

    const summary = {
      total_clicks: totalClicks,
      total_conversions: totalConversions,
      total_revenue: totalRevenue,
      total_new_fans: totalNewFans,
      average_conversion_rate: avgConversionRate,
      average_roi: avgROI,
      period_count: metrics.length,
      date_range: {
        start: startDateObj.toISOString(),
        end: endDateObj.toISOString()
      }
    };

    // Calculate trends (compare first half vs second half of period)
    const trends = {
      clicks_trend: 0,
      revenue_trend: 0,
      conversion_trend: 0,
      roi_trend: 0
    };

    if (metrics.length > 1) {
      const midpoint = Math.floor(metrics.length / 2);
      const firstHalf = metrics.slice(0, midpoint);
      const secondHalf = metrics.slice(midpoint);

      const firstHalfAvg = {
        clicks: firstHalf.reduce((sum, m) => sum + m.clicks, 0) / firstHalf.length,
        revenue: firstHalf.reduce((sum, m) => sum + m.revenue, 0) / firstHalf.length,
        conversion_rate: firstHalf.reduce((sum, m) => sum + m.conversion_rate, 0) / firstHalf.length,
        roi: firstHalf.reduce((sum, m) => sum + m.roi, 0) / firstHalf.length
      };

      const secondHalfAvg = {
        clicks: secondHalf.reduce((sum, m) => sum + m.clicks, 0) / secondHalf.length,
        revenue: secondHalf.reduce((sum, m) => sum + m.revenue, 0) / secondHalf.length,
        conversion_rate: secondHalf.reduce((sum, m) => sum + m.conversion_rate, 0) / secondHalf.length,
        roi: secondHalf.reduce((sum, m) => sum + m.roi, 0) / secondHalf.length
      };

      trends.clicks_trend = firstHalfAvg.clicks > 0 
        ? ((secondHalfAvg.clicks - firstHalfAvg.clicks) / firstHalfAvg.clicks) * 100 
        : 0;
      trends.revenue_trend = firstHalfAvg.revenue > 0 
        ? ((secondHalfAvg.revenue - firstHalfAvg.revenue) / firstHalfAvg.revenue) * 100 
        : 0;
      trends.conversion_trend = firstHalfAvg.conversion_rate > 0 
        ? ((secondHalfAvg.conversion_rate - firstHalfAvg.conversion_rate) / firstHalfAvg.conversion_rate) * 100 
        : 0;
      trends.roi_trend = firstHalfAvg.roi > 0 
        ? ((secondHalfAvg.roi - firstHalfAvg.roi) / firstHalfAvg.roi) * 100 
        : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        summary,
        trends,
        requested_metric: metric,
        group_by: groupBy
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
