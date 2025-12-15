"use client";

import { createColumns } from "@/components/features/models-listing/models-columns";
import { DataTable } from "@/components/features/models-listing/models-data-table";
import { useRouter } from "next/navigation";

interface ModelsPageClientProps {
  data: any[];
}

export function ModelsPageClient({ data }: ModelsPageClientProps) {
  const router = useRouter();

  const handleModelClick = (modelId: string) => {
    // Navigate to model details using the same route pattern
    router.push(`/models/${modelId}`);
  };

  return (
    <DataTable columns={createColumns(handleModelClick)} data={data} />
  );
}
