import UnifiedDashboard from '@/components/layout/unified-dashboard';
import {
  getModels,
  getSession,
  getModelByUserId,
} from '@/lib/utils/supabase/server';

export default async function ModelsPage() {
  const user = await getSession();
  let models = [];

  // 🧠 detect role
  const role =
    user?.user_metadata?.role || user?.app_metadata?.role || 'creator';

  if (user?.id) {
    // First, get their own model (if exists)
    const selfModel = await getModelByUserId(user.id);

    // Case 1: agency/admin → see all
    if (role === 'agency' || role === 'admin') {
      models = await getModels();
    }
    // Case 2: creator → exclude self model by ID (safe method)
    else if (selfModel) {
      const allModels = await getModels();
      models = allModels.filter((m) => m.id !== selfModel.id);
    }
    // Case 3: fallback → just load all
    else {
      models = await getModels();
    }
  } else {
    // No user session
    models = await getModels();
  }

  return (
    <UnifiedDashboard
      initialPage="agency"
      initialOption="models"
      requiredUserType="agency"
      modelsData={models}
    />
  );
}
