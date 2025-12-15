import { Tables } from '@/types_db';
import useSWR from 'swr';


// interface Model {
//   id: string;
//   name: string;
//   email: string;
//   display_picture_url?: string;
//   onlyfans_link?: string;
//   telegram_link?: string;
//   username?: string;
//   price: number;
//   fan_count: number;
//   payout_percentage: number;
//   subscription_type: string;
//   status: string;
//   language: string;
//   timezone: string;
//   is_verified: boolean;
//   verification_date?: string;
//   last_updated: string;
//   created_at: string;
// }

type Models = Tables<'models'>;


interface ModelsResponse {
  success: boolean;
  data: Models[];
  count: number;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const fetcher = async (url: string): Promise<ModelsResponse> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch models: ${errorText}`);
  }
  
  return response.json();
};


interface UseModelsResult {
  models: Models[];
  isLoading: boolean;
  error: any;
  mutate: (data?: any) => Promise<any>;
}

export const useModels = (): UseModelsResult => {
  const { data, error, mutate, isLoading } = useSWR<ModelsResponse>(
    '/api/models',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    models: data?.data || [],
    isLoading,
    error,
    mutate,
  };
};
