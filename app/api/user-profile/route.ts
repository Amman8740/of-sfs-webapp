import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get basic user data from users table
    let { data: userData, error: userDataError } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // If no user data exists in users table, create one
    if (userDataError && userDataError.code === 'PGRST116') {
      console.log('User data not found in users table, creating one...');
      const { data: newUserData, error: createUserError } = await (supabase as any)
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          billing_address: null,
          payment_method: null
        })
        .select()
        .single();

      if (createUserError) {
        console.error('Error creating user data:', createUserError);
        // If we can't create user data due to RLS policy, the user was likely deleted
        if (createUserError.code === '42501') {
          // Clear the session since the user doesn't exist in the database
          await supabase.auth.signOut();
          return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to create user data' }, { status: 500 });
      }

      userData = newUserData;
    } else if (userDataError) {
      console.error('Error fetching user data:', userDataError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Get extended profile data from user_profiles table
    let { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If no profile exists, create one
    if (profileError && profileError.code === 'PGRST116') {
      console.log('User profile not found, creating one...');
      const { data: newProfile, error: createError } = await (supabase as any)
        .from('user_profiles')
        .insert({
          id: user.id,
          user_type: null,
          onboarding_completed: false,
          profile_data: {},
          preferences: {}
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        // If we can't create user profile due to RLS policy, the user was likely deleted
        if (createError.code === '42501') {
          // Clear the session since the user doesn't exist in the database
          await supabase.auth.signOut();
          return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }

      userProfile = newProfile;
    } else if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      user,
      userData,
      userProfile 
    });
  } catch (error) {
    console.error('Error in user-profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Extract full_name if provided - it should be updated in users table, not user_profiles
    const { full_name, ...profileBody } = body;
    
    // Update the user profile
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .update(profileBody)
      .eq('id', user.id)
      .select();
      
    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    // If full_name is provided, also update the users table
    if (full_name) {
      const { error: userError } = await (supabase as any)
        .from('users')
        .update({ full_name })
        .eq('id', user.id);
        
      if (userError) {
        console.error('Error updating user full_name:', userError);
        // Don't fail the entire request if this fails, just log it
      }
    }

    return NextResponse.json({ 
      success: true,
      data: data?.[0] 
    });
  } catch (error) {
    console.error('Error in user-profile PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const profileData = body.profile_data || {};
    if (!profileData.email) {
      profileData.email = user.email;
    }

  
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .upsert({
        id: user.id,
        ...body,
        profile_data: profileData
      })
      .select();
      
    if (error) {
      console.error('Error upserting user profile:', error);
      return NextResponse.json({ error: 'Failed to create/update user profile' }, { status: 500 });
    }

    // If user_type is being set to 'creator', create a corresponding model
    if (body.user_type === 'creator') {
      console.log('User type set to creator, creating model for user:', user.id);
      
      // Check if model already exists
      const { data: existingModel } = await (supabase as any)
        .from('models')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingModel) {
        // Get user data for model creation
        const { data: userData } = await (supabase as any)
          .from('users')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        // Create model record
        const modelData = {
          user_id: user.id,
          name: userData?.full_name || profileData.firstName + ' ' + profileData.lastName || user.email?.split('@')[0] || 'Creator',
          email: user.email,
          username: null,
          display_picture_url: userData?.avatar_url || null,
          onlyfans_link: profileData.onlyFansLink || null,
          telegram_link: null,
          price: 0,
          fan_count: 0,
          payout_percentage: 0,
          subscription_type: 'Free',
          status: 'Active',
          language: profileData.language || 'English',
          timezone: profileData.timezone || 'GMT+5',
          is_verified: false,
          verification_date: null,
          agency_id: null // Creator creates their own model, no agency
        };

        const { data: newModel, error: modelError } = await (supabase as any)
          .from('models')
          .insert(modelData)
          .select()
          .single();

        if (modelError) {
          console.error('Error creating model for creator:', modelError);
          // Don't fail the entire request if model creation fails
          // The user profile was successfully updated
        } else {
          console.log('Model created successfully for creator:', newModel.id);
        }
      } else {
        console.log('Model already exists for creator:', user.id);
      }
    }

    return NextResponse.json({ 
      success: true,
      data: data?.[0] 
    });
  } catch (error) {
    console.error('Error in user-profile POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
