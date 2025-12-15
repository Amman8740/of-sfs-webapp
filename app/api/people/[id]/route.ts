import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/people/[id] - Get a specific person (model)
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

    // Verify user is an agency
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Access denied. Only agencies can view person details.' 
      }, { status: 403 });
    }

    // Get the specific model
    const { data: model, error } = await (supabase as any)
      .from('models')
      .select(`
        id,
        name,
        email,
        username,
        display_picture_url,
        onlyfans_link,
        telegram_link,
        price,
        fan_count,
        payout_percentage,
        subscription_type,
        status,
        language,
        timezone,
        is_verified,
        verification_date,
        created_at,
        updated_at,
        agency_id
      `)
      .eq('id', params.id)
      .eq('agency_id', user.id) // Ensure agency owns this model
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }
      console.error('Error fetching person:', error);
      return NextResponse.json({ error: 'Failed to fetch person' }, { status: 500 });
    }

    // Transform to people format
    const person = {
      id: model.id,
      name: model.name,
      email: model.email,
      username: model.username,
      display_picture_url: model.display_picture_url,
      onlyfans_link: model.onlyfans_link,
      telegram_link: model.telegram_link,
      price: model.price,
      fan_count: model.fan_count,
      payout_percentage: model.payout_percentage,
      subscription_type: model.subscription_type,
      status: model.status,
      language: model.language,
      timezone: model.timezone,
      is_verified: model.is_verified,
      verification_date: model.verification_date,
      role: 'Creator',
      created_at: model.created_at,
      updated_at: model.updated_at
    };

    return NextResponse.json({
      success: true,
      data: person
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/people/[id] - Update a specific person (model)
export async function PUT(
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

    // Verify user is an agency
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Access denied. Only agencies can update person details.' 
      }, { status: 403 });
    }

    const body = await request.json();

    // First, verify the model exists and belongs to the agency
    const { data: existingModel, error: fetchError } = await (supabase as any)
      .from('models')
      .select('id, email, agency_id')
      .eq('id', params.id)
      .eq('agency_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }
      console.error('Error fetching model:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
    }

    // Check if email is being updated and if it conflicts with another model
    if (body.email && body.email !== existingModel.email) {
      const { data: emailConflict, error: emailError } = await (supabase as any)
        .from('models')
        .select('id')
        .eq('email', body.email)
        .neq('id', params.id)
        .single();

      if (emailConflict) {
        return NextResponse.json({ 
          error: 'Email already in use by another model' 
        }, { status: 409 });
      }
    }

    // Prepare update data - only allow certain fields to be updated
    const updateData: any = {};
    const allowedFields = [
      'name', 'email', 'username', 'display_picture_url', 'onlyfans_link', 
      'telegram_link', 'price', 'fan_count', 'payout_percentage', 
      'subscription_type', 'status', 'language', 'timezone', 'is_verified'
    ];

    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update' 
      }, { status: 400 });
    }

    // Add verification_date if is_verified is being set to true
    if (updateData.is_verified === true) {
      updateData.verification_date = new Date().toISOString();
    } else if (updateData.is_verified === false) {
      updateData.verification_date = null;
    }

    // Update the model
    const { data: model, error } = await (supabase as any)
      .from('models')
      .update(updateData)
      .eq('id', params.id)
      .eq('agency_id', user.id)
      .select(`
        id,
        name,
        email,
        username,
        display_picture_url,
        onlyfans_link,
        telegram_link,
        price,
        fan_count,
        payout_percentage,
        subscription_type,
        status,
        language,
        timezone,
        is_verified,
        verification_date,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error updating model:', error);
      return NextResponse.json({ error: 'Failed to update model' }, { status: 500 });
    }

    // Transform to people format
    const person = {
      id: model.id,
      name: model.name,
      email: model.email,
      username: model.username,
      display_picture_url: model.display_picture_url,
      onlyfans_link: model.onlyfans_link,
      telegram_link: model.telegram_link,
      price: model.price,
      fan_count: model.fan_count,
      payout_percentage: model.payout_percentage,
      subscription_type: model.subscription_type,
      status: model.status,
      language: model.language,
      timezone: model.timezone,
      is_verified: model.is_verified,
      verification_date: model.verification_date,
      role: 'Creator',
      updated_at: model.updated_at
    };

    return NextResponse.json({
      success: true,
      data: person,
      message: 'Person updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/people/[id] - Remove a person (model) from agency
export async function DELETE(
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

    // Verify user is an agency
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Access denied. Only agencies can remove people.' 
      }, { status: 403 });
    }

    // First, verify the model exists and belongs to the agency
    const { data: existingModel, error: fetchError } = await (supabase as any)
      .from('models')
      .select('id, name, agency_id')
      .eq('id', params.id)
      .eq('agency_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }
      console.error('Error fetching model:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 });
    }

    // Remove the model from agency (set agency_id to null instead of deleting)
    // This allows the model to continue existing but be unmanaged
    const { error } = await (supabase as any)
      .from('models')
      .update({ 
        agency_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('agency_id', user.id);

    if (error) {
      console.error('Error removing model from agency:', error);
      return NextResponse.json({ error: 'Failed to remove person from agency' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Person ${existingModel.name} removed from agency successfully`
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
