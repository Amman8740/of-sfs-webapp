import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// POST /api/media/upload - Upload files to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const modelId = formData.get('model_id') as string;
    const taggedCreatorsJson = formData.get('tagged_creators') as string;
    const taggedCreators = taggedCreatorsJson ? JSON.parse(taggedCreatorsJson) : [];
    const caption = formData.get('caption') as string;
    const category = formData.get('category') as string;
    const hashtagsStr = formData.get('hashtags') as string;
    const notes = formData.get('notes') as string;
    
    // Parse hashtags - split by comma and clean up
    const hashtags = hashtagsStr ? hashtagsStr.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ 
        error: 'No files provided' 
      }, { status: 400 });
    }

    // Get user's profile to check user_type
    const { data: userProfile, error: profileError } = await (supabase as any)
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    console.log(`👤 User Profile Loaded:`, {
      userId: user.id,
      userType: userProfile?.user_type,
      isAgency: userProfile?.user_type === 'agency'
    });

    // For non-creators, model_id is required
    if (userProfile?.user_type !== 'creator' && !modelId) {
      return NextResponse.json({ 
        error: 'Model ID is required' 
      }, { status: 400 });
    }

    let model = null;
    if (modelId) {
      // Verify the model exists and user has access
      const { data: modelData, error: modelError } = await (supabase as any)
        .from('models')
        .select('id, user_id, agency_id')
        .eq('id', modelId)
        .single();

      if (modelError || !modelData) {
        return NextResponse.json({ 
          error: 'Model not found or access denied' 
        }, { status: 404 });
      }

      // Check if user has access to this model
      if (modelData.user_id !== user.id && modelData.agency_id !== user.id) {
        return NextResponse.json({ 
          error: 'You do not have permission to upload media for this model' 
        }, { status: 403 });
      }

      model = modelData;
    }

    // Fetch creator usernames for tagging
    let creatorUsernames: string[] = [];
    if (taggedCreators.length > 0) {
      const { data: creatorsData, error: creatorsError } = await (supabase as any)
        .from('user_profiles')
        .select('id, profile_data')
        .in('id', taggedCreators)
        .eq('user_type', 'creator');

      if (creatorsError) {
        console.error('Error fetching creators:', creatorsError);
        // Continue without tagging if there's an error
      } else {
        creatorUsernames = creatorsData?.map((creator: any) => {
          let displayName = 'unknownuser'; // Default fallback
          if (creator.profile_data) {
            try {
              const profileData = typeof creator.profile_data === 'string'
                ? JSON.parse(creator.profile_data)
                : creator.profile_data;
              displayName = profileData.name || profileData.displayName || profileData.fullName || profileData.username || profileData.handle || 'unknownuser';
            } catch (e) {
              console.warn('Failed to parse profile_data for creator:', creator.id);
            }
          }
          // Store display name directly (no @ prefix)
          return displayName;
        }) || [];
      }
    }

    const uploadResults = [];
    const maxFileSize = 3 * 1024 * 1024 * 1024; // 3GB limit

    for (const file of files) {
      try {
        // Validate file size
        if (file.size > maxFileSize) {
          uploadResults.push({
            file_name: file.name,
            success: false,
            error: 'File too large (max 3GB)'
          });
          continue;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/avi'];
        if (!allowedTypes.includes(file.type)) {
          uploadResults.push({
            file_name: file.name,
            success: false,
            error: 'File type not supported'
          });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const folderPath = modelId ? `${user.id}/${modelId}` : `${user.id}/creator`;
        const filePath = `${folderPath}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media-uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          uploadResults.push({
            file_name: file.name,
            success: false,
            error: uploadError.message
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media-uploads')
          .getPublicUrl(filePath);

        // Create media item record
        // For agency: store agency user_id so all media appears under agency profile
        // For creator: store creator user_id
        const isAgency = userProfile?.user_type === 'agency';
        const mediaItemData = {
          user_id: user.id,  // Current user (agency or creator)
          model_id: modelId,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type.startsWith('image/') ? 'image' : 'video',
          file_size: file.size,
          status: 'uploaded',
          tag_creators: creatorUsernames,
          caption: caption || null,
          category: category || null,
          hashtags: hashtags.length > 0 ? hashtags : null,
          notes: notes || null,
          // Store agency_id only if user is an agency
          agency_id: isAgency ? user.id : null
        };

        console.log(`📝 Media Item Data being inserted:`, {
          user_id: mediaItemData.user_id,
          model_id: mediaItemData.model_id,
          agency_id: mediaItemData.agency_id,
          isAgency: isAgency,
          userType: userProfile?.user_type,
          fileName: file.name,
          fullData: mediaItemData
        });

        const { data: mediaItem, error: mediaError } = await (supabase as any)
          .from('media_items')
          .insert(mediaItemData)
          .select()
          .single();

        if (mediaError) {
          console.error('Error creating media item:', mediaError);
          // Try to clean up uploaded file
          await supabase.storage.from('media-uploads').remove([filePath]);
          
          uploadResults.push({
            file_name: file.name,
            success: false,
            error: 'Failed to create media record'
          });
          continue;
        }

        console.log(`✅ Media item created successfully:`, {
          id: mediaItem.id,
          user_id: mediaItem.user_id,
          model_id: mediaItem.model_id,
          agency_id: mediaItem.agency_id,
          file_name: mediaItem.file_name
        });

        // If user is an agency, also save to vault (optional)
        // Commented out to avoid duplicate records - uncomment if needed
        /*
        if (userProfile?.user_type === 'agency') {
          const vaultData = {
            user_id: user.id,
            model_id: modelId,
            file_url: publicUrl,
            file_name: file.name,
            file_type: file.type.startsWith('image/') ? 'image' : 'video',
            file_size: file.size,
            caption: caption || null,
            category: category || null,
            tag_creators: creatorUsernames,
            hashtags: hashtags.length > 0 ? hashtags : null,
            notes: notes || null,
            status: 'draft',
            agency_id: user.id
          };

          const { data: vaultItem, error: vaultError } = await (supabase as any)
            .from('vault')
            .insert(vaultData)
            .select()
            .single();

          if (vaultError) {
            console.error('Warning: Failed to save to vault:', vaultError);
            // Don't fail the upload if vault save fails, just log warning
          } else {
            console.log('✅ Media saved to vault:', vaultItem.id);
          }
        }
        */

        uploadResults.push({
          file_name: file.name,
          success: true,
          media_item: {
            id: mediaItem.id,
            file_url: mediaItem.file_url,
            file_type: mediaItem.file_type,
            file_size: mediaItem.file_size
          }
        });

      } catch (fileError) {
        console.error('Error processing file:', fileError);
        uploadResults.push({
          file_name: file.name,
          success: false,
          error: 'Failed to process file'
        });
      }
    }

    const successCount = uploadResults.filter(r => r.success).length;
    const failureCount = uploadResults.filter(r => !r.success).length;

    return NextResponse.json({
      success: failureCount === 0,
      message: `Uploaded ${successCount} of ${files.length} files successfully`,
      uploads: uploadResults,
      summary: {
        total: files.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
