import UnifiedDashboard from '@/components/layout/unified-dashboard';
import { getModels } from '@/lib/utils/supabase/server';

export default async function CreatorPage() {
  const models = await getModels();
  
  return (
    <UnifiedDashboard 
      initialPage="creator"
      initialOption="models"
      requiredUserType="creator" 
      modelsData={models}
    />
  );
}
