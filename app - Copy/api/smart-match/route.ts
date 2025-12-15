import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/smart-match - Get smart match suggestions for a model
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get model_id from query params
    const { searchParams } = new URL(request.url);
    let modelId = searchParams.get('model_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!modelId) {
      return NextResponse.json({ 
        error: 'Missing required parameter',
        details: 'model_id is required' 
      }, { status: 400 });
    }

    // For creators, if the modelId is their user ID, find their actual model
    // Otherwise, use the provided modelId as-is (for agency)
    let model: any = null;
    let modelError: any = null;

    // First, try to find model by exact ID match
    const { data: modelByIdResult, error: modelByIdError } = await (supabase as any)
      .from('models')
      .select('*')
      .eq('id', modelId)
      .single();

    if (!modelByIdError && modelByIdResult) {
      // Model found by ID
      model = modelByIdResult;
      modelError = null;
    } else if (modelByIdError && modelByIdError.code === 'PGRST116') {
      // No model with this ID - it might be a user ID for a creator
      // Try to find model by user_id
      const { data: modelByUserResult, error: modelByUserError } = await (supabase as any)
        .from('models')
        .select('*')
        .eq('user_id', modelId)
        .single();

      if (!modelByUserError && modelByUserResult) {
        model = modelByUserResult;
        modelError = null;
      } else {
        model = null;
        modelError = modelByUserError || { message: 'Model not found for this creator' };
      }
    } else {
      model = modelByIdResult;
      modelError = modelByIdError;
    }

    if (modelError || !model) {
      return NextResponse.json({ 
        error: 'Model not found or access denied' 
      }, { status: 404 });
    }

    // Get user's fan count from onlyfans_profiles table (not models table)
    const { data: userProfile, error: userProfileError } = await (supabase as any)
      .from('onlyfans_profiles')
      .select('*')
      .eq('user_id', model.user_id)
      .single();

    if (userProfileError || !userProfile) {
      return NextResponse.json({ 
        error: 'User profile not found in onlyfans_profiles',
        details: 'Please sync your OnlyFans profile first'
      }, { status: 404 });
    }

    // Get fan count from onlyfans_profiles
    const userFans = userProfile.fans || userProfile.fan_count || 0;

    if (!userFans && userFans !== 0) {
      return NextResponse.json({ 
        error: 'User profile does not have fan count data',
        details: 'fan_count is required to find smart matches'
      }, { status: 400 });
    }

    // Check if user owns the model or is the agency
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to view matches for this model' 
      }, { status: 403 });
    }

    // Get SFS settings for this model to understand preferences
    const { data: sfsSettings } = await (supabase as any)
      .from('sfs_settings')
      .select('*')
      .eq('model_id', modelId)
      .single();

    // First, get ALL profiles to see what exists
    // NOTE: RLS policy allows public read access to onlyfans_profiles for Smart Match feature
    const { data: allProfilesData, error: allProfilesError } = await (supabase as any)
      .from('onlyfans_profiles')
      .select('*');

    const matchError = allProfilesError;

    if (matchError) {
      return NextResponse.json({ error: 'Failed to fetch profiles', details: matchError.message }, { status: 500 });
    }

    // Get ALL profiles excluding the user's own profile
    let potentialMatches = (allProfilesData || [])
      .filter((profile: any) => {
        return profile.user_id !== model.user_id;
      })
      .map((profile: any) => {
        // Ensure profile has fans data
        const fans = profile.fans || profile.fan_count || 0;
        return { ...profile, fans };
      });

    if (!potentialMatches || potentialMatches.length === 0) {
      return NextResponse.json({ 
        success: true,
        data: [],
        count: 0,
        model: {
          id: model.id,
          name: userProfile.display_name || userProfile.username,
          username: userProfile.username,
          fan_count: userFans,
          source: 'onlyfans_profiles'
        },
        filter: {
          description: `No profiles found. Make sure verified profiles exist in the onlyfans_profiles table (excluding your own).`,
          your_fans: userFans,
          diagnostic: 'No matching profiles found in onlyfans_profiles table'
        }
      });
    }

    // Calculate match scores with better prioritization
    const matchesWithScores = await Promise.all(
      (potentialMatches || []).map(async (match: any) => {
        // Get fan count from onlyfans_profiles - might be in different column names
        const matchFans = match.fans || match.fan_count || 0;
        
        // Check if user already sent a pending request to this profile
        const { data: existingRequest } = await (supabase as any)
          .from('sfs_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('onlyfans_profile_id', match.id)
          .eq('status', 'pending')
          .single();

        const alreadyRequested = !!existingRequest;
        
        // NEW LOGIC: If receiver fans >= sender fans, show 100% match
        // Otherwise, show the actual compatibility score
        let fanCountScore = 0;
        let compatibility: string;
        
        if (matchFans >= userFans) {
          // Receiver has more or equal fans - 100% match
          fanCountScore = 100;
          compatibility = 'Perfect Match';
        } else {
          // Receiver has fewer fans - calculate score based on difference
          const fanCountDiff = userFans - matchFans;
          fanCountScore = Math.max(0, 100 - (fanCountDiff / Math.max(userFans || 1, matchFans || 1)) * 100);
          
          if (fanCountScore >= 80) {
            compatibility = 'High Match';
          } else if (fanCountScore >= 60) {
            compatibility = 'Good Match';
          } else if (fanCountScore >= 40) {
            compatibility = 'Fair Match';
          } else {
            compatibility = 'Low Match';
          }
        }

        const processedMatch = {
          id: match.id,
          user_id: match.user_id,
          username: match.username,
          display_name: match.display_name,
          profile_pic_url: match.profile_image_url || match.profile_pic_url || match.avatar || null,
          fans: matchFans,
          fan_difference: Math.abs(userFans - matchFans),
          is_verified: match.is_verified !== undefined ? match.is_verified : true,
          created_at: match.created_at,
          updated_at: match.updated_at,
          match_score: Math.round(fanCountScore),
          compatibility: compatibility,
          already_requested: alreadyRequested,
          request_status: alreadyRequested ? 'pending' : null
        };
        
        return processedMatch;
      })
    );

    // Sort by fan count difference first (closest matches), then by fan count
    matchesWithScores.sort((a, b) => {
      if (a.fan_difference !== b.fan_difference) {
        return a.fan_difference - b.fan_difference; // Closer matches first
      }
      return b.fans - a.fans; // More fans for same difference
    });

    // Apply limit after sorting
    const limitedMatches = limit ? matchesWithScores.slice(0, limit) : matchesWithScores;

    const response = { 
      success: true,
      data: limitedMatches,
      count: limitedMatches.length,
      totalAvailable: matchesWithScores.length,
      model: {
        id: model.id,
        name: userProfile.display_name || userProfile.username,
        username: userProfile.username,
        fan_count: userFans,
        source: 'onlyfans_profiles'
      },
      filter: {
        description: `Showing ${limitedMatches.length} of ${matchesWithScores.length} profiles sorted by fan count match (your fans: ${userFans})`,
        your_fans: userFans
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

// POST /api/smart-match - Accept or decline a smart match suggestion
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
    if (!body.sender_id || !body.receiver_id || !body.action) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'sender_id, receiver_id, and action are required' 
      }, { status: 400 });
    }

    // Validate action
    if (!['accept', 'decline'].includes(body.action)) {
      return NextResponse.json({ 
        error: 'Invalid action',
        details: 'Action must be either "accept" or "decline"' 
      }, { status: 400 });
    }

    if (body.action === 'accept') {
      // Create an SFS request from the smart match
      const sfsRequestData = {
        sender_id: body.sender_id,
        receiver_id: body.receiver_id,
        proposed_date: body.proposed_date || null,
        message: body.message || 'Smart match suggestion accepted',
        status: 'pending',
        created_by: user.id
      };

      const { data: sfsRequest, error } = await (supabase as any)
        .from('sfs_requests')
        .insert(sfsRequestData)
        .select(`
          *,
          sender:sender_id (
            id,
            name,
            username,
            display_picture_url,
            fan_count
          ),
          receiver:receiver_id (
            id,
            name,
            username,
            display_picture_url,
            fan_count
          )
        `)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to accept smart match' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        data: sfsRequest,
        message: 'Smart match accepted and SFS request created' 
      }, { status: 201 });
    } else {
      // For decline, just return success (could log this for learning)
      return NextResponse.json({ 
        success: true,
        message: 'Smart match declined' 
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

