import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

// GET /api/scheduled-sfs/test-rls - Test RLS and show exact error
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseService = await createServiceRoleClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated', auth_error: String(authError) }, { status: 401 });
    }

    console.log('🧪 RLS TEST START for user:', user.id);

    // ============================================
    // TEST 1: Service role count ALL records
    // ============================================
    console.log('\n📊 TEST 1: Service role - count ALL records');
    const { data: allCount } = await (supabaseService as any)
      .from('scheduled_sfs')
      .select('id', { count: 'exact', head: true });
    
    console.log('Result: Total records in scheduled_sfs table:', allCount?.length || 'unknown');

    // ============================================
    // TEST 2: Service role - fetch by agency_id
    // ============================================
    console.log('\n📊 TEST 2: Service role - fetch WHERE agency_id = user.id');
    const { data: serviceByAgency, error: serviceAgencyError } = await (supabaseService as any)
      .from('scheduled_sfs')
      .select('id, agency_id, user_id, scheduled_date, created_at')
      .eq('agency_id', user.id)
      .limit(5);

    console.log('Result:', {
      count: serviceByAgency?.length || 0,
      error: serviceAgencyError?.message,
      sample: serviceByAgency?.[0]
    });

    // ============================================
    // TEST 3: Service role - fetch by user_id
    // ============================================
    console.log('\n📊 TEST 3: Service role - fetch WHERE user_id = user.id');
    const { data: serviceByUser, error: serviceUserError } = await (supabaseService as any)
      .from('scheduled_sfs')
      .select('id, agency_id, user_id, scheduled_date, created_at')
      .eq('user_id', user.id)
      .limit(5);

    console.log('Result:', {
      count: serviceByUser?.length || 0,
      error: serviceUserError?.message,
      sample: serviceByUser?.[0]
    });

    // ============================================
    // TEST 4: Regular client - count ALL
    // ============================================
    console.log('\n📊 TEST 4: Regular client (RLS applied) - count ALL records');
    const { data: regularAll, error: regularAllError } = await (supabase as any)
      .from('scheduled_sfs')
      .select('id', { count: 'exact', head: true });

    console.log('Result:', {
      count: regularAll?.length || 0,
      error: regularAllError?.message,
      errorCode: (regularAllError as any)?.code,
      errorHint: (regularAllError as any)?.hint
    });

    // ============================================
    // TEST 5: Regular client - by agency_id
    // ============================================
    console.log('\n📊 TEST 5: Regular client (RLS applied) - WHERE agency_id = user.id');
    const { data: regularByAgency, error: regularAgencyError } = await (supabase as any)
      .from('scheduled_sfs')
      .select('id, agency_id, user_id, scheduled_date, created_at')
      .eq('agency_id', user.id)
      .limit(5);

    console.log('Result:', {
      count: regularByAgency?.length || 0,
      error: regularAgencyError?.message,
      errorCode: (regularAgencyError as any)?.code,
      errorHint: (regularAgencyError as any)?.hint,
      sample: regularByAgency?.[0]
    });

    // ============================================
    // TEST 6: Regular client - by user_id
    // ============================================
    console.log('\n📊 TEST 6: Regular client (RLS applied) - WHERE user_id = user.id');
    const { data: regularByUser, error: regularUserError } = await (supabase as any)
      .from('scheduled_sfs')
      .select('id, agency_id, user_id, scheduled_date, created_at')
      .eq('user_id', user.id)
      .limit(5);

    console.log('Result:', {
      count: regularByUser?.length || 0,
      error: regularUserError?.message,
      errorCode: (regularUserError as any)?.code,
      errorHint: (regularUserError as any)?.hint,
      sample: regularByUser?.[0]
    });

    // ============================================
    // TEST 7: Check user profile type
    // ============================================
    console.log('\n📊 TEST 7: User profile');
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('id, user_type')
      .eq('id', user.id)
      .single();

    console.log('Result:', profile);

    // ============================================
    // ANALYSIS
    // ============================================
    console.log('\n\n📋 ANALYSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalRecords = serviceByAgency?.length === undefined ? '?' : (serviceByAgency?.length || 0) + (serviceByUser?.length || 0);
    const authRecordsByAgency = regularByAgency?.length || 0;
    const authRecordsByUser = regularByUser?.length || 0;

    console.log(`Total records (service role): ${totalRecords}`);
    console.log(`Auth records by agency_id: ${authRecordsByAgency}`);
    console.log(`Auth records by user_id: ${authRecordsByUser}`);
    console.log(`User profile type: ${profile?.user_type}`);

    if (totalRecords === 0 || totalRecords === '0') {
      console.log('\n⚠️ NO RECORDS EXIST - This is a data issue, not RLS');
      console.log('Check if you\'re actually creating and saving SFS records');
    } else if (regularAllError) {
      console.log('\n❌ RLS IS BLOCKING ACCESS - Regular client can\'t read ANY records');
      console.log(`Error: ${regularAllError.message}`);
    } else if (authRecordsByAgency === 0 && authRecordsByUser === 0) {
      console.log('\n⚠️ RLS POLICIES EXCLUDE YOUR RECORDS');
      console.log('Service role sees records, but RLS policies don\'t allow you to see them');
      console.log('Need to update RLS policies');
    } else {
      console.log('\n✅ RLS IS WORKING - You can see your records!');
    }

    // Return structured response
    return NextResponse.json({
      user_id: user.id,
      user_type: profile?.user_type,
      tests: {
        service_role_by_agency: {
          count: serviceByAgency?.length || 0,
          error: serviceAgencyError?.message
        },
        service_role_by_user: {
          count: serviceByUser?.length || 0,
          error: serviceUserError?.message
        },
        auth_by_agency: {
          count: regularByAgency?.length || 0,
          error: regularAgencyError?.message,
          code: (regularAgencyError as any)?.code
        },
        auth_by_user: {
          count: regularByUser?.length || 0,
          error: regularUserError?.message,
          code: (regularUserError as any)?.code
        }
      },
      diagnosis: {
        hasData: (serviceByAgency?.length || 0) + (serviceByUser?.length || 0) > 0,
        rls_blocks_all: !!regularAllError,
        rls_blocks_your_records: (regularByAgency?.length || 0) + (regularByUser?.length || 0) === 0 && 
                                  ((serviceByAgency?.length || 0) + (serviceByUser?.length || 0) > 0)
      }
    });

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
