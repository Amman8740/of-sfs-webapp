'use client';

import { SchedulerPage } from "@/components/features";
import { useUserProfile } from '@/lib/utils/swr';

export default function SFSRequestsPage() {
    const { userProfile } = useUserProfile();
    const userType = (userProfile?.user_type as 'agency' | 'creator') || 'agency';

    console.log('📄 SFSRequestsPage Route - User Type from Auth:', userType, 'Profile:', userProfile);

    return <SchedulerPage selectedOption="sfs-requests" userType={userType} />;
}
