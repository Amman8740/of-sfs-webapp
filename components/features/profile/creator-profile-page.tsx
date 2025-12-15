'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SFSRulesModal } from '../models/sfs-rules-modal';
import { useNotificationToast } from '@/lib/hooks/useNotificationToast';
import { MediaDetailsModal } from '../scheduler/media-details-modal';
import { AddPromoLinkModal } from '../models/add-promo-link-modal';
import { SFSSettingsModal } from '../scheduler/sfs-settings-modal';
import { SFSFilterIcon } from '@/components/ui/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox
} from '@/components/ui';
import { createClient } from '@/lib/utils/supabase/client';

interface CreatorProfilePageProps {
  initialCreatorData?: any;
  userProfile?: any;
}

interface CreatorData {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  price: string;
  fans: number;
  payoutPercentage: number;
  subscriptionType: 'Paid' | 'Free';
  lastUpdated: string;
  language: string;
  timezone: string;
  verified: boolean;
  rules: {
    maxSfsPerDay: number;
    contentAllowed: string[];
    pinContent: string;
  };
}

interface SFSHistoryEntry {
  id: string;
  media: {
    thumbnail: string;
    alt: string;
  };
  date: string;
  creator: string;
  contentSlot: number;
  promoLink: string;
  promoLinkName?: string;
  status: 'Approve' | 'Pending' | 'Rejected' | string;
}

interface VaultMediaItem {
  id: string;
  imageUrl: string;
  date: string;
  category: string[];
  hashtags: string[];
  caption?: string;
  notes?: string;
}

const mockCreatorData: CreatorData = {
  id: '1',
  name: 'Creator Profile',
  username: 'creator_username',
  profileImage:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  price: '$200/mon',
  fans: 1985145,
  payoutPercentage: 70,
  subscriptionType: 'Paid',
  lastUpdated: new Date().toISOString(),
  language: 'English',
  timezone: 'GMT+5',
  verified: false,
  rules: {
    maxSfsPerDay: 3,
    contentAllowed: ['Fully Explicit', 'Topless', 'SFW Only'],
    pinContent: 'Accept All'
  }
};

const mockSFSHistoryData: SFSHistoryEntry[] = [
  {
    id: '2',
    media: {
      thumbnail:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      alt: 'Portrait photo'
    },
    date: 'Wed, 6 Aug 2025 (2:30 PM)',
    creator: '@creator456',
    contentSlot: 2,
    promoLink: 'https://onlyfans.com/modelname/promo456',
    status: 'Pending'
  },
  {
    id: '3',
    media: {
      thumbnail:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      alt: 'Portrait photo'
    },
    date: 'Tue, 5 Aug 2025 (9:15 AM)',
    creator: '@influencer789',
    contentSlot: 1,
    promoLink: 'https://onlyfans.com/modelname/promo789',
    status: 'Failed'
  },
  {
    id: '4',
    media: {
      thumbnail:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      alt: 'Portrait photo'
    },
    date: 'Mon, 4 Aug 2025 (3:45 PM)',
    creator: '@model_creator',
    contentSlot: 3,
    promoLink: 'https://onlyfans.com/modelname/promo456',
    status: 'Done'
  },
  {
    id: '5',
    media: {
      thumbnail:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      alt: 'Portrait photo'
    },
    date: 'Sun, 3 Aug 2025 (11:20 AM)',
    creator: '@content_creator',
    contentSlot: 2,
    promoLink: 'https://onlyfans.com/modelname/promo789',
    status: 'Pending'
  }
];

const mockVaultData: VaultMediaItem[] = [
  {
    id: '1',
    imageUrl:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
    date: 'Aug 15, 2025',
    category: ['Landscape', 'Nature'],
    hashtags: ['#canyon', '#adventure', '#nature', '#landscape'],
    caption: 'Dramatic canyon landscape with natural light streaming through',
    notes: 'Perfect shot for outdoor content. Great lighting conditions.'
  },
  {
    id: '2',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    date: 'Aug 12, 2025',
    category: ['Sunset', 'Valley'],
    hashtags: ['#sunset', '#valley', '#green', '#hills'],
    caption: 'Rolling green hills under a beautiful sunset sky',
    notes: 'Amazing golden hour lighting. Great for promotional content.'
  },
  {
    id: '3',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    date: 'Aug 10, 2025',
    category: ['Desert', 'Travel'],
    hashtags: ['#desert', '#hiking', '#travel', '#dunes'],
    caption: 'Hiker on sand dunes during golden hour',
    notes: 'Desert adventure content. Perfect for travel-themed posts.'
  }
];

