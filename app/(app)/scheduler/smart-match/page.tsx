'use client';

import { SchedulerPage } from "@/components/features";
import { useUserProfile } from '@/lib/utils/swr';

export default function SmartMatchPage() {
    const { userProfile, userData } = useUserProfile();
    const userType = (userProfile?.user_type as 'agency' | 'creator') || 'agency';
    
    // For agencies, we might have a model ID in the profile or user data
    // For creators, we use the user ID directly
    const modelId = userType === 'agency' ? (userData?.id) : undefined;

    console.log('📄 SmartMatchPage Route - User Type:', userType, 'Model ID:', modelId);

    return <SchedulerPage selectedOption="smart-match" userType={userType} modelId={modelId} />;
}
