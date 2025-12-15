import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

// GET /api/scheduled-sfs/agency-history - Fetch scheduled SFS created by current agency
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseService = await createServiceRoleClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 Current user:', { id: user.id, email: user.email });

    // Get user profile to check if they're an agency
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    console.log('📋 User profile lookup:', { 
      user_id: user.id, 
      result: userProfile,
      error: profileError?.message 
    });

    if ((userProfile as any)?.user_type !== 'agency') {
      console.error('❌ Not an agency user');
      return NextResponse.json(
        { error: 'Only agencies can access agency history', userType: (userProfile as any)?.user_type },
        { status: 403 }
      );
    }

    console.log('✅ Confirmed agency user:', { agency_id: user.id });

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    console.log('📊 Query parameters:', { status, startDate, endDate });

    // Try with regular client first
    console.log('🔍 Attempting query with regular client...');
    let query = (supabase as any)
      .from('scheduled_sfs')
      .select('*')
      .eq('agency_id', user.id)
      .order('scheduled_date', { ascending: false });

    // Filter by status if provided
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

    console.log('📦 Query result with regular client:', {
      error: error?.message || 'none',
      count: scheduledSFS?.length || 0,
      data: scheduledSFS
    });

    // If regular client returns no results, try with service role to bypass RLS
    let finalData = scheduledSFS;
    if (!scheduledSFS || scheduledSFS.length === 0) {
      console.log('⚠️ No results with regular client, trying service role...');
      
      let serviceQuery = (supabaseService as any)
        .from('scheduled_sfs')
        .select('*')
        .eq('agency_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (status) {
        serviceQuery = serviceQuery.eq('status', status);
      }
      if (startDate) {
        serviceQuery = serviceQuery.gte('scheduled_date', startDate);
      }
      if (endDate) {
        serviceQuery = serviceQuery.lte('scheduled_date', endDate);
      }

      const { data: serviceData, error: serviceError } = await serviceQuery;
      
      console.log('📦 Query result with service role:', {
        error: serviceError?.message || 'none',
        count: serviceData?.length || 0,
        data: serviceData
      });

      if (serviceError) {
        console.error('❌ Service role query also failed:', serviceError);
        return NextResponse.json(
          { 
            error: 'Failed to fetch agency SFS history', 
            details: serviceError.message,
            debug: 'Service role also failed - likely RLS issue'
          },
          { status: 500 }
        );
      }

      finalData = serviceData;
    }

    console.log('✅ Final data count:', finalData?.length || 0);

    // If still no data, return helpful debug info
    if (!finalData || finalData.length === 0) {
      console.log('⚠️ No records found for agency:', {
        agency_id: user.id,
        possibleReasons: [
          'No SFS created by this agency yet',
          'RLS policy preventing access',
          'agency_id column is NULL in database'
        ]
      });

      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        agency_id: user.id,
        debug: {
          message: 'No records found',
          agency_id: user.id,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Fetch media details separately
    let mediaMap: any = {};
    const mediaIds = Array.from(
      new Set((finalData as any)?.map((sfs: any) => sfs.media_id).filter(Boolean) || [])
    ) as string[];
    if (mediaIds.length > 0) {
      console.log('📸 Fetching media for IDs:', mediaIds);
      const { data: mediaItems } = await supabaseService
        .from('media_items')
        .select('id, file_url, thumbnail_url, file_type')
        .in('id', mediaIds);

      if (mediaItems) {
        mediaMap = mediaItems.reduce((map: any, media: any) => {
          map[media.id] = media;
          return map;
        }, {});
        console.log('✅ Media fetched:', { count: Object.keys(mediaMap).length });
      }
    }

    // Fetch promo links
    const promoLinkIds = Array.from(
      new Set((finalData as any)?.map((sfs: any) => sfs.promo_link).filter(Boolean) || [])
    ) as string[];
    let promoLinksMap: any = {};
    if (promoLinkIds.length > 0) {
      console.log('🔗 Fetching promo links for IDs:', promoLinkIds);
      const { data: promoLinks } = await supabaseService
        .from('promo_links')
        .select('id, promo_name, url')
        .in('id', promoLinkIds);

      if (promoLinks) {
        promoLinksMap = promoLinks.reduce((map: any, promo: any) => {
          map[promo.id] = promo;
          return map;
        }, {});
        console.log('✅ Promo links fetched:', { count: Object.keys(promoLinksMap).length });
      }
    }

    // Combine data with relations
    const dataWithRelations = (finalData as any)?.map((sfs: any) => ({
      ...sfs,
      media: sfs.media_id ? mediaMap[sfs.media_id] : null,
      promo_links: sfs.promo_link ? promoLinksMap[sfs.promo_link] : null
    }));

    console.log('📦 Final response:', { count: dataWithRelations?.length || 0, agency_id: user.id });

    return NextResponse.json({
      success: true,
      data: dataWithRelations,
      count: dataWithRelations?.length || 0,
      agency_id: user.id
    });
  } catch (error) {
    console.error('❌ Unexpected error in agency history:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
