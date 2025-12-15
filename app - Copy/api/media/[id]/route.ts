import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/media/[id] - Fetch a specific media item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: mediaItem, error } = await (supabase as any)
      .from('media_items')
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
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
      }
      console.error('Error fetching media item:', error);
      return NextResponse.json({ error: 'Failed to fetch media item' }, { status: 500 });
    }

    // Check if user has access (owns the model or is the agency)
    const model = (mediaItem as any).models;
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to view this media item' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true,
      data: mediaItem 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/media/[id] - Update a specific media item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if the request contains FormData (for file uploads) or JSON
    let body: any = {};
    let newImageFile: File | null = null;

    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await request.formData();
      newImageFile = formData.get('newImageFile') as File;
      
      // Parse other form fields
      body.caption = formData.get('caption') as string;
      body.category = formData.get('category') as string;
      const hashtagsStr = formData.get('hashtags') as string;
      body.hashtags = hashtagsStr ? JSON.parse(hashtagsStr) : [];
      body.notes = formData.get('notes') as string;
      const tagCreatorsStr = formData.get('tag_creators') as string;
      body.tag_creators = tagCreatorsStr ? JSON.parse(tagCreatorsStr) : [];
      body.is_public = formData.get('is_public') as string;
    } else {
      // Handle JSON for non-file updates
      body = await request.json();
    }
    
    // First, get the media item to check permissions
    const { data: existingMedia, error: fetchError } = await (supabase as any)
      .from('media_items')
      .select(`
        *,
        models:model_id (
          user_id,
          agency_id
        )
      `)
      .eq('id', id)
      .single();    if (fetchError || !existingMedia) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    // Check if user has access (owns the model or is the agency)
    const model = (existingMedia as any).models;
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this media item' 
      }, { status: 403 });
    }

    // Prepare update data (exclude fields that shouldn't be updated)
    const updateData: Record<string, any> = {};
    
    if (body.caption !== undefined) updateData.caption = body.caption?.trim() || null;
    if (body.category !== undefined) {
      const trimmedCategory = body.category?.trim();
      if (trimmedCategory) {
        updateData.category = trimmedCategory;
      }
    }
    if (body.hashtags !== undefined) {
      updateData.hashtags = Array.isArray(body.hashtags) 
        ? body.hashtags 
        : (typeof body.hashtags === 'string' ? JSON.parse(body.hashtags) : []);
    }
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.tag_creators !== undefined) {
      updateData.tag_creators = Array.isArray(body.tag_creators) 
        ? body.tag_creators 
        : JSON.parse(body.tag_creators || '[]');
    }
    if (body.is_public !== undefined) {
      updateData.is_public = body.is_public === 'true' || body.is_public === true;
    }

    // Handle file upload if a new image is provided
    if (newImageFile) {
      // Validate file type before upload
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/avi'];
      if (!allowedTypes.includes(newImageFile.type)) {
        return NextResponse.json({ 
          error: `File type '${newImageFile.type}' is not supported. Allowed types: ${allowedTypes.join(', ')}` 
        }, { status: 400 });
      }

      try {
        // Generate unique filename
        const fileExt = newImageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `media-uploads/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media-uploads')
          .upload(filePath, newImageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media-uploads')
          .getPublicUrl(filePath);

        updateData.file_url = publicUrl;
        updateData.thumbnail_url = publicUrl; // For now, use same URL for thumbnail
        updateData.file_name = newImageFile.name;
        updateData.file_size = newImageFile.size;
        updateData.file_type = newImageFile.type;

      } catch (fileError) {
        console.error('File upload error:', fileError);
        return NextResponse.json({ error: 'Failed to process image upload' }, { status: 500 });
      }
    }

    // Update the media item
    const { data: mediaItem, error } = await (supabase as any)
      .from('media_items')
      .update(updateData)
      .eq('id', id)
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
      console.error('Error updating media item:', error);
      return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: mediaItem,
      message: 'Media item updated successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/media/[id] - Delete a specific media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // First, get the media item to check permissions
    const { data: existingMedia, error: fetchError } = await (supabase as any)
      .from('media_items')
      .select(`
        *,
        models:model_id (
          user_id,
          agency_id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existingMedia) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    // Check if user has access (owns the model or is the agency)
    const model = (existingMedia as any).models;
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this media item' 
      }, { status: 403 });
    }

    // TODO: Delete the actual file from Supabase Storage
    // const fileUrl = (existingMedia as any).file_url;
    // await supabase.storage.from('media-uploads').remove([fileUrl]);

    // Delete the media item
    const { error } = await (supabase as any)
      .from('media_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting media item:', error);
      return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Media item deleted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

