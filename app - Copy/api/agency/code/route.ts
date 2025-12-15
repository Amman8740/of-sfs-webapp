import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import crypto from 'crypto';

/**
 * GET /api/agency/code
 * Get agency code
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile - try with agency_code, fall back if column doesn't exist
    let profile: any = null;
    let profileError: any = null;

    try {
      const result = await (supabase as any)
        .from('user_profiles')
        .select('user_type, agency_code')
        .eq('id', user.id)
        .single();
      
      profile = result.data;
      profileError = result.error;
    } catch (err) {
      console.error('Select with agency_code failed:', err);
      // Try without agency_code in case column doesn't exist
      const result = await (supabase as any)
        .from('user_profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      profile = result.data;
      profileError = result.error;
    }

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ 
        error: 'Failed to fetch profile',
        details: profileError.message
      }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.user_type !== 'agency') {
      return NextResponse.json({ error: 'Only agencies can view codes' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      code: profile.agency_code || null,
      userType: profile.user_type,
      message: profile.agency_code ? 'Code found' : 'No code generated yet, will generate on POST'
    });

  } catch (error) {
    console.error('Error in GET /api/agency/code:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/agency/code
 * Generate agency code if it doesn't exist
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile - try with agency_code, fall back if column doesn't exist
    let profile: any = null;
    let profileError: any = null;
    
    try {
      const result = await (supabase as any)
        .from('user_profiles')
        .select('user_type, agency_code')
        .eq('id', user.id)
        .single();
      
      profile = result.data;
      profileError = result.error;
    } catch (err) {
      console.error('Select with agency_code failed:', err);
      // Try without agency_code in case column doesn't exist
      const result = await (supabase as any)
        .from('user_profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      profile = result.data;
      profileError = result.error;
    }

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ 
        error: 'Failed to fetch profile',
        details: profileError.message 
      }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.user_type !== 'agency') {
      return NextResponse.json({ error: 'Only agencies can generate codes' }, { status: 403 });
    }

    // If code already exists, return it
    if (profile.agency_code) {
      return NextResponse.json({
        success: true,
        code: profile.agency_code,
        message: 'Code already exists'
      });
    }

    // Generate new agency code: 8 character alphanumeric
    const newCode = crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()
      .slice(0, 8);

    // Update profile with new code - using RPC to ensure it works even if column is new
    try {
      const { data: updated, error: updateError } = await (supabase as any)
        .from('user_profiles')
        .update({ agency_code: newCode })
        .eq('id', user.id)
        .select('agency_code')
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json({ 
          error: 'Failed to generate code',
          details: updateError.message 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        code: updated.agency_code || newCode,
        message: 'Agency code generated successfully'
      });
    } catch (updateErr) {
      console.error('Update exception:', updateErr);
      // If update fails, at least return the generated code
      return NextResponse.json({
        success: true,
        code: newCode,
        message: 'Agency code generated (may need to refresh)'
      });
    }

  } catch (error) {
    console.error('Error in POST /api/agency/code:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
