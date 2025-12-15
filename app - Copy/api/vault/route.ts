import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { Tables } from '@/types_db';

type VaultItem = {
  id?: string;
  user_id?: string;
  model_id: string;
  file_url: string;
  file_name?: string;
  file_type: 'image' | 'video';
  file_size?: number;
  thumbnail_url?: string;
  caption?: string;
  category?: string;
  tag_creators?: string[];
  hashtags?: string[];
  notes?: string;
  status?: 'draft' | 'scheduled' | 'posted' | 'archived';
};

// GET /api/vault - Fetch vault items
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
    const userId = searchParams.get('user_id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = (supabase as any)
      .from('vault')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by user_id if provided (for viewing model's vault), otherwise use current user
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('user_id', user.id);
    }

    // Apply filters
    if (modelId) {
      query = query.eq('model_id', modelId);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: vaultItems, error } = await query;

    if (error) {
      console.error('Error fetching vault items:', error);
      return NextResponse.json({ error: 'Failed to fetch vault items' }, { status: 500 });
    }

    // Ensure vaultItems is an array
    const items = vaultItems || [];

    // Fetch user profiles for all unique model_ids (owner IDs)
    const ownerIdsSet = new Set<string>();
    items.forEach((item: any) => {
      if (item.model_id) {
        ownerIdsSet.add(item.model_id);
      }
    });
    const ownerIds = Array.from(ownerIdsSet);
    let ownerProfiles: any = {};

    if (ownerIds.length > 0) {
      const { data: profiles, error: profileError } = await (supabase as any)
        .from('user_profiles')
        .select('id, profile_data')
        .in('id', ownerIds);

      if (!profileError && profiles) {
        ownerProfiles = profiles.reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    }

    // Enrich vault items with owner profile data
    const enrichedItems = items.map((item: any) => ({
      ...item,
      owner_profile: ownerProfiles[item.model_id] || null
    }));

    return NextResponse.json({ 
      success: true,
      data: enrichedItems,
      count: enrichedItems.length
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vault - Create a new vault item
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
    if (!body.file_url || !body.file_type) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'file_url and file_type are required' 
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

    // Prepare vault item
    const vaultItem = {
      user_id: user.id,
      model_id: body.model_id || null,
      file_url: body.file_url,
      file_name: body.file_name || null,
      file_type: body.file_type,
      file_size: body.file_size || null,
      thumbnail_url: body.thumbnail_url || null,
      caption: body.caption || null,
      category: body.category || null,
      tag_creators: Array.isArray(body.tag_creators) ? body.tag_creators : [],
      hashtags: Array.isArray(body.hashtags) ? body.hashtags : [],
      notes: body.notes || null,
      status: body.status || 'draft'
    };

    // Insert into vault table
    const { data: createdVaultItem, error: insertError } = await (supabase as any)
      .from('vault')
      .insert([vaultItem])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating vault item:', insertError);
      return NextResponse.json({ error: 'Failed to create vault item' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: createdVaultItem,
      message: 'Vault item created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
