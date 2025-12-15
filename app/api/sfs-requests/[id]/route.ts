import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/sfs-requests/[id] - Fetch a specific SFS request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: sfsRequest, error } = await (supabase as any)
      .from('sfs_requests')
      .select(`
        *,
        onlyfans_profile:onlyfans_profile_id (
          id,
          username,
          display_name,
          profile_image_url,
          fans,
          user_id
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'SFS request not found' }, { status: 404 });
      }
      console.error('Error fetching SFS request:', error);
      return NextResponse.json({ error: 'Failed to fetch SFS request' }, { status: 500 });
    }

    // Check if user has access (is sender or is receiver)
    const sfsData = sfsRequest as any;
    const onlyfansProfile = sfsData.onlyfans_profile;
    
    const hasAccess = 
      sfsData.user_id === user.id ||
      onlyfansProfile.user_id === user.id;

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'You do not have permission to view this SFS request' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true,
      data: sfsRequest 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/sfs-requests/[id] - Update SFS request (accept/decline/reschedule)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // First, get the SFS request to check permissions
    const { data: existingRequest, error: fetchError } = await (supabase as any)
      .from('sfs_requests')
      .select(`
        *,
        onlyfans_profile:onlyfans_profile_id (
          user_id
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingRequest) {
      return NextResponse.json({ error: 'SFS request not found' }, { status: 404 });
    }

    const sfsData = existingRequest as any;
    const onlyfansProfile = sfsData.onlyfans_profile;

    // For status changes (accept/decline), only receiver can do it
    if (body.status && body.status !== existingRequest.status) {
      const canModify = onlyfansProfile.user_id === user.id;
      
      if (!canModify) {
        return NextResponse.json({ 
          error: 'Only the receiver can accept or decline this request' 
        }, { status: 403 });
      }

      // Validate status
      const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ 
          error: 'Invalid status',
          details: 'Status must be one of: pending, accepted, rejected, cancelled' 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {};
    
    if (body.status !== undefined) updateData.status = body.status;
    if (body.proposed_date !== undefined) updateData.proposed_date = body.proposed_date;
    if (body.scheduled_date !== undefined) updateData.scheduled_date = body.scheduled_date;
    if (body.message !== undefined) updateData.message = body.message;
    if (body.response_message !== undefined) updateData.response_message = body.response_message;

    // Update the SFS request
    const { data: sfsRequest, error } = await (supabase as any)
      .from('sfs_requests')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select(`
        *,
        onlyfans_profile:onlyfans_profile_id (
          id,
          username,
          display_name,
          profile_image_url,
          fans
        )
      `)
      .single();

    if (error) {
      console.error('Error updating SFS request:', error);
      return NextResponse.json({ error: 'Failed to update SFS request' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: sfsRequest,
      message: 'SFS request updated successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/sfs-requests/[id] - Delete/cancel SFS request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the SFS request to check permissions
    const { data: existingRequest, error: fetchError } = await (supabase as any)
      .from('sfs_requests')
      .select(`
        *
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingRequest) {
      return NextResponse.json({ error: 'SFS request not found' }, { status: 404 });
    }

    const sfsData = existingRequest as any;
    // Only sender can delete/cancel their own request
    const canDelete = sfsData.user_id === user.id;

    if (!canDelete) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this SFS request' 
      }, { status: 403 });
    }

    // Delete the SFS request
    const { error } = await (supabase as any)
      .from('sfs_requests')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Error deleting SFS request:', error);
      return NextResponse.json({ error: 'Failed to delete SFS request' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'SFS request deleted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

