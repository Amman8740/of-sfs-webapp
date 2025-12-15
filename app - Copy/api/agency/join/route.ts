import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';
/**
 * POST /api/agency/join
 * Creator joins an agency using the agency code
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user (creator)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
console.log('User authenticated:', user);
    // Get user profile to check if they're a creator
    const { data: creatorProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type, id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile query error:', profileError);
      return NextResponse.json({ 
        error: 'Error checking your profile. Please ensure your profile is set up correctly.',
        debug: profileError
      }, { status: 400 });
    }

    if (!creatorProfile) {
      return NextResponse.json({ 
        error: 'Profile not found. Please create a profile first.' 
      }, { status: 404 });
    }

    if (creatorProfile.user_type !== 'creator') {
      return NextResponse.json({ 
        error: `Only creators can join agencies. Your account type is: ${creatorProfile.user_type}. Please create a creator account.`
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Agency code is required' }, { status: 400 });
    }

    const searchCode = code.trim();
    // First try exact match with the code as provided
    const { data: agencies1 } = await (supabase as any)
      .from('user_profiles')
      .select('id, agency_code, user_type')
     .eq('user_type', 'agency')
  .ilike('agency_code', searchCode);

    // Try uppercase
    const { data: agencies2 } = await (supabase as any)
      .from('user_profiles')
      .select('id, agency_code, user_type')
      .eq('agency_code', searchCode.toUpperCase());

    // Try lowercase
    const { data: agencies3 } = await (supabase as any)
      .from('user_profiles')
      .select('id, agency_code, user_type')
      .eq('agency_code', searchCode.toLowerCase());

    // Find any match - prioritize user_type = 'agency'
    let agencies = agencies1?.filter((a: any) => a.user_type === 'agency')?.length 
      ? agencies1?.filter((a: any) => a.user_type === 'agency')
      : agencies2?.filter((a: any) => a.user_type === 'agency')?.length 
      ? agencies2?.filter((a: any) => a.user_type === 'agency')
      : agencies3?.filter((a: any) => a.user_type === 'agency') || [];


    if (!agencies || agencies.length === 0) {
      // Get ALL agencies to show what we have
      const { data: allAgencies } = await (supabase as any)
        .from('user_profiles')
        .select('id, agency_code, user_type, email')
        .eq('user_type', 'agency');

      console.error('❌ No agency found. All agencies in database:', allAgencies);

      // If NO agencies have codes at all, suggest running the fix
      const agenciesWithCodes = allAgencies?.filter((a: any) => a.agency_code)?.length || 0;

      return NextResponse.json({ 
        error: 'Invalid agency code - No agency found with this code',
        debug: {
          searched: searchCode,
          availableAgencyCodes: allAgencies?.map((a: any) => ({
            code: a.agency_code || '(none)',
            email: a.email
          })) || [],
          totalAgencies: allAgencies?.length || 0,
          agenciesWithCodes: agenciesWithCodes,
          suggestion: agenciesWithCodes === 0 
            ? 'No agencies have codes yet. Run GET /api/fix/generate-agency-codes to generate them.'
            : 'Please check the available codes above and try again.'
        }
      }, { status: 404 });
    }

    const agencyProfile = agencies[0]; // Take first match

    if (agencies.length > 1) {
      console.warn(`Warning: Multiple agencies found with code ${searchCode}`);
    }

    // Verify the code matches (agency_code might be stored as-is or uppercase)
    const matchesCode = agencyProfile.agency_code === searchCode || 
                        agencyProfile.agency_code === searchCode.toUpperCase() ||
                        agencyProfile.agency_code === searchCode.toLowerCase();
    
    if (!matchesCode) {
      return NextResponse.json({ 
        error: 'Invalid agency code - Code does not match' 
      }, { status: 404 });
    }

    const agencyId = agencyProfile.id;

    // Fetch creator info from both users and user_profiles tables
    const { data: creatorUserData } = await (supabase as any)
      .from('users')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    const { data: creatorProfileData } = await (supabase as any)
      .from('user_profiles')
      .select('profile_data')
      .eq('id', user.id)
      .single();

    // Extract creator info from profile_data (firstName, lastName, username, etc.)
    const profileData = creatorProfileData?.profile_data || {};
    const creatorName = creatorUserData?.full_name || 
                       `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 
                       user.user_metadata?.full_name || '';
   
    
    // Check if creator already has any join request (approved or pending)
    const { data: existingRequests } = await (supabase as any)
      .from('agency_join_requests')
      .select('id, status')
      .eq('creator_id', user.id);

    const supabaseAdmin = createServiceRoleClient();
    let joinRequest;
    let joinError;

    // Prepare base join request data
    const baseJoinData = {
      agency_id: agencyId,
      creator_id: user.id,
      agency_code: code.toUpperCase(),
      status: 'pending'
    };

    // Prepare creator info for storage (optional - only if columns exist)
    const creatorInfo = {
      creator_name: creatorName,
      creator_email: user.email || '',
      creator_username: profileData.username || '',
      creator_avatar_url: creatorUserData?.avatar_url || user.user_metadata?.avatar_url || ''
    };

    if (existingRequests && existingRequests.length > 0) {
      // Update the first existing request to the new agency
      const existingId = existingRequests[0].id;
      const updateData = {
        ...baseJoinData,
        created_at: new Date().toISOString(),
        ...creatorInfo
      };
      
      const { data: updated, error: updateError } = await (supabaseAdmin as any)
        .from('agency_join_requests')
        .update(updateData)
        .eq('id', existingId)
        .select()
        .single();
      
      // If update fails due to missing columns, try without creator info
      if (updateError && updateError.code === 'PGRST204') {
        console.log('Creator info columns not found, updating without them');
        const { data: retried, error: retryError } = await (supabaseAdmin as any)
          .from('agency_join_requests')
          .update({
            agency_id: agencyId,
            agency_code: code.toUpperCase(),
            status: 'pending',
            created_at: new Date().toISOString()
          })
          .eq('id', existingId)
          .select()
          .single();
        joinRequest = retried;
        joinError = retryError;
      } else {
        joinRequest = updated;
        joinError = updateError;
      }
    } else {
      // Create new join request
      const insertData = {
        ...baseJoinData,
        ...creatorInfo
      };
      
      const { data: inserted, error: insertError } = await (supabaseAdmin as any)
        .from('agency_join_requests')
        .insert(insertData)
        .select()
        .single();
      
      // If insert fails due to missing columns, try without creator info
      if (insertError && insertError.code === 'PGRST204') {
        console.log('Creator info columns not found, inserting without them');
        const { data: retried, error: retryError } = await (supabaseAdmin as any)
          .from('agency_join_requests')
          .insert(baseJoinData)
          .select()
          .single();
        joinRequest = retried;
        joinError = retryError;
      } else {
        joinRequest = inserted;
        joinError = insertError;
      }
    }

    if (joinError) {
      if (joinError.code === '23505') {
        return NextResponse.json({ error: 'You are already linked to this agency.' }, { status: 400 });
      }
      console.error('Error creating/updating join request:', joinError);
      return NextResponse.json({ error: 'Failed to create or update join request' }, { status: 500 });
    }

    // Create notification for the agency
    const creatorEmail = user.email || 'Unknown';
    const creatorNameForNotif = creatorName || 'A creator';
    const { error: notifError } = await (supabaseAdmin as any)
      .from('notifications')
      .insert({
        user_id: agencyId,
        type: 'info',
        title: 'New Agency Join Request',
        message: `${creatorNameForNotif} has requested to join your agency`,
        related_entity_id: joinRequest?.id || null,
        related_entity_type: 'agency_join_request',
        is_read: false
      }); 

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Join request sent successfully',
      request: joinRequest
    });

  } catch (error) {
    console.error('Error in POST /api/agency/join:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
