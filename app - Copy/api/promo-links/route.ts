import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/promo-links - Fetch promo links
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 });
    }

    // Get model_id from query params (optional)
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('model_id');

    let query = (supabase as any)
      .from('promo_links')
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

    // If model_id is provided, filter by it
    if (modelId) {
      query = query.eq('model_id', modelId);
    }    const { data: promoLinks, error } = await query;

    if (error) {
      console.error('Error fetching promo links:', error);
      return NextResponse.json({ error: 'Failed to fetch promo links' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: promoLinks,
      count: promoLinks?.length || 0
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// POST /api/promo-links - Create a new promo link
// POST /api/promo-links - Create a new promo link
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { model_id, promoName, url, description, platform } = body;

    if (!model_id || !promoName || !url) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "model_id, promoName, url are required",
        },
        { status: 400 }
      );
    }

    // Validate model belongs to agency
    const { data: model, error: modelErr } = await (supabase as any)
      .from("models")
      .select("id, name, agency_id")
      .eq("id", model_id)
      .single();

    if (modelErr || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    if (model.agency_id !== user.id) {
      return NextResponse.json(
        { error: "You do not own this model" },
        { status: 403 }
      );
    }

    // Generate short code
    const short_code = Math.random().toString(36).substring(2, 8);

    // Insert
    const { data: promo, error: insertErr } = await (supabase as any)
      .from("promo_links")
      .insert({
        user_id: user.id,
        model_id,
        promo_name: promoName,
        url,
        description,
        platform,
        short_code,
        source: "agency_generated",
        status: "Active",
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert Error:", insertErr);
      return NextResponse.json(
        { error: "Insert failed", details: insertErr },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: promo,
        message: "Promo link created successfully",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}