import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

/**
 * POST /api/agency/remove-creator
 * Agency removes a creator from their agency
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Get the current user (agency)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check if they're an agency
    const { data: agencyProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !agencyProfile || agencyProfile.user_type !== 'agency') {
      return NextResponse.json({
        error: 'Only agencies can remove creators'
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }

    console.log('Removing creator:', { creatorId, agencyId: user.id });

    // Verify the creator is linked to this agency
    const { data: creatorProfile, error: creatorError } = await (supabaseAdmin as any)
      .from('user_profiles')
      .select('id, profile_data')
      .eq('id', creatorId)
      .eq('agency_id', user.id)
      .eq('user_type', 'creator')
      .single();

    if (creatorError || !creatorProfile) {
      console.error('Creator not found or not linked to this agency:', creatorError);
      return NextResponse.json({
        error: 'Creator not found or not linked to your agency'
      }, { status: 404 });
    }

    // Remove agency_id from user_profiles table
    const { error: updateProfileError } = await (supabaseAdmin as any)
      .from('user_profiles')
      .update({ agency_id: null })
      .eq('id', creatorId);

    if (updateProfileError) {
      console.error('Error updating creator profile:', updateProfileError);
      return NextResponse.json({ error: 'Failed to remove creator from agency' }, { status: 500 });
    }

    // Remove any pending join requests for this creator from this agency
    const { error: deleteRequestError } = await (supabaseAdmin as any)
      .from('agency_join_requests')
      .delete()
      .eq('creator_id', creatorId)
      .eq('agency_id', user.id);

    if (deleteRequestError) {
      console.error('Error removing join requests:', deleteRequestError);
    }

    // Remove agency_id from models table for this creator
    const { error: updateModelError } = await (supabaseAdmin as any)
      .from('models')
      .update({ agency_id: null })
      .eq('user_id', creatorId);

    if (updateModelError) {
      console.error('Error updating creator model:', updateModelError);
    }

    // Create notification for the creator
    const creatorName = creatorProfile.profile_data?.full_name || 'Creator';
    const { error: notifError } = await (supabaseAdmin as any)
      .from('notifications')
      .insert({
        user_id: creatorId,
        type: 'warning',
        title: 'Removed from Agency',
        message: 'You have been removed from the agency.',
        related_entity_id: user.id,
        related_entity_type: 'agency_removal',
        is_read: false
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Creator removed from agency successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/agency/remove-creator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}