import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/people - Get people (team members) for agency
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params for filtering and pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const role = searchParams.get('role'); // 'Admin', 'Creator', etc.
    const search = searchParams.get('search');

    // First, get user's profile to check if they're an agency
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type, profile_data')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Access denied. Only agencies can manage people.' 
      }, { status: 403 });
    }

    // For now, we'll return the agency's models as "people" since the team_members table was removed
    // Get models associated with this agency
    let query = (supabase as any)
      .from('models')
      .select(`
        id,
        name,
        email,
        username,
        display_picture_url,
        status,
        created_at,
        user_id,
        agency_id
      `)
      .eq('agency_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply role filter - in this context, "role" refers to model status or type
    if (role && ['Active', 'Inactive', 'Paused', 'Suspended'].includes(role)) {
      query = query.eq('status', role);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: models, error } = await query;

    if (error) {
      console.error('Error fetching people:', error);
      return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = (supabase as any)
      .from('models')
      .select('id', { count: 'exact' })
      .eq('agency_id', user.id);

    if (role && ['Active', 'Inactive', 'Paused', 'Suspended'].includes(role)) {
      countQuery = countQuery.eq('status', role);
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching people count:', countError);
    }

    // Transform models data to match people interface
    const people = (models || []).map((model: any) => ({
      id: model.id,
      name: model.name,
      email: model.email,
      username: model.username,
      display_picture_url: model.display_picture_url,
      role: 'Creator', // All models are creators in this context
      status: model.status,
      created_at: model.created_at
    }));

    return NextResponse.json({
      success: true,
      data: people,
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

// POST /api/people - Add a new person (model) to agency
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is an agency
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Access denied. Only agencies can add people.' 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'name and email are required' 
      }, { status: 400 });
    }

    // Check if model with this email already exists
    const { data: existingModel, error: existingError } = await (supabase as any)
      .from('models')
      .select('id')
      .eq('email', body.email)
      .single();

    if (existingModel) {
      return NextResponse.json({ 
        error: 'Model with this email already exists' 
      }, { status: 409 });
    }

    // Create new model and assign to agency
    const modelData = {
      name: body.name,
      email: body.email,
      username: body.username || null,
      display_picture_url: body.display_picture_url || null,
      onlyfans_link: body.onlyfans_link || null,
      telegram_link: body.telegram_link || null,
      price: body.price || 0,
      fan_count: body.fan_count || 0,
      payout_percentage: body.payout_percentage || 0,
      subscription_type: body.subscription_type || 'Paid',
      status: body.status || 'Active',
      language: body.language || 'English',
      timezone: body.timezone || 'GMT+5',
      is_verified: body.is_verified || false,
      agency_id: user.id, // Assign to current agency
      user_id: null // Models can be managed by agency without individual user accounts
    };

    const { data: model, error } = await (supabase as any)
      .from('models')
      .insert(modelData)
      .select(`
        id,
        name,
        email,
        username,
        display_picture_url,
        status,
        created_at,
        agency_id
      `)
      .single();

    if (error) {
      console.error('Error creating model:', error);
      return NextResponse.json({ error: 'Failed to create model' }, { status: 500 });
    }

    // Transform to people format
    const person = {
      id: model.id,
      name: model.name,
      email: model.email,
      username: model.username,
      display_picture_url: model.display_picture_url,
      role: 'Creator',
      status: model.status,
      created_at: model.created_at
    };

    return NextResponse.json({
      success: true,
      data: person,
      message: 'Person added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
