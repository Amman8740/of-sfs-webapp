import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/utils/supabase/server';

// Helper function to calculate match score
function calculateMatchScore(model1: any, model2: any, matchType: 'internal' | 'linked_agency' | 'external') {
  const fans1 = model1.fans;
  const fans2 = model2.fans;
  const fanDiff = Math.abs(fans1 - fans2);
  const maxFans = Math.max(fans1, fans2);
  const minFans = Math.min(fans1, fans2);

  // Calculate match score based on fan similarity
  let matchScore = (minFans / maxFans) * 100;
  
  // Determine compatibility level and badge
  let compatibility = '';
  let badge = '';

  if (matchScore >= 90) {
    compatibility = 'Perfect Match';
    badge = '⭐ Perfect';
  } else if (matchScore >= 75) {
    compatibility = 'Excellent Match';
    badge = '✨ Excellent';
  } else if (matchScore >= 60) {
    compatibility = 'Good Match';
    badge = '👍 Good';
  } else if (matchScore >= 50) {
    compatibility = 'Fair Match';
    badge = '👌 Fair';
  } else {
    compatibility = 'Low Match';
    badge = '📊 Low';
  }

  // Create bidirectional match records
  const match1 = {
    id: `${model1.id}-${model2.id}`,
    model1_id: model1.id,
    model1_name: model1.name || model1.username,
    model1_fans: fans1,
    model1_verified: model1.is_verified,
    model1_pic: model1.profile_pic_url,
    model1_user_id: model1.user_id,
    model2_id: model2.id,
    model2_name: model2.name || model2.username,
    model2_fans: fans2,
    model2_verified: model2.is_verified,
    model2_pic: model2.profile_pic_url,
    model2_user_id: model2.user_id,
    match_score: Math.round(matchScore),
    compatibility,
    badge,
    fan_difference: fanDiff,
    direction: 'model1_promotes_model2',
    description: `${model1.name || model1.username} promotes ${model2.name || model2.username}`,
    match_type: matchType,
    status: 'idle'
  };

  const match2 = {
    id: `${model2.id}-${model1.id}`,
    model1_id: model2.id,
    model1_name: model2.name || model2.username,
    model1_fans: fans2,
    model1_verified: model2.is_verified,
    model1_pic: model2.profile_pic_url,
    model1_user_id: model2.user_id,
    model2_id: model1.id,
    model2_name: model1.name || model1.username,
    model2_fans: fans1,
    model2_verified: model1.is_verified,
    model2_pic: model1.profile_pic_url,
    model2_user_id: model1.user_id,
    match_score: Math.round(matchScore),
    compatibility,
    badge,
    fan_difference: fanDiff,
    direction: 'model2_promotes_model1',
    description: `${model2.name || model2.username} promotes ${model1.name || model1.username}`,
    match_type: matchType,
    status: 'idle'
  };

  return [match1, match2];
}

