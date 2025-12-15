import UnifiedDashboard from '@/components/layout/unified-dashboard';
import { getModels, getSession } from '@/lib/utils/supabase/server';

export default async function AgencyPage() {
    const user = await getSession();

  const models = await getModels(
    undefined,   // excludeUserId
    user?.id,     // agencyId
  );
  
  return (
    <UnifiedDashboard 
      initialPage="agency" 
      requiredUserType="agency" 
      modelsData={models}
    />
  );
}
