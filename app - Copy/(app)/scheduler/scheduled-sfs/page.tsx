'use client';

import { SchedulerPage } from "@/components/features";
import { useUserProfile } from '@/lib/utils/swr';
import { useEffect, useState } from 'react';

export default function ScheduledSFSPage() {
    const { userProfile, user, userData, isLoading } = useUserProfile();
    const [debugInfo, setDebugInfo] = useState<any>(null);
    
    const userType = (userProfile?.user_type as 'agency' | 'creator') || 'agency';

    useEffect(() => {
        setDebugInfo({
            user,
            userData,
            userProfile,
            userType,
            isLoading,
            timestamp: new Date().toISOString()
        });
        
        console.log('📄 ScheduledSFSPage Route - Detailed Debug:', {
            user: user?.id || 'undefined',
            userType,
            userProfile,
            isLoading,
            timestamp: new Date().toISOString()
        });
    }, [user, userData, userProfile, userType, isLoading]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return <SchedulerPage selectedOption="scheduled-sfs" userType={userType} />;
}
