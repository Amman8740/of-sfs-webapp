import { NextRequest, NextResponse } from 'next/server';
import { createClient, createUserWithAdminAPI, createServiceRoleClient } from '@/lib/utils/supabase/server';
import { ModelFormData } from '@/components/features/models';
import { sendModelCreationEmail } from '@/lib/utils/mail/sendMail';

// GET /api/models - Fetch models for current user/agency
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    console.log('📥 Models API Called - all param:', all);

    // For fetching ALL models, use a direct approach
    if (all === 'true') {
      console.log('🚀 Fetching ALL models - using service role');
      const supabase = await createServiceRoleClient();
      
      // Simple direct query with no filters
      const { data: models, error, count } = await (supabase as any)
        .from('models')
        .select('*', { count: 'exact' });

      console.log('📤 ALL Models Query Result:', {
        count: models?.length,
        totalCount: count,
        error: error?.message,
        sample: models?.[0]
      });

      if (error) {
        console.error('❌ Error fetching all models:', error);
        return NextResponse.json({ 
          error: 'Failed to fetch models', 
          details: error.message 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: models || [],
        count: models?.length || 0
      });
    }

    // Original logic for filtered requests
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    console.log('📥 Models API - Filtered Request:', { limit, offset, status, search });

    // Get user's profile
    const { data: userProfile } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    let query = (supabase as any)
      .from('models')
      .select('*');

    // Apply user filters
    if (userProfile?.user_type === 'creator') {
      console.log('📊 Filtering models for CREATOR:', { user_id: user.id });
      query = query.eq('user_id', user.id);
    } else if (userProfile?.user_type === 'agency') {
      console.log('📊 Filtering models for AGENCY:', { agency_id: user.id });
      // For agencies: only get models where agency_id matches the agency's user_id
      query = query.eq('agency_id', user.id);
    } else {
      console.log('📊 Filtering models for OTHER (no agency_id)');
      query = query.is('agency_id', null);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: models, error } = await query;

    console.log('📤 Filtered Models Response:', { count: models?.length || 0 });

    if (error) {
      console.error('❌ Error fetching models:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch models', 
        details: error.message 
      }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = (supabase as any)
      .from('models')
      .select('id', { count: 'exact' });

    if (userProfile?.user_type === 'agency') {
      // For agencies: only count models where agency_id matches the agency's user_id
      countQuery = countQuery.eq('agency_id', user.id);
    } else if (userProfile?.user_type === 'creator') {
      countQuery = countQuery.eq('user_id', user.id);
    } else {
      countQuery = countQuery.is('agency_id', null);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: models || [],
      count: count || 0,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/models - Create a new model
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    const body: ModelFormData = await request.json();
    console.log('Request body:', body);

    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const { data: existingModel } = await (supabase as any)
      .from('models')
      .select('id')
      .eq('email', body.email)
      .maybeSingle();

    if (existingModel) {
      return NextResponse.json({ 
        error: 'Model with this email already exists' 
      }, { status: 409 });
    }

    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // Generate a random password for the new creator
    const generatedPassword = Math.random().toString(36).slice(-8);

    // Create a new user in Supabase Auth using REST API
    console.log('Creating user via Supabase REST API...');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    let newUserId: string;
    try {
      console.log('Attempting to create user with email:', body.email);
      
      const { data: signUpData, error: signUpError } = await createUserWithAdminAPI(
        body.email,
        generatedPassword,
        {
          full_name: body.name,
          role: 'creator'
        }
      );

      if (signUpError) {
        console.error('Error creating user in auth:', signUpError);
        return NextResponse.json({ error: 'Failed to create user in auth', details: String(signUpError) }, { status: 500 });
      }
      
      console.log('User created successfully:', signUpData?.user?.id);

      newUserId = signUpData?.user?.id || '';
      if (!newUserId) {
        return NextResponse.json({ error: 'User ID not returned from auth' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error in user creation:', error);
      return NextResponse.json({ error: 'Failed to create user', details: String(error) }, { status: 500 });
    }

    // Create user profile and link to agency
    // Use service role client to bypass RLS policies
    const supabaseAdmin = createServiceRoleClient();
    const { data: userProfileInsert, error: profileInsertError } = await (supabaseAdmin as any)
      .from('user_profiles')
      .insert({
        id: newUserId,
        user_type: 'creator',
        onboarding_completed: false,
        agency_id: user.id,
        profile_data: {
          full_name: body.name,
          email: body.email
        }
      })
      .select()
      .single();

    if (profileInsertError) {
      console.error('Error creating user profile:', profileInsertError);
      return NextResponse.json({ error: 'Failed to create user profile', details: profileInsertError }, { status: 500 });
    }

    // Create the model and link to user profile and agency
    const modelData = {
      name: body.name,
      email: body.email,
      display_picture_url: body.displayPictureUrl || null,
      onlyfans_link: body.onlyfansLink || null,
      telegram_link: body.telegramLink || null,
      username: body.username || null,
      price: body.price || 0,
      fan_count: body.fanCount || 0,
      payout_percentage: body.payoutPercentage || 0,
      subscription_type: body.subscriptionType || 'Paid',
      status: body.status || 'Active',
      language: body.language || 'English',
      timezone: body.timezone || 'GMT+5',
      is_verified: body.isVerified || false,
      verification_date: body.isVerified ? new Date().toISOString() : null,
      user_id: newUserId,
      agency_id: user.id
    };

    console.log('Inserting model data:', modelData);

    const { data: model, error } = await (supabaseAdmin as any)
      .from('models')
      .insert(modelData)
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
        user_id,
        created_at
      `)
      .single();

    if (error) {
      console.error('Error creating model:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to create model',
        details: error
      }, { status: 500 });
    }

    let emailSent = false;
    try {

      
      // Try sending with NodeMailer (with timeout handling)
      try {
        await sendModelCreationEmail({
          to: body.email,
          fullName: body.name,
          email: body.email,
          password: generatedPassword
        });
        console.log('✅ Credentials email sent successfully via SMTP');
        emailSent = true;
      } catch (smtpError) {
        console.warn('⚠️ SMTP sending failed, attempting Supabase invitation as fallback...');
        
        // Fallback to Supabase invitation
        try {
          const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(body.email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ofassist.com'}/auth/callback`
          });
          
          if (!inviteError) {
            console.log('Invitation email sent via Supabase');
            emailSent = true;
          } else {
            console.log('ℹSupabase invitation also failed - user can use password reset');
          }
        } catch (supabaseError) {
          console.error(' Supabase fallback also failed:', supabaseError);
        }
      }
    } catch (error) {
      console.error('❌ Error in email sending:', error);
      // Don't fail the request - user creation succeeded
    }

    return NextResponse.json({
      success: true,
      data: model,
      message: emailSent 
        ? 'Model and user profile created successfully. Credentials sent to email.' 
        : 'Model and user profile created successfully. User can use password reset to access account.',
      emailSent
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/models:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error
    }, { status: 500 });
  }
}
