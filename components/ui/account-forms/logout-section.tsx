'use client';

import { createClient } from '@/lib/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function LogoutSection() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/signin');
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="grid grid-cols-2">
        {/* Left section - Title and description */}
        <div className="p-8 bg-[#FCFCFC]">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Logout</h2>
          <p className="text-gray-600">Sign out of your account on this device.</p>
        </div>
        
        {/* Right section - Button */}
        <div className="p-8 bg-white flex items-center justify-center">
          <Button 
            onClick={handleLogout}
            color="primary"
            size="medium"
            variant="solid"
            className="w-full max-w-xs"
            style={{ backgroundColor: '#E5484D', color: 'white' }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
