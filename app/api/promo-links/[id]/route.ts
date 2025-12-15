import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/promo-links/[id] - Fetch a specific promo link
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

    const { data: promoLink, error } = await supabase
      .from('promo_links')
      .select(`
        *,
        models:model_id (
          id,
          name,
          username,
          display_picture_url,
          user_id,
          agency_id
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Promo link not found' }, { status: 404 });
      }
      console.error('Error fetching promo link:', error);
      return NextResponse.json({ error: 'Failed to fetch promo link' }, { status: 500 });
    }

    // Check if user has access (owns the model or is the agency)
    const model = (promoLink as any).models;
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to view this promo link' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true,
      data: promoLink 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/promo-links/[id] - Update a specific promo link
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

    const body = await request.json();

    // First, get the promo link to check permissions
    const { data: existingPromoLink, error: fetchError } = await supabase
      .from('promo_links')
      .select(`
        *,
        models:model_id (
          user_id,
          agency_id
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingPromoLink) {
      return NextResponse.json({ error: 'Promo link not found' }, { status: 404 });
    }

    // Check if user has access (owns the model or is the agency)
    const model = (existingPromoLink as any).models;
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this promo link' 
      }, { status: 403 });
    }

    // Prepare update data (exclude fields that shouldn't be updated)
    const updateData: Record<string, any> = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.promo_url !== undefined) updateData.promo_url = body.promo_url;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.discount_percentage !== undefined) updateData.discount_percentage = body.discount_percentage;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;

    // Update the promo link
    const { data: promoLink, error } = await (supabase as any)
      .from('promo_links')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select(`
        *,
        models:model_id (
          id,
          name,
          username,
          display_picture_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating promo link:', error);
      return NextResponse.json({ error: 'Failed to update promo link' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: promoLink,
      message: 'Promo link updated successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/promo-links/[id] - Delete a specific promo link
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

    // First, get the promo link to check permissions
    const { data: existingPromoLink, error: fetchError } = await supabase
      .from('promo_links')
      .select(`
        *,
        models:model_id (
          user_id,
          agency_id
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingPromoLink) {
      return NextResponse.json({ error: 'Promo link not found' }, { status: 404 });
    }

    // Check if user has access (owns the model or is the agency)
    const model = (existingPromoLink as any).models;
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this promo link' 
      }, { status: 403 });
    }

    // Delete the promo link (cascade will handle analytics)
    const { error } = await supabase
      .from('promo_links')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Error deleting promo link:', error);
      return NextResponse.json({ error: 'Failed to delete promo link' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Promo link deleted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

