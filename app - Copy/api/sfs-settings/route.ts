import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/sfs-settings - Fetch SFS settings for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: settings, error: settingsError } = await (supabase as any)
      .from('sfs_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      if (settingsError.code === 'PGRST116') {
        // No settings found, return default settings
        console.log('📋 No settings found, returning defaults');
        const response = NextResponse.json({ 
          success: true,
          data: null
        }, { status: 200 });
        // Add cache headers for faster subsequent requests
        response.headers.set('Cache-Control', 'private, max-age=300'); // 5 minutes
        return response;
      }
      console.error('❌ Error fetching SFS settings:', settingsError.message);
      return NextResponse.json({ 
        error: 'Failed to fetch settings',
        details: settingsError.message
      }, { status: 500 });
    }

    console.log('✅ SFS settings fetched successfully');
    const response = NextResponse.json({ success: true, data: settings }, { status: 200 });
    // Add cache headers for faster subsequent requests
    response.headers.set('Cache-Control', 'private, max-age=300'); // 5 minutes
    response.headers.set('Content-Encoding', 'gzip');
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Unexpected error in GET settings:', errorMessage);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
}

// POST /api/sfs-settings - Create or update SFS settings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📨 Received SFS settings data:', body);

    const {
      max_sfs_per_day,
      content_allowed,
      pin_content,
      auto_approve,
      smart_match_enabled,
      posting_times,
      timezone,
      timeSlot1,
      timeSlot2,
      timeSlot3,
      days
    } = body;

    // Prepare the data to save
    const settingsData = {
      user_id: user.id,
      max_sfs_per_day: max_sfs_per_day || 3,
      content_allowed: content_allowed || ['Fully Explicit', 'Topless', 'SFW Only'],
      pin_content: pin_content || 'Accept All',
      auto_approve: auto_approve || false,
      smart_match_enabled: smart_match_enabled || false,
      posting_times: posting_times || {},
      timezone: timezone || 'GMT+5',
      time_slot_1: timeSlot1 || '1:00pm',
      time_slot_2: timeSlot2 || '2:00pm',
      time_slot_3: timeSlot3 || '3:00pm',
      available_days: days || ['Tuesday', 'Saturday', 'Sunday'],
      updated_at: new Date().toISOString()
    };

    // Try to upsert the settings
    const { data: existingSettings, error: fetchError } = await (supabase as any)
      .from('sfs_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    let resultError;

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await (supabase as any)
        .from('sfs_settings')
        .update(settingsData)
        .eq('id', existingSettings.id)
        .select('*')
        .single();
      
      result = data;
      resultError = error;
      console.log('🔄 Updated existing SFS settings');
    } else {
      // Create new settings
      const { data, error } = await (supabase as any)
        .from('sfs_settings')
        .insert(settingsData)
        .select('*')
        .single();
      
      result = data;
      resultError = error;
      console.log('✨ Created new SFS settings');
    }

    if (resultError) {
      console.error('❌ Failed to save SFS settings:', resultError.message);
      console.error('📊 Full error details:', resultError);
      return NextResponse.json({ 
        error: 'Failed to save settings', 
        details: resultError.message,
        code: resultError.code
      }, { status: 500 });
    }

    console.log('✅ SFS settings saved successfully');
    return NextResponse.json({ 
      success: true,
      data: result,
      message: 'SFS settings saved successfully' 
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Unexpected error in POST settings:', errorMessage);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
}

