import { useState, useEffect } from 'react';

interface Model {
  id: string;
  name: string;
  username?: string | null;
  display_picture_url?: string | null;
  fan_count?: number | null;
  status?: string | null;
  email: string;
  agency_id?: string | null;
  created_at?: string | null;
  is_verified?: boolean | null;
  language?: string | null;
  last_updated?: string | null;
  onlyfans_link?: string | null;
  payout_percentage?: number | null;
  price?: number | null;
  subscription_type?: string | null;
  telegram_link?: string | null;
  timezone?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
  verification_date?: string | null;
}

interface PromoLink {
  id: string;
  promo_name: string;
  url: string;
  model_id: string;
}

interface ScheduleSFSData {
  modelBeingPromoted: string;
  modelPromoting: string;
  dateTime: string;
  media: File | null;
  caption: string;
  promoLink: string;
}

export const useScheduleSFS = () => {
  const [agencyModels, setAgencyModels] = useState<Model[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [promoLinks, setPromoLinks] = useState<PromoLink[]>([]);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch agency models (models belonging to current agency)
      console.log('🔄 Fetching agency models...');
      const agencyResponse = await fetch('/api/models?status=Active');
      console.log('📦 Agency models response status:', agencyResponse.status, agencyResponse.ok);
      const agencyData = await agencyResponse.json();
      console.log('📦 Agency Models Response:', agencyData);
      if (agencyData.success) {
        console.log('✅ Agency models loaded:', agencyData.data?.length || 0);
        setAgencyModels(agencyData.data || []);
      } else {
        console.error('❌ Agency models failed:', agencyData.error);
      }

      // Fetch all models - fetch with high limit and all=true
      console.log('🔄 Fetching all models...');
      const allModelsResponse = await fetch('/api/models?all=true&limit=10000');
      console.log('📦 All models response status:', allModelsResponse.status, allModelsResponse.ok);
      const allModelsData = await allModelsResponse.json();
      console.log('📦 All Models Response:', {
        success: allModelsData.success,
        dataLength: allModelsData.data?.length || 0,
        totalCount: allModelsData.count,
        error: allModelsData.error,
        fullData: allModelsData
      });
      
      if (allModelsData.success && allModelsData.data && allModelsData.data.length > 0) {
        console.log('✅ All models loaded successfully:', allModelsData.data.length);
        setAllModels(allModelsData.data);
      } else {
        console.error('❌ Failed to fetch all models or empty result:', {
          success: allModelsData.success,
          dataLength: allModelsData.data?.length,
          error: allModelsData.error
        });
        setAllModels(allModelsData.data || []);
      }

      // Fetch scheduled SFS dates to disable conflicts
      console.log('🔄 Fetching scheduled SFS dates...');
      const scheduledResponse = await fetch('/api/scheduled-sfs');
      console.log('📦 Scheduled SFS response status:', scheduledResponse.status);
      const scheduledData = await scheduledResponse.json();
      if (scheduledData.success) {
        const dates = scheduledData.data?.map((item: any) =>
          new Date(item.scheduled_date).toDateString()
        ) || [];
        console.log('✅ Scheduled dates loaded:', dates.length);
        setScheduledDates(dates);
      } else {
        console.error('❌ Failed to fetch scheduled SFS:', scheduledData.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAllModels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoLinks = async () => {
    try {
      const response = await fetch('/api/promo-links');
      const data = await response.json();
      if (data.success) {
        setPromoLinks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching promo links:', error);
    }
  };

  const submitSFS = async (data: ScheduleSFSData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();

      // Parse dateTime
      const [date, time] = data.dateTime.split(' (');

      console.log('📝 Submitting SFS with:', {
        modelBeingPromoted: data.modelBeingPromoted,
        modelPromoting: data.modelPromoting,
        date,
        time: time.replace(')', ''),
      });

      formData.append('model_id', data.modelBeingPromoted);
      formData.append('partner_model_id', data.modelPromoting);
      formData.append('scheduled_date', date);
      formData.append('scheduled_time', time.replace(')', ''));
      if (data.media) {
        formData.append('media', data.media);
      }
      formData.append('promo_link_id', data.promoLink || '');
      formData.append('caption', data.caption);
      formData.append('tags', JSON.stringify([]));

      const response = await fetch('/api/scheduled-sfs', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error submitting SFS:', error);
      return { success: false, error: 'Failed to submit SFS' };
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPromoLinks();
  }, []);

  useEffect(() => {
    console.log('📊 allModels state updated:', allModels.length, allModels);
  }, [allModels]);

  const agencyModelOptions = agencyModels.map(model => ({
    value: model.id,
    label: model.username ? `${model.name} (@${model.username})` : model.name
  }));

  const allModelOptions = allModels.map(model => ({
    value: model.id,
    label: `${model.name || 'Unknown'}${model.status ? ` - ${model.status}` : ''}`
  }));
  
  console.log('🎯 All Model Options:', allModelOptions, 'Count:', allModelOptions.length);

  const promoLinkOptions = promoLinks
    .filter(link => link.promo_name || link.url)
    .map(link => ({
      value: link.id,
      label: link.promo_name ? `${link.promo_name} (${link.url})` : link.url
    }));

  return {
    agencyModels,
    allModels,
    promoLinks,
    scheduledDates,
    loading,
    submitting,
    agencyModelOptions,
    allModelOptions,
    promoLinkOptions,
    submitSFS,
    refetchData: fetchData,
    refetchPromoLinks: fetchPromoLinks,
  };
};