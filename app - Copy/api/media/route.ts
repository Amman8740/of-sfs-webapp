import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { Tables } from '@/types_db';

type MediaItem = Tables<'media_items'>;
type UserProfile = Tables<'user_profiles'>;

// GET /api/media - Fetch media items
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
    const modelId = searchParams.get('model_id');
    const category = searchParams.get('category');
    const fileType = searchParams.get('file_type');

    let query = (supabase as any)
      .from('media_items')
      .select(`
        *,
        models:model_id (
          id,
          name,
          username,
          display_picture_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (modelId) {
      query = query.eq('model_id', modelId);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    const { data: mediaItems, error } = await query;

    if (error) {
      console.error('Error fetching media items:', error);
      return NextResponse.json({ error: 'Failed to fetch media items' }, { status: 500 });
    }

    // No transformation needed - tag_creators already contains creator names
    const transformedMediaItems = mediaItems;

    return NextResponse.json({ 
      success: true,
      data: transformedMediaItems,
      count: transformedMediaItems?.length || 0
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/media - Create a new media item
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.model_id || !body.file_url || !body.file_type) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'model_id, file_url, and file_type are required' 
      }, { status: 400 });
    }

    // Validate file_type
    const validFileTypes = ['image', 'video'];
    if (!validFileTypes.includes(body.file_type)) {
      return NextResponse.json({ 
        error: 'Invalid file_type',
        details: 'file_type must be either "image" or "video"' 
      }, { status: 400 });
    }

    // Verify the model exists and user has access to it
    const { data: model, error: modelError } = await (supabase as any)
      .from('models')
      .select('id, user_id, agency_id')
      .eq('id', body.model_id)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ 
        error: 'Model not found or access denied' 
      }, { status: 404 });
    }

    // Check if user owns the model or is the agency managing it
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to add media for this model' 
      }, { status: 403 });
    }

    // Prepare media item data
    const mediaData = {
      model_id: body.model_id,
      file_url: body.file_url,
      thumbnail_url: body.thumbnail_url || null,
      file_type: body.file_type,
      file_size: body.file_size || null,
      duration: body.duration || null,
      width: body.width || null,
      height: body.height || null,
      category: body.category || null,
      tags: body.tags || [],
      caption: body.caption || null,
      is_public: body.is_public !== undefined ? body.is_public : false,
      uploaded_by: user.id
    };

    // Insert the media item
    const { data: mediaItem, error } = await (supabase as any)
      .from('media_items')
      .insert(mediaData)
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
      console.error('Error creating media item:', error);
      return NextResponse.json({ error: 'Failed to create media item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: mediaItem,
      message: 'Media item created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

