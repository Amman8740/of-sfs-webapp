import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

interface SFSRulesData {
  maxSfsPerDay: number;
  contentAllowed: string[];
  pinContent: string;
  massDM: boolean;
  fanCount: string;
  contentType: string;
}

// Default SFS rules for new users
const DEFAULT_SFS_RULES: SFSRulesData = {
  maxSfsPerDay: 3,
  contentAllowed: ['Fully Explicit', 'Topless', 'SFW Only'],
  pinContent: 'Accept All',
  massDM: false,
  fanCount: '80%',
  contentType: 'Topless'
};

// GET /api/sfs-rules - Fetch SFS rules for a model
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('model_id');
    const userId = searchParams.get('user_id');

    if (!modelId && !userId) {
      return NextResponse.json({ 
        error: 'Either model_id or user_id is required' 
      }, { status: 400 });
    }

    // Fetch rules from database
    let query = (supabase as any)
      .from('sfs_rules')
      .select('*');

    if (userId) {
      // If user_id provided, filter by user_id first
      query = query.eq('user_id', userId);
    } else {
      // Otherwise use model_id
      query = query.eq('model_id', modelId);
    }

    const { data: rules, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching SFS rules:', error);
      return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
    }

    // If no rules found, return defaults
    if (!rules) {
      const defaultModel = modelId || userId;
      console.log('No rules found, returning defaults for:', defaultModel);
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          model_id: modelId,
          user_id: userId,
          maxSfsPerDay: DEFAULT_SFS_RULES.maxSfsPerDay,
          contentAllowed: DEFAULT_SFS_RULES.contentAllowed,
          pinContent: DEFAULT_SFS_RULES.pinContent,
          massDM: DEFAULT_SFS_RULES.massDM,
          fanCount: DEFAULT_SFS_RULES.fanCount,
          contentType: DEFAULT_SFS_RULES.contentType,
          isDefault: true
        }
      });
    }

    // Transform database fields to camelCase
    return NextResponse.json({
      success: true,
      data: {
        id: rules.id,
        model_id: rules.model_id,
        user_id: rules.user_id,
        maxSfsPerDay: rules.max_sfs_per_day,
        contentAllowed: rules.content_allowed,
        pinContent: rules.pin_content,
        massDM: rules.mass_dm,
        fanCount: rules.fan_count,
        contentType: rules.content_type,
        isDefault: false
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/sfs-rules - Update SFS rules for a model
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { modelId, maxSfsPerDay, contentAllowed, pinContent, massDM, fanCount, contentType } = body;

    if (!modelId) {
      return NextResponse.json({ 
        error: 'modelId is required' 
      }, { status: 400 });
    }

    // Verify user has access to this model
    const { data: model, error: modelError } = await (supabase as any)
      .from('models')
      .select('id, user_id, agency_id')
      .eq('id', modelId)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ 
        error: 'Model not found' 
      }, { status: 404 });
    }

    // Check if user owns the model or is the agency managing it
    if (model.user_id !== user.id && model.agency_id !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to update rules for this model' 
      }, { status: 403 });
    }

    // Check if rules exist for this model
    const { data: existingRules, error: checkError } = await (supabase as any)
      .from('sfs_rules')
      .select('id')
      .eq('model_id', modelId)
      .single();

    let result;
    let resultError;

    if (!existingRules) {
      // Create new rules
      const { data, error } = await (supabase as any)
        .from('sfs_rules')
        .insert({
          model_id: modelId,
          user_id: user.id,
          max_sfs_per_day: maxSfsPerDay,
          content_allowed: contentAllowed,
          pin_content: pinContent,
          mass_dm: massDM,
          fan_count: fanCount,
          content_type: contentType
        })
        .select('*')
        .single();

      result = data;
      resultError = error;
    } else {
      // Update existing rules
      const { data, error } = await (supabase as any)
        .from('sfs_rules')
        .update({
          max_sfs_per_day: maxSfsPerDay,
          content_allowed: contentAllowed,
          pin_content: pinContent,
          mass_dm: massDM,
          fan_count: fanCount,
          content_type: contentType
        })
        .eq('model_id', modelId)
        .select('*')
        .single();

      result = data;
      resultError = error;
    }

    if (resultError) {
      console.error('Error saving SFS rules:', resultError);
      return NextResponse.json({ 
        error: 'Failed to save rules',
        details: resultError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        model_id: result.model_id,
        maxSfsPerDay: result.max_sfs_per_day,
        contentAllowed: result.content_allowed,
        pinContent: result.pin_content,
        massDM: result.mass_dm,
        fanCount: result.fan_count,
        contentType: result.content_type
      },
      message: 'SFS rules updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
