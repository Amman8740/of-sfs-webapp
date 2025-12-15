import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/vault/[id] - Fetch a specific vault item
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

    const { data: vaultItem, error } = await (supabase as any)
      .from('vault')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      data: vaultItem 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/vault/[id] - Update a vault item
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

    // First, check if user owns this vault item
    const { data: existingItem, error: fetchError } = await (supabase as any)
      .from('vault')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, any> = {};
    
    if (body.model_id !== undefined) updateData.model_id = body.model_id;
    if (body.caption !== undefined) updateData.caption = body.caption;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tag_creators !== undefined) updateData.tag_creators = Array.isArray(body.tag_creators) ? body.tag_creators : [];
    if (body.hashtags !== undefined) updateData.hashtags = Array.isArray(body.hashtags) ? body.hashtags : [];
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: updatedItem, error: updateError } = await (supabase as any)
      .from('vault')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating vault item:', updateError);
      return NextResponse.json({ error: 'Failed to update vault item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: updatedItem,
      message: 'Vault item updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/vault/[id] - Delete a vault item
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

    // First, check if user owns this vault item
    const { data: existingItem, error: fetchError } = await (supabase as any)
      .from('vault')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
    }

    const { error: deleteError } = await (supabase as any)
      .from('vault')
      .delete()
      .eq('id', resolvedParams.id);

    if (deleteError) {
      console.error('Error deleting vault item:', deleteError);
      return NextResponse.json({ error: 'Failed to delete vault item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Vault item deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
