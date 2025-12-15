import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// PUT /api/media/batch - Batch update media items
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.media_ids || !Array.isArray(body.media_ids) || body.media_ids.length === 0) {
      return NextResponse.json({ 
        error: 'Missing or invalid media_ids',
        details: 'media_ids must be a non-empty array' 
      }, { status: 400 });
    }

    if (!body.updates || typeof body.updates !== 'object') {
      return NextResponse.json({ 
        error: 'Missing or invalid updates',
        details: 'updates must be an object' 
      }, { status: 400 });
    }

    // First, verify all media items exist and user has access
    const { data: mediaItems, error: fetchError } = await (supabase as any)
      .from('media_items')
      .select(`
        id,
        models:model_id (
          user_id,
          agency_id
        )
      `)
      .in('id', body.media_ids);

    if (fetchError) {
      console.error('Error fetching media items:', fetchError);
      return NextResponse.json({ error: 'Failed to verify media items' }, { status: 500 });
    }

    if (!mediaItems || mediaItems.length !== body.media_ids.length) {
      return NextResponse.json({ 
        error: 'Some media items not found' 
      }, { status: 404 });
    }

    // Check if user has access to all media items
    const hasAccess = mediaItems.every((item: any) => {
      const model = item.models;
      return model.user_id === user.id || model.agency_id === user.id;
    });

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'You do not have permission to update some of these media items' 
      }, { status: 403 });
    }

    // Prepare update data
    const updateData: Record<string, any> = {};
    
    if (body.updates.category !== undefined) updateData.category = body.updates.category;
    if (body.updates.tags !== undefined) updateData.tags = body.updates.tags;
    if (body.updates.is_public !== undefined) updateData.is_public = body.updates.is_public;

    // Perform batch update
    const { data: updatedItems, error } = await (supabase as any)
      .from('media_items')
      .update(updateData)
      .in('id', body.media_ids)
      .select();

    if (error) {
      console.error('Error updating media items:', error);
      return NextResponse.json({ error: 'Failed to update media items' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: updatedItems,
      count: updatedItems?.length || 0,
      message: `Successfully updated ${updatedItems?.length || 0} media items` 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/media/batch - Batch delete media items
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.media_ids || !Array.isArray(body.media_ids) || body.media_ids.length === 0) {
      return NextResponse.json({ 
        error: 'Missing or invalid media_ids',
        details: 'media_ids must be a non-empty array' 
      }, { status: 400 });
    }

    // First, verify all media items exist and user has access
    const { data: mediaItems, error: fetchError } = await (supabase as any)
      .from('media_items')
      .select(`
        id,
        file_url,
        models:model_id (
          user_id,
          agency_id
        )
      `)
      .in('id', body.media_ids);

    if (fetchError) {
      console.error('Error fetching media items:', fetchError);
      return NextResponse.json({ error: 'Failed to verify media items' }, { status: 500 });
    }

    if (!mediaItems || mediaItems.length !== body.media_ids.length) {
      return NextResponse.json({ 
        error: 'Some media items not found' 
      }, { status: 404 });
    }

    // Check if user has access to all media items
    const hasAccess = mediaItems.every((item: any) => {
      const model = item.models;
      return model.user_id === user.id || model.agency_id === user.id;
    });

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete some of these media items' 
      }, { status: 403 });
    }

    // TODO: Delete the actual files from Supabase Storage
    // const fileUrls = mediaItems.map((item: any) => item.file_url);
    // await supabase.storage.from('media-uploads').remove(fileUrls);

    // Perform batch delete
    const { error } = await (supabase as any)
      .from('media_items')
      .delete()
      .in('id', body.media_ids);

    if (error) {
      console.error('Error deleting media items:', error);
      return NextResponse.json({ error: 'Failed to delete media items' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      count: body.media_ids.length,
      message: `Successfully deleted ${body.media_ids.length} media items` 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