// GET /api/smart-match/agency-matches - Get smart match suggestions between agency models
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseService = await createServiceRoleClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an agency
    const { data: userProfile } = await (supabase as any)
      .from('user_profiles')
      .select('user_type, id')
      .eq('id', user.id)
      .single();

    console.log('👤 User profile check:', { user_id: user.id, user_type: userProfile?.user_type });

    if (!userProfile) {
      return NextResponse.json({ 
        error: 'User profile not found',
        details: `No user_profiles entry for user ${user.id}`
      }, { status: 404 });
    }

    if (userProfile?.user_type !== 'agency') {
      return NextResponse.json({ 
        error: 'Only agencies can access agency smart matches',
        details: `User type is '${userProfile?.user_type}' but expected 'agency'`,
        user_id: user.id
      }, { status: 403 });
    }

    console.log('🤝 Fetching smart matches for agency:', user.id);

    // Step 1: Get all models belonging to this agency
    const { data: agencyModels, error: modelsError } = await (supabase as any)
      .from('models')
      .select('id, user_id, name, username, fan_count, agency_id')
      .eq('agency_id', user.id);

    if (modelsError || !agencyModels || agencyModels.length === 0) {
      console.log('⚠️ No agency models found:', { error: modelsError?.message, agency_id: user.id });
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No models found for this agency',
        agency_id: user.id,
        error_details: modelsError?.message || 'No models associated with this agency'
      });
    }

    console.log(`📦 Found ${agencyModels.length} agency models`);

    // Step 1.5: Find linked agencies (agencies we've sent/received requests from)
    const { data: linkedAgencyIds } = await (supabase as any)
      .from('sfs_requests')
      .select('agency_id')
      .eq('agency_id', user.id)
      .neq('agency_id', null);

    const linkedAgencySet = new Set<string>();
    (linkedAgencyIds || []).forEach((req: any) => {
      if (req.agency_id && req.agency_id !== user.id) {
        linkedAgencySet.add(req.agency_id);
      }
    });

    console.log(`🔗 Found ${linkedAgencySet.size} linked agencies from requests`);

    // Step 1.6: Get models from linked agencies
    const linkedAgencyArray = Array.from(linkedAgencySet);
    let linkedAgencyModels: any[] = [];
    
    if (linkedAgencyArray.length > 0) {
      const { data: lmdata } = await (supabase as any)
        .from('models')
        .select('id, user_id, name, username, fan_count, agency_id')
        .in('agency_id', linkedAgencyArray);
      
      linkedAgencyModels = lmdata || [];
      console.log(`🔗 Found ${linkedAgencyModels.length} models from linked agencies`);
    }

    // Step 1.7: Get ALL other models (from other agencies that are NOT linked or standalone)
    const excludeAgencyIds = [user.id, ...linkedAgencyArray];
    
    // Fetch all models and filter in-memory (since Supabase doesn't support notIn directly)
    const { data: allModelsData, error: allModelsError } = await (supabase as any)
      .from('models')
      .select('id, user_id, name, username, fan_count, agency_id');

    // Filter to exclude our agency and linked agencies
    const externalModels = (allModelsData || []).filter((model: any) => 
      !excludeAgencyIds.includes(model.agency_id)
    );

    console.log(`🌐 Found ${externalModels.length} external models from other agencies`);

    // Combine all models for profile lookup
    const allModelUserIds = [
      ...(agencyModels as any[]).map((m: any) => m.user_id),
      ...(linkedAgencyModels as any[]).map((m: any) => m.user_id),
      ...(externalModels as any[]).map((m: any) => m.user_id)
    ];

    // Step 2: Get onlyfans profiles for ALL models
    const { data: onlyFansProfiles } = await (supabaseService as any)
      .from('onlyfans_profiles')
      .select('user_id, username, display_name, fans, profile_image_url, is_verified')
      .in('user_id', allModelUserIds);

    // Create a map for quick lookup
    const profileMap: { [key: string]: any } = {};
    if (onlyFansProfiles) {
      onlyFansProfiles.forEach((profile: any) => {
        profileMap[profile.user_id] = profile;
      });
    }

    console.log(`📸 Loaded ${onlyFansProfiles?.length || 0} onlyfans profiles`);

    // Step 3: Enrich agency models with profile data
    const enrichedAgencyModels = (agencyModels as any[]).map((model: any) => ({
      ...model,
      source: 'internal',
      fans: profileMap[model.user_id]?.fans || 0,
      display_name: profileMap[model.user_id]?.display_name,
      is_verified: profileMap[model.user_id]?.is_verified,
      profile_pic_url: profileMap[model.user_id]?.profile_image_url
    }));

    // Step 3.3: Enrich linked agency models with profile data
    const enrichedLinkedAgencyModels = (linkedAgencyModels as any[]).map((model: any) => ({
      ...model,
      source: 'linked_agency',
      agency_name: `Linked Agency`,
      fans: profileMap[model.user_id]?.fans || 0,
      display_name: profileMap[model.user_id]?.display_name,
      is_verified: profileMap[model.user_id]?.is_verified,
      profile_pic_url: profileMap[model.user_id]?.profile_image_url
    }));

    // Step 3.5: Enrich external models with profile data
    const enrichedExternalModels = (externalModels as any[]).map((model: any) => ({
      ...model,
      source: 'external',
      agency_name: model.agency_id ? `Agency ${model.agency_id.substring(0, 8)}` : 'Independent',
      fans: profileMap[model.user_id]?.fans || 0,
      display_name: profileMap[model.user_id]?.display_name,
      is_verified: profileMap[model.user_id]?.is_verified,
      profile_pic_url: profileMap[model.user_id]?.profile_image_url
    }));

    console.log(`✅ Enriched ${enrichedAgencyModels.length} internal + ${enrichedLinkedAgencyModels.length} linked + ${enrichedExternalModels.length} external models`);

    // Step 4: Calculate matches between agency models and ALL other models
    const matches: any[] = [];
    
    // Internal matches (between own models)
    for (let i = 0; i < enrichedAgencyModels.length; i++) {
      for (let j = i + 1; j < enrichedAgencyModels.length; j++) {
        const model1 = enrichedAgencyModels[i];
        const model2 = enrichedAgencyModels[j];

        if (!model1.fans || !model2.fans) continue;

        const matchData = calculateMatchScore(model1, model2, 'internal');
        matches.push(...matchData);
      }
    }

    // Linked agency matches (between own models and linked agency models)
    for (let i = 0; i < enrichedAgencyModels.length; i++) {
      for (let j = 0; j < enrichedLinkedAgencyModels.length; j++) {
        const model1 = enrichedAgencyModels[i];
        const model2 = enrichedLinkedAgencyModels[j];

        if (!model1.fans || !model2.fans) continue;

        const matchData = calculateMatchScore(model1, model2, 'linked_agency');
        matches.push(...matchData);
      }
    }

    // External matches (between own models and external models)
    for (let i = 0; i < enrichedAgencyModels.length; i++) {
      for (let j = 0; j < enrichedExternalModels.length; j++) {
        const model1 = enrichedAgencyModels[i];
        const model2 = enrichedExternalModels[j];
        if (!model1.fans || !model2.fans) continue;

        const matchData = calculateMatchScore(model1, model2, 'external');
        matches.push(...matchData);
      }
    }

    // Flatten matches array (since calculateMatchScore returns an array)
    const allMatches = matches.flat();

    // Check for existing requests for each match
    for (let match of allMatches) {
      // Need to get the receiver model's onlyfans profile ID
      const { data: receiverModel } = await (supabase as any)
        .from('models')
        .select('user_id')
        .eq('id', match.model2_id)
        .single();

      if (receiverModel?.user_id) {
        // Get the receiver's onlyfans profile
        const { data: receiverProfile } = await (supabase as any)
          .from('onlyfans_profiles')
          .select('id')
          .eq('user_id', receiverModel.user_id)
          .limit(1);

        if (receiverProfile && receiverProfile.length > 0) {
          const { data: existingRequest } = await (supabase as any)
            .from('sfs_requests')
            .select('id, status')
            .eq('user_id', match.model1_user_id)
            .eq('onlyfans_profile_id', receiverProfile[0].id)
            .single();

          if (existingRequest) {
            match.status = existingRequest.status || 'pending';
            match.already_requested = existingRequest.status === 'pending';
          }
        }
      }
    }

    // Sort matches by score descending
    allMatches.sort((a, b) => b.match_score - a.match_score);

    console.log(`🎯 Generated ${allMatches.length} match combinations (${enrichedAgencyModels.length} internal + ${enrichedLinkedAgencyModels.length} linked + ${enrichedExternalModels.length} external models)`);

    return NextResponse.json({
      success: true,
      data: allMatches,
      count: allMatches.length,
      agency_id: user.id,
      internal_models_count: enrichedAgencyModels.length,
      linked_agency_models_count: enrichedLinkedAgencyModels.length,
      external_models_count: enrichedExternalModels.length,
      total_matches: allMatches.length,
      filter: {
        description: `Showing ${allMatches.length} model match combinations including ${enrichedAgencyModels.length} internal, ${enrichedLinkedAgencyModels.length} linked agency, and ${enrichedExternalModels.length} external models`,
        internal_models: enrichedAgencyModels.length,
        linked_agency_models: enrichedLinkedAgencyModels.length,
        external_models: enrichedExternalModels.length,
        matches_available: allMatches.length
      },
      debug: {
        internal_models: (enrichedAgencyModels as any[]).map((m: any) => ({
          id: m.id,
          name: m.name,
          fans: m.fans,
          user_id: m.user_id,
          source: 'internal'
        })),
        linked_agency_models: (enrichedLinkedAgencyModels as any[]).map((m: any) => ({
          id: m.id,
          name: m.name,
          fans: m.fans,
          user_id: m.user_id,
          agency_id: m.agency_id,
          source: 'linked_agency'
        })),
        external_models_count: enrichedExternalModels.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching agency smart matches:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
