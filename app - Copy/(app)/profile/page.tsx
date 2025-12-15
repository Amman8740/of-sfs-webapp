// app/profile/page.tsx
import UnifiedDashboard from "@/components/layout/unified-dashboard";
import { getSession, getModelByUserId } from "@/lib/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
  const user = await getSession();
  console.log('PROFILE PAGE — getSession() returned:', user);
  if (!user) notFound();

  const model = await getModelByUserId(user.id);
  console.log('PROFILE PAGE — getModelById() returned:', model);
  if (!model) notFound();

  return (
    <UnifiedDashboard
      initialPage="creator"
      initialOption="profile"
      modelId={model.id}
      initialModelData={model}
    />
  );
}
