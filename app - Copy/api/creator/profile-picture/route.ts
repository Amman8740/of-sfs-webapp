import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

/**
 * POST /api/creator/profile-picture
 * Upload a profile picture for a creator
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to verify they're a creator
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (userProfile.user_type !== 'creator') {
      return NextResponse.json({ error: 'Only creators can upload profile pictures' }, { status: 403 });
    }

    // Get the file from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' }, { status: 400 });
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}-${file.name}`;

    // Upload to storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filename);

    const publicUrl = publicUrlData?.publicUrl;

    // Update user's avatar_url in users table
    const { data: userUpdate, error: userUpdateError } = await (supabase as any)
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
      .select()
      .single();

    if (userUpdateError) {
      console.error('Error updating user avatar:', userUpdateError);
      // Don't fail - the file was uploaded successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      url: publicUrl,
      filename: uploadData?.path
    });

  } catch (error) {
    console.error('Error in POST /api/creator/profile-picture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/creator/profile-picture
 * Delete a creator's profile picture
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the filename from query params
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profile-pictures')
      .remove([filename]);

    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    // Clear avatar_url in users table
    const { error: userUpdateError } = await (supabase as any)
      .from('users')
      .update({ avatar_url: null })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Error clearing user avatar:', userUpdateError);
      // Don't fail - the file was deleted successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/creator/profile-picture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
