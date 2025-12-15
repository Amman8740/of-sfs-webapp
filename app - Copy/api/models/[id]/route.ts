import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { ModelFormData } from '@/components/features/models';

// GET /api/models/[id] - Fetch a specific model
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

    // Get user's profile to determine access level
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // Build query with access control
    let query = (supabase as any)
      .from('models')
      .select('*')
      .eq('id', resolvedParams.id);

    // Apply access control based on user type
    if (userProfile?.user_type === 'agency') {
      query = query.or(`agency_id.eq.${user.id},agency_id.is.null`);
    } else if (userProfile?.user_type === 'creator') {
      query = query.eq('user_id', user.id);
    } else {
      // Default: only public models
      query = query.is('agency_id', null);
    }

    const { data: model, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
      console.error('Error fetching model:', error);
      return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/models/[id] - Update a specific model
export async function PUT(
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

    const body: ModelFormData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Get user's profile to determine access level
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // First, verify the model exists and user has access
    let accessQuery = (supabase as any)
      .from('models')
      .select('id, email, user_id, agency_id')
      .eq('id', resolvedParams.id);

    if (userProfile?.user_type === 'agency') {
      accessQuery = accessQuery.or(`agency_id.eq.${user.id},agency_id.is.null`);
    } else if (userProfile?.user_type === 'creator') {
      accessQuery = accessQuery.eq('user_id', user.id);
    } else {
      accessQuery = accessQuery.is('agency_id', null);
    }

    const { data: existingModel, error: fetchError } = await accessQuery.single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
      console.error('Error fetching model:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
    }

    // Check if user has permission to update this model
    if (userProfile?.user_type === 'creator' && existingModel.user_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this model' 
      }, { status: 403 });
    }

    if (userProfile?.user_type === 'agency' && existingModel.agency_id !== user.id && existingModel.agency_id !== null) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this model' 
      }, { status: 403 });
    }

    // Check if email is being updated and conflicts with another model
    if (body.email !== existingModel.email) {
      const { data: emailConflict, error: emailError } = await (supabase as any)
        .from('models')
        .select('id')
        .eq('email', body.email)
        .neq('id', resolvedParams.id)
        .single();

      if (emailConflict) {
        return NextResponse.json({ 
          error: 'Email already in use by another model' 
        }, { status: 409 });
      }
    }

    // Prepare model data for update
    const modelData = {
      name: body.name,
      email: body.email,
      display_picture_url: body.displayPictureUrl || null,
      onlyfans_link: body.onlyfansLink || null,
      telegram_link: body.telegramLink || null,
      username: body.username || null,
      price: body.price || 0,
      fan_count: body.fanCount || 0,
      payout_percentage: body.payoutPercentage || 0,
      subscription_type: body.subscriptionType || 'Paid',
      status: body.status || 'Active',
      language: body.language || 'English',
      timezone: body.timezone || 'GMT+5',
      is_verified: body.isVerified || false,
      verification_date: body.isVerified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    // Apply access control in update query
    let updateQuery = (supabase as any)
      .from('models')
      .update(modelData)
      .eq('id', resolvedParams.id);

    if (userProfile?.user_type === 'agency') {
      updateQuery = updateQuery.or(`agency_id.eq.${user.id},agency_id.is.null`);
    } else if (userProfile?.user_type === 'creator') {
      updateQuery = updateQuery.eq('user_id', user.id);
    } else {
      updateQuery = updateQuery.is('agency_id', null);
    }

    const { data: model, error } = await updateQuery
      .select('*')
      .single();

    if (error) {
      console.error('Error updating model:', error);
      return NextResponse.json({ error: 'Failed to update model' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: model,
      message: 'Model updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/models/[id] - Delete a specific model
export async function DELETE(
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

    // Get user's profile to determine access level
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // First, verify the model exists and user has access
    let accessQuery = (supabase as any)
      .from('models')
      .select('id, name, user_id, agency_id')
      .eq('id', resolvedParams.id);

    if (userProfile?.user_type === 'agency') {
      accessQuery = accessQuery.eq('agency_id', user.id);
    } else if (userProfile?.user_type === 'creator') {
      accessQuery = accessQuery.eq('user_id', user.id);
    } else {
      return NextResponse.json({ 
        error: 'Access denied. You cannot delete models.' 
      }, { status: 403 });
    }

    const { data: existingModel, error: fetchError } = await accessQuery.single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
      console.error('Error fetching model:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
    }

    // Apply access control in delete query
    let deleteQuery = (supabase as any)
      .from('models')
      .delete()
      .eq('id', resolvedParams.id);

    if (userProfile?.user_type === 'agency') {
      deleteQuery = deleteQuery.eq('agency_id', user.id);
    } else if (userProfile?.user_type === 'creator') {
      deleteQuery = deleteQuery.eq('user_id', user.id);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error deleting model:', error);
      return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Model ${existingModel.name} deleted successfully`
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