export const CreatorProfilePage: React.FC<CreatorProfilePageProps> = ({
  initialCreatorData,
  userProfile
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'rules' | 'sfs-history' | 'vault' | 'promo-links'
  >('rules');
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditRulesModal, setShowEditRulesModal] = useState(false);
  const [selectedSFS, setSelectedSFS] = useState<string[]>([]);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [selectedVaultItem, setSelectedVaultItem] =
    useState<VaultMediaItem | null>(null);
  const [promoLinks, setPromoLinks] = useState<any[]>([]);
  const [sfsHistory, setSfsHistory] = useState<SFSHistoryEntry[]>([]);
  const [sfsHistoryLoading, setSfsHistoryLoading] = useState(false);
  const [vaultData, setVaultData] = useState<VaultMediaItem[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const supabaseClient = createClient();
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [showSFSSettingsModal, setShowSFSSettingsModal] = useState(false);
  const { toasts, removeToast } = useNotificationToast();

  // Format date for display
  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;

      return `${day}, ${month} ${year} (${displayHours}:${minutes}${ampm})`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleBack = () => {
    router.back();
  };

  // 🔹 FETCH SFS RULES BY model_id
  useEffect(() => {
    async function fetchRules() {
      if (!initialCreatorData?.id) return;

      setRulesLoading(true);
      try {
        const response = await fetch(`/api/sfs-rules?model_id=${initialCreatorData.id}`);
        const result = await response.json();

        console.log('📋 SFS Rules Response:', result);

        if (result.success && result.data) {
          // Update creatorData with fetched rules
          setCreatorData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              rules: {
                maxSfsPerDay: result.data.maxSfsPerDay,
                contentAllowed: result.data.contentAllowed,
                pinContent: result.data.pinContent
              }
            };
          });
        }
      } catch (error) {
        console.error('Error fetching SFS rules:', error);
      } finally {
        setRulesLoading(false);
      }
    }

    // Fetch rules whenever initialCreatorData changes
    if (initialCreatorData?.id) {
      fetchRules();
    }
  }, [initialCreatorData?.id]);

  // 🔹 LOAD PROMO LINKS DIRECTLY BY model_id
  useEffect(() => {
  async function fetchLinks() {
    if (!initialCreatorData?.user_id) return;

    // 1️⃣ Find the model for this creator
    const { data: model, error: modelErr } = await supabaseClient
      .from("models")
      .select("id")
      .eq("user_id", initialCreatorData.user_id)
      .single() as { data: { id: string } | null; error: any };

    console.log("MODEL FOUND:", model);

    if (modelErr || !model) {
      console.log("Model not found for this creator");
      setPromoLinks([]);
      return;
    }

    // 2️⃣ Fetch promo links for this model
    const { data, error } = await supabaseClient
      .from("promo_links")
      .select("*")
      .eq("model_id", model.id) as { data: any[]; error: any };

    if (error) {
      console.log("Error fetching promo links:", error);
      return;
    }

    setPromoLinks(data);
  }

  fetchLinks();
}, [initialCreatorData]);

  // 🔹 FETCH VAULT MEDIA BY model_id (LATEST 3 ONLY)
  useEffect(() => {
    async function fetchVaultMedia() {
      if (!initialCreatorData?.id) return;

      setVaultLoading(true);
      try {
        const response = await fetch('/api/vault');
        const result = await response.json();

        console.log('🎨 Vault Media Response:', result);

        if (result.success && result.data) {
          // Transform API data and get latest 3
          const transformedData: VaultMediaItem[] = result.data
            .slice(0, 3)
            .map((media: any) => {
              console.log('🔄 Transforming media entry:', media);
              
              return {
                id: media.id,
                imageUrl: media.file_url || media.thumbnail_url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
                date: media.created_at ? new Date(media.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'N/A',
                category: media.category ? [media.category] : [],
                hashtags: Array.isArray(media.hashtags) ? media.hashtags : (media.hashtags ? [media.hashtags] : []),
                caption: media.caption || '',
                notes: media.notes || ''
              };
            });

          console.log('✅ Transformed vault data:', transformedData);
          setVaultData(transformedData);
        } else {
          setVaultData([]);
        }
      } catch (error) {
        console.error('Error fetching vault media:', error);
        setVaultData([]);
      } finally {
        setVaultLoading(false);
      }
    }

    if (activeTab === 'vault') {
      fetchVaultMedia();
    }
  }, [initialCreatorData?.id, activeTab]);

  // 🔹 FETCH SFS HISTORY BY model_id
  useEffect(() => {
    async function fetchSFSHistory() {
      setSfsHistoryLoading(true);
      try {
        // Get the current authenticated user
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Failed to get authenticated user');
          return;
        }

        // Get scheduled SFS by auth user ID (their sent and received SFS)
        const response = await fetch(`/api/scheduled-sfs`);
        const result = await response.json();

        console.log('📊 SFS History Response:', result);

        if (result.success && result.data) {
          // Transform API data to match SFSHistoryEntry interface
          const transformedData: SFSHistoryEntry[] = result.data.map((sfs: any) => {
            console.log('🔄 Transforming SFS entry:', sfs);
            
            return {
              id: sfs.id,
              media: {
                thumbnail: sfs.media?.thumbnail_url || sfs.media_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                alt: 'SFS media'
              },
              date: new Date(sfs.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) + ` (${sfs.scheduled_time || 'TBD'})`,
              creator: sfs.partner_creator ? `@${sfs.partner_creator}` : 'Unknown',
              contentSlot: sfs.content_slot || 1,
              promoLink: sfs.promo_links?.url || sfs.promo_url || '#',
              promoLinkName: sfs.promo_links?.promo_name || sfs.promo_name || 'N/A',
              status: sfs.status || 'pending'
            };
          });

          setSfsHistory(transformedData);
        } else {
          setSfsHistory([]);
        }
      } catch (error) {
        console.error('Error fetching SFS history:', error);
        setSfsHistory([]);
      } finally {
        setSfsHistoryLoading(false);
      }
    }

    if (activeTab === 'sfs-history') {
      fetchSFSHistory();
    }
  }, [initialCreatorData?.id, activeTab]);

  // Creator meta
  useEffect(() => {
    if (initialCreatorData) {
      console.log('Creator Profile - initialCreatorData:', initialCreatorData);

      const of = initialCreatorData.onlyfans_profile || {};

      const serverCreatorData: CreatorData = {
        id: initialCreatorData.id, // this is models.id in your current setup
        name: of.display_name || initialCreatorData.name || 'Creator Profile',
        username:
          of.username || initialCreatorData.username || 'creator_username',
        profileImage:
          of.profile_image_url ||
          initialCreatorData.display_picture_url ||
          'https://placehold.co/293x293',
        price:
          of.subscription_type === 'Paid' ? `$${of.price || 0}/month` : 'Free',
        fans: of.fans ?? 0,
        payoutPercentage: initialCreatorData.payout_percentage ?? 70,
        subscriptionType: of.subscription_type ?? 'Free',
        lastUpdated: of.last_updated || initialCreatorData.updated_at,
        language: initialCreatorData.language ?? 'English',
        timezone: initialCreatorData.timezone ?? 'GMT+5',
        verified: of.is_verified ?? false,
        rules: {
          maxSfsPerDay: initialCreatorData.rules?.maxSfsPerDay ?? 3,
          contentAllowed: initialCreatorData.rules?.contentAllowed ?? [
            'Fully Explicit',
            'Topless',
            'SFW Only'
          ],
          pinContent: initialCreatorData.rules?.pinContent ?? 'Accept All'
        }
      };

      setCreatorData(serverCreatorData);
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        setCreatorData(mockCreatorData);
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialCreatorData, userProfile]);

  const formatNumber = (num: number) => num.toLocaleString();

  const handleEditRules = () => setShowEditRulesModal(true);
  const handleCloseEditRules = () => setShowEditRulesModal(false);

  const handleSaveRules = async (rulesData?: any) => {
    if (!creatorData) return;

    setIsSavingRules(true);
    try {
      const response = await fetch('/api/sfs-rules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: creatorData.id,
          maxSfsPerDay: rulesData?.maxSfsPerDay ?? creatorData.rules.maxSfsPerDay,
          contentAllowed: rulesData?.contentAllowed ?? creatorData.rules.contentAllowed,
          pinContent: rulesData?.pinContent ?? creatorData.rules.pinContent,
          massDM: rulesData?.massDM ?? false,
          fanCount: rulesData?.fanCount ?? '80%',
          contentType: rulesData?.contentType ?? 'Topless'
        })
      });

      const result = await response.json();

      console.log('✅ Rules saved:', result);

      if (result.success) {
        // Update local state with the returned values from API
        setCreatorData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            rules: {
              maxSfsPerDay: result.data.maxSfsPerDay ?? rulesData?.maxSfsPerDay ?? prev.rules.maxSfsPerDay,
              contentAllowed: result.data.contentAllowed ?? rulesData?.contentAllowed ?? prev.rules.contentAllowed,
              pinContent: result.data.pinContent ?? rulesData?.pinContent ?? prev.rules.pinContent
            }
          };
        });
        setShowEditRulesModal(false);
        toast.success('SFS Rules updated successfully');
      } else {
        console.error('Failed to save rules:', result.error);
        toast.error(result.error || 'Failed to save rules');
      }
    } catch (error) {
      console.error('Error saving rules:', error);
      toast.error('Error saving rules. Please try again.');
    } finally {
      setIsSavingRules(false);
    }
  };

  const handleSFSSelect = (sfsId: string) => {
    setSelectedSFS((prev) =>
      prev.includes(sfsId)
        ? prev.filter((id) => id !== sfsId)
        : [...prev, sfsId]
    );
  };

  const handleSelectAllSFS = () => {
    if (selectedSFS.length === sfsHistory.length) {
      setSelectedSFS([]);
    } else {
      setSelectedSFS(sfsHistory.map((item) => item.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    // Map database status values to display names
    const normalizedStatus = status?.toLowerCase() || '';
    
    if (normalizedStatus === 'approved' || normalizedStatus === 'approved') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (normalizedStatus === 'pending' || normalizedStatus === 'scheduled') {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    } else if (normalizedStatus === 'rejected' || normalizedStatus === 'cancelled') {
      return `${baseClasses} bg-red-100 text-red-800`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleVaultItemClick = (item: VaultMediaItem) => {
    console.log('📸 Clicked vault item:', item);
    console.log('📋 Item details:', {
      id: item.id,
      category: item.category,
      hashtags: item.hashtags,
      caption: item.caption,
      notes: item.notes,
      imageUrl: item.imageUrl,
      date: item.date
    });
    setSelectedVaultItem(item);
    setShowVaultModal(true);
  };

  const handleCloseVaultModal = () => {
    setShowVaultModal(false);
    setSelectedVaultItem(null);
  };

  const handleAddPromoLink = () => setShowAddPromoModal(true);
  const handleCloseAddPromoModal = () => setShowAddPromoModal(false);

  const handleDeletePromoLink = (id: string) => {
    setPromoLinks((prev) => prev.filter((link) => link.id !== id));
  };

  // 🔹 SAVE PROMO LINK DIRECTLY TO SUPABASE
  const handleSavePromoLink = async (promoData: { url: string }) => {
    try {
      if (!initialCreatorData?.id) {
        console.error('No model id on initialCreatorData');
        return;
      }

      const { data, error } = await supabaseClient
  .from('promo_links')
  .insert({
    model_id: initialCreatorData.id,     // models.id
    user_id: userProfile.id,             // creator's auth.uid()
    url: promoData.url,
    promo_name: 'Creator Added Link',
    description: '',
    platform: 'OnlyFans',
    source: 'creator_generated'
  } as any)
  .select('*')
  .single() as { data: any; error: any };


      if (error) {
        console.error('FAILED TO CREATE PROMO LINK (Supabase)', error);
        return;
      }

      setPromoLinks((prev) => [data, ...prev]);
      setShowAddPromoModal(false);
    } catch (err) {
      console.error('FAILED TO CREATE', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] flex items-center justify-center rounded-tl-xl p-6">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!creatorData) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] flex items-center justify-center rounded-tl-xl p-6">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
              title="Back to Dashboard"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>

        {/* Main White Card */}
        <div className="w-full overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Profile Section */}
          <div className="p-8">
            {/* Name above both picture and stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center lg:text-left">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  {creatorData.name}
                </h2>
              </div>
              <button
                onClick={() => setShowSFSSettingsModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#96C7F2] bg-[#F5FAFF] text-[#0091FF] hover:bg-[#EDF6FF] transition-colors"
                style={{ width: '142px', height: '40px' }}
              >
                <SFSFilterIcon className="w-4 h-4" />
                <span className="text-sm font-medium">SFS Settings</span>
              </button>
            </div>

            <div className="flex flex-col items-start gap-12 lg:flex-row">
              {/* Left Column - Profile Picture */}
              <div className="flex-shrink-0 w-full lg:w-auto">
                <div
                  className="mx-auto overflow-hidden rounded-lg lg:mx-0"
                  style={{
                    width: '293px',
                    height: '293px',
                    maxWidth: '100%'
                  }}
                >
                  <Image
                    src={creatorData.profileImage}
                    alt={creatorData.name}
                    width={293}
                    height={293}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Right Column - Stats Card */}
              <div className="flex-1 w-full min-w-0">
                {/* Stats Card */}
                <div className="w-full p-6 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Stats
                    </h3>
                    {creatorData.verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-16 text-sm md:grid-cols-2">
                    <div className="min-w-0 space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex-shrink-0 text-gray-500 whitespace-nowrap">
                          Username:
                        </span>
                        <span className="ml-2 font-medium truncate text-canvas-text-contrast">
                          @{creatorData.username}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex-shrink-0 text-gray-500 whitespace-nowrap">
                          Fans:
                        </span>
                        <span className="ml-2 font-medium text-gray-900 truncate">
                          {formatNumber(creatorData.fans)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex-shrink-0 text-gray-500 whitespace-nowrap">
                          Subscription Type:
                        </span>
                        <span className="inline-flex items-center px-2 py-1 ml-2 text-xs font-medium text-blue-800 bg-blue-100 rounded-full whitespace-nowrap">
                          {creatorData.subscriptionType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex-shrink-0 text-gray-500 whitespace-nowrap">
                          Language:
                        </span>
                        <span className="ml-2 font-medium text-gray-900 truncate">
                          {creatorData.language}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex-shrink-0 text-gray-500 whitespace-nowrap">
                          Price:
                        </span>
                        <span className="ml-2 font-medium text-gray-900 truncate">
                          {creatorData.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex-shrink-0 text-gray-500 whitespace-nowrap">
                          Payout Percentage:
                        </span>
                        <span className="ml-2 font-medium text-gray-900 truncate">
                          {creatorData.payoutPercentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex-shrink-0 text-gray-500 whitespace-nowrap">
                          Last Updated:
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                          {formatDate(creatorData.lastUpdated)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex-shrink-0 text-gray-500 whitespace-nowrap">
                          Time zone:
                        </span>
                        <span className="ml-2 font-medium text-gray-900 truncate">
                          {creatorData.timezone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-x-auto border-b border-gray-200">
            <nav className="flex px-8 space-x-8">
              {[
                { id: 'rules', label: 'SFS Rules' },
                { id: 'sfs-history', label: 'SFS History' },
                { id: 'vault', label: 'Vault' },
                { id: 'promo-links', label: 'Promo links' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'rules' && (
              <div className="space-y-8">
                <div className="flex justify-end">
                  <button
                    onClick={handleEditRules}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Rules
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Max SFS Per Day
                    </h4>
                    <p className="text-sm text-gray-600">
                      {creatorData.rules.maxSfsPerDay}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Content Allowed
                    </h4>
                    <div className="space-y-1">
                      {creatorData.rules.contentAllowed.map(
                        (content, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {content}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Pin Content
                    </h4>
                    <p className="text-sm text-gray-600">
                      {creatorData.rules.pinContent}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sfs-history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    SFS History
                  </h3>
                  <div className="text-sm text-gray-500">
                    {selectedSFS.length} of {sfsHistory.length} selected
                  </div>
                </div>

                {sfsHistoryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-600">Loading SFS history...</p>
                    </div>
                  </div>
                ) : sfsHistory.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No SFS history yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedSFS.length === sfsHistory.length && sfsHistory.length > 0
                            }
                            onCheckedChange={handleSelectAllSFS}
                          />
                        </TableHead>
                        <TableHead className="w-24">Media</TableHead>
                        <TableHead className="w-48">Date</TableHead>
                        <TableHead className="w-32">Creators</TableHead>
                        <TableHead className="w-24">Content Slot</TableHead>
                        <TableHead className="w-40">Promo Link Name</TableHead>
                        <TableHead className="w-64">Promo Link URL</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sfsHistory.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSFS.includes(entry.id)}
                              onCheckedChange={() => handleSFSSelect(entry.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="w-16 h-16 overflow-hidden rounded-lg">
                              <Image
                                src={entry.media.thumbnail}
                                alt={entry.media.alt}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-900">
                            {entry.date}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900">
                            {entry.creator}
                          </TableCell>
                          <TableCell className="text-sm text-gray-900">
                            {entry.contentSlot}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-900">
                            {entry.promoLinkName || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.promoLink && entry.promoLink !== '#' ? (
                              <a
                                href={entry.promoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 truncate hover:text-blue-800 max-w-48"
                              >
                                {entry.promoLink}
                              </a>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadge(entry.status)}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}

            {activeTab === 'vault' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Vault</h3>
                  <div className="text-sm text-gray-500">
                    {vaultData.length} media items
                  </div>
                </div>

                {vaultLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-600">Loading vault media...</p>
                    </div>
                  </div>
                ) : vaultData.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No media items in vault yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {vaultData.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleVaultItemClick(item)}
                        className="overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer group hover:shadow-md"
                      >
                        <div className="overflow-hidden aspect-video">
                          <Image
                            src={item.imageUrl}
                            alt="Vault media"
                            width={400}
                            height={300}
                            className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'promo-links' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Promo Links
                  </h3>
                  <button
                    onClick={handleAddPromoLink}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-center w-5 h-5 mr-2 border-2 border-blue-600 rounded-full">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    Add Promo link
                  </button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Short Link</TableHead>
                      <TableHead className="w-1/3">OF URL</TableHead>
                      <TableHead className="w-1/3">Created</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {promoLinks.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="py-6 text-center text-gray-500"
                        >
                          No promo links yet.
                        </TableCell>
                      </TableRow>
                    )}

                    {promoLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          {link.short_code ? (
                            <a
                              href={`/t/${link.short_code}`}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              {typeof window !== 'undefined'
                                ? `${window.location.origin}/t/${link.short_code}`
                                : `/t/${link.short_code}`}
                            </a>
                          ) : (
                            <span className="italic text-gray-400">
                              Pending short code
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <a
                            href={link.url}
                            target="_blank"
                            className="text-blue-600 underline break-all"
                          >
                            {link.url}
                          </a>
                        </TableCell>

                        <TableCell>
                          {link.created_at
                            ? new Date(link.created_at).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Rules Modal */}
      <SFSRulesModal
        isOpen={showEditRulesModal}
        onClose={handleCloseEditRules}
        onSave={handleSaveRules}
        isLoading={isSavingRules}
        initialData={{
          maxSfsPerDay: creatorData?.rules.maxSfsPerDay ?? 3,
          contentAllowed: creatorData?.rules.contentAllowed ?? [],
          massDM: false,
          pinContent: (creatorData?.rules.pinContent as "Accept All" | "Accept Only") ?? 'Accept All',
          fanCount: '80%',
          contentType: 'Topless'
        }}
      />

      {/* Vault Media Details Modal */}
      <MediaDetailsModal
        isOpen={showVaultModal}
        onClose={handleCloseVaultModal}
        details={
          selectedVaultItem
            ? {
                date: selectedVaultItem.date,
                imageUrl: selectedVaultItem.imageUrl,
                category: selectedVaultItem.category,
                hashtags: selectedVaultItem.hashtags,
                caption: selectedVaultItem.caption,
                notes: selectedVaultItem.notes
              }
            : null
        }
        showSaveButton={false}
      />

      {/* Add Promo Link Modal */}
      <AddPromoLinkModal
        isOpen={showAddPromoModal}
        onClose={handleCloseAddPromoModal}
        onSave={handleSavePromoLink}
      />

      {/* SFS Settings Modal */}
      <SFSSettingsModal
        isOpen={showSFSSettingsModal}
        onClose={() => setShowSFSSettingsModal(false)}
      />
    </div>
  );
};
