import { getModelById } from '@/lib/utils/supabase/server';
import UnifiedDashboard from '@/components/layout/unified-dashboard';
import { notFound } from 'next/navigation';

interface ModelPageProps {
  params: {
    id: string;
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const model = await getModelById(params.id);

  if (!model) {
    notFound();
  }

  return (
    <UnifiedDashboard 
      initialOption="model-details"
      modelId={params.id}
      modelUserId={model.user_id}
      initialModelData={model}
    />
  );
}
