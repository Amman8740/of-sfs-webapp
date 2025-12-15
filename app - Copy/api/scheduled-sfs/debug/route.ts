import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

// GET /api/scheduled-sfs/debug - Debug endpoint to check database and RLS issues
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseService = await createServiceRoleClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        auth_error: authError?.message 
      }, { status: 401 });
    }

    console.log('🔍 DEBUG: Starting diagnostic for user:', user.id);

    // 1. Check user profile
    console.log('Step 1: Checking user profile...');
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_type, agency_id')
      .eq('id', user.id)
      .single();

    console.log('User profile result:', { data: userProfile, error: profileError?.message });

    // 2. Try to fetch ALL scheduled_sfs with regular client (should fail if RLS blocking)
    console.log('Step 2: Fetching scheduled_sfs with regular client...');
    const { data: allSFS, error: allError } = await (supabase as any)
      .from('scheduled_sfs')
      .select('count');

    console.log('All SFS count result:', { count: (allSFS as any)?.[0]?.count, error: allError?.message });

    // 3. Try to fetch scheduled_sfs for current user with regular client
    console.log('Step 3: Fetching scheduled_sfs WHERE agency_id = current user with regular client...');
    const { data: userSFS, error: userError } = await (supabase as any)
      .from('scheduled_sfs')
      .select('id, agency_id, user_id, scheduled_date')
      .eq('agency_id', user.id);

    console.log('User SFS result:', { count: userSFS?.length || 0, error: userError?.message, data: userSFS });

    // 4. Try with service role (bypass RLS)
    console.log('Step 4: Fetching scheduled_sfs with service role (bypasses RLS)...');
    const { data: serviceSFS, error: serviceError } = await (supabaseService as any)
      .from('scheduled_sfs')
      .select('id, agency_id, user_id, scheduled_date')
      .eq('agency_id', user.id);

    console.log('Service role SFS result:', { count: serviceSFS?.length || 0, error: serviceError?.message, data: serviceSFS });

    // 5. Check scheduled_sfs table structure
    console.log('Step 5: Checking table structure...');
    const { data: tableInfo, error: tableError } = await (supabaseService as any)
      .from('scheduled_sfs')
      .select('*')
      .limit(1);

    const columns = tableInfo?.[0] ? Object.keys(tableInfo[0]) : [];
    console.log('Table columns:', columns);

    // 6. Check if there are ANY records at all
    console.log('Step 6: Counting total records in table...');
    const { data: totalCount } = await (supabaseService as any)
      .from('scheduled_sfs')
      .select('count', { count: 'exact', head: true });

    // 7. Check for records with agency_id
    console.log('Step 7: Counting records WITH agency_id...');
    const { data: agencyCount } = await (supabaseService as any)
      .from('scheduled_sfs')
      .select('count', { count: 'exact', head: true })
      .not('agency_id', 'is', null);

    // 8. Check RLS policies
    console.log('Step 8: Checking RLS policies on scheduled_sfs...');
    const { data: policies, error: policiesError } = await (supabaseService as any)
      .from('information_schema.schemata')
      .select('*')
      .eq('schema_name', 'public');

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: user.id,
          email: user.email
        },
        userProfile: {
          data: userProfile,
          error: profileError?.message
        },
        totalRecordsInTable: 'Check server logs',
        recordsWithAgencyId: 'Check server logs',
        regularClientResults: {
          userSFSCount: userSFS?.length || 0,
          error: userError?.message,
          sample: userSFS?.[0]
        },
        serviceRoleResults: {
          userSFSCount: serviceSFS?.length || 0,
          error: serviceError?.message,
          sample: serviceSFS?.[0]
        },
        message: 'Check server console for detailed logs starting with "🔍 DEBUG"'
      }
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint error',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
