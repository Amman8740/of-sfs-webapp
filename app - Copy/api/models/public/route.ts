import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

// GET /api/models/public - Fetch all public models (no authentication required) for testing and demo purposes
export async function GET(request: NextRequest) {
  try {
    // Use service role client to bypass RLS policies for public data
    const supabase = createServiceRoleClient();

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'Active';
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false;
    const verified = searchParams.get('verified') === 'false' ? false : true;

    // Build the query - get only verified, active models
    let query = (supabase as any)
      .from('models')
      .select('id, name, username, email, display_picture_url, onlyfans_link, telegram_link, fan_count, subscription_type, is_verified, verification_date, language, timezone, price, status, created_at', { count: 'exact' });

    console.log('Query parameters:', { limit, offset, status, search, sortBy, sortOrder, verified });

    // Only show verified and active models publicly (if verified = true)
    // If verified = false, show all models
    if (verified) {
      console.log('Filtering for verified models only');
      query = query.eq('is_verified', true);
    }
    query = query.eq('status', status);

    if (search) {
      console.log('Applying search filter:', search);
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: models, error, count } = await query;

    if (error) {
      console.error('Error fetching public models:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch models',
        details: error.message 
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      data: models || [],
      count: count || 0,
      pagination: { 
        limit,
        offset,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error in public models API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
