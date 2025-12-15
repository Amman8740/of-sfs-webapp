'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SFSRulesModal } from './sfs-rules-modal';
import { MediaDetailsModal } from '../scheduler/media-details-modal';
import { AddPromoLinkModal } from './add-promo-link-modal';
import { SFSSettingsModal } from '../scheduler/sfs-settings-modal';
import { EditIcon, SFSFilterIcon, TrashIcon } from '@/components/ui/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
  Button,
  IconButton
} from '@/components/ui';
import { Badge } from '@/components/ui/badge';

interface ModelInfoPageProps {
  modelId: string;
  modelUserId?: string;
  initialModelData?: any;
  userType?: 'agency' | 'creator';
}

interface ModelData {
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
  status: 'Done' | 'Pending' | 'Failed' | string;
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

interface PromoLink {
  id: string;
  label: string;
  type: string;
  url: string;
}

const mockModelData: ModelData = {
  id: '1',
  name: 'John Doe',
  username: 'john_doe iiii',
  profileImage:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  price: '$200/mon',
  fans: 1985145,
  payoutPercentage: 70,
  subscriptionType: 'Paid',
  lastUpdated: '17, Jul 2025 (10:30AM)',
  language: 'English',
  timezone: 'GMT+5',
  verified: true,
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

const mockPromoLinksData: PromoLink[] = [
  {
    id: '1',
    label: 'Free Trial',
    type: 'Trial',
    url: 'https://onlyfans.com/modelname/free'
  },
  {
    id: '2',
    label: 'Premium Access',
    type: 'Subscription',
    url: 'https://onlyfans.com/modelname/premium'
  },
  {
    id: '3',
    label: 'VIP Package',
    type: 'VIP',
    url: 'https://onlyfans.com/modelname/vip'
  },
  {
    id: '4',
    label: 'Special Offer',
    type: 'Promotion',
    url: 'https://onlyfans.com/modelname/special'
  },
  {
    id: '5',
    label: 'Exclusive Content',
    type: 'Exclusive',
    url: 'https://onlyfans.com/modelname/exclusive'
  }
];

export const ModelInfoPage: React.FC<ModelInfoPageProps> = ({
  modelId,
  modelUserId,
  initialModelData,
  userType
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'rules' | 'sfs-history' | 'vault' | 'promo-links'
  >('rules');
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditRulesModal, setShowEditRulesModal] = useState(false);
  const [selectedSFS, setSelectedSFS] = useState<string[]>([]);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [selectedVaultItem, setSelectedVaultItem] =
    useState<VaultMediaItem | null>(null);
  const [promoLinks, setPromoLinks] = useState<PromoLink[]>(mockPromoLinksData);
  const [sfsHistory, setSfsHistory] = useState<SFSHistoryEntry[]>([]);
  const [sfsHistoryLoading, setSfsHistoryLoading] = useState(false);
  const [vaultData, setVaultData] = useState<VaultMediaItem[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [showSFSSettingsModal, setShowSFSSettingsModal] = useState(false);
  const [sfsRules, setSfsRules] = useState<any>(null);
  const [sfsRulesLoading, setSfsRulesLoading] = useState(false);

  // Function to format date from ISO string to readable format
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

  // 🔹 FETCH VAULT MEDIA BY model_id (LATEST 3 ONLY)
  useEffect(() => {
    async function fetchVaultMedia() {
      if (!modelId || !modelUserId) return;

      setVaultLoading(true);
      try {
        // Fetch vault data for the model's user_id
        const response = await fetch(`/api/vault?user_id=${modelUserId}`);
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
  }, [modelId, modelUserId, activeTab]);

  // 🔹 FETCH SFS HISTORY BY user_id
  useEffect(() => {
    async function fetchSFSHistory() {
      if (!modelUserId) return;

      setSfsHistoryLoading(true);
      try {
        const response = await fetch(`/api/scheduled-sfs?user_id=${modelUserId}`);
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
  }, [modelUserId, activeTab]);

  // 🔹 FETCH SFS RULES BY user_id
  useEffect(() => {
    async function fetchSFSRules() {
      if (!modelUserId) return;

      setSfsRulesLoading(true);
      try {
        const response = await fetch(`/api/sfs-rules?user_id=${modelUserId}`);
        const result = await response.json();

        console.log('📋 SFS Rules Response:', result);

        if (result.success && result.data) {
          setSfsRules(result.data);
        }
      } catch (error) {
        console.error('Error fetching SFS rules:', error);
        setSfsRules(null);
      } finally {
        setSfsRulesLoading(false);
      }
    }

    fetchSFSRules();
  }, [modelUserId]);

  useEffect(() => {
    if (initialModelData) {
      const of = initialModelData.onlyfans_profile || {};

      const serverModelData: ModelData = {
        id: initialModelData.id,
        name: of.display_name || initialModelData.name || 'Unnamed Model',
        username: of.username || initialModelData.username || 'unknown',
        profileImage:
          of.profile_image_url ||
          initialModelData.display_picture_url ||
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop&crop=face',
        price:
          of.price != null
            ? `$${parseFloat(of.price).toFixed(2)} / mon`
            : initialModelData.price
              ? `$${parseFloat(initialModelData.price).toFixed(2)} / mon`
              : 'N/A',
        fans: of.fans ?? initialModelData.fan_count ?? 0,
        payoutPercentage: initialModelData.payout_percentage ?? 0,
        subscriptionType:
          of.subscription_type || initialModelData.subscription_type || 'Paid',
        lastUpdated: of.last_updated || initialModelData.last_updated,
        language: initialModelData.language || 'English',
        timezone: initialModelData.timezone || 'GMT+5',
        verified: of.is_verified ?? initialModelData.is_verified ?? false,
        rules: sfsRules ? {
          maxSfsPerDay: sfsRules.maxSfsPerDay || 3,
          contentAllowed: sfsRules.contentAllowed || ['Fully Explicit', 'Topless', 'SFW Only'],
          pinContent: sfsRules.pinContent || 'Accept All'
        } : {
          maxSfsPerDay: 3,
          contentAllowed: ['Fully Explicit', 'Topless', 'SFW Only'],
          pinContent: 'Accept All'
        }
      };

      setModelData(serverModelData);
      setIsLoading(false);
    } else {
      // Fallback to mock data
      const timer = setTimeout(() => {
        setModelData(mockModelData);
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [modelId, initialModelData, sfsRules]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleEditRules = () => {
    setShowEditRulesModal(true);
  };

  const handleCloseEditRules = () => {
    setShowEditRulesModal(false);
  };

  const handleSaveRules = () => {
    // Handle save logic here
    console.log('Saving rules...');
    setShowEditRulesModal(false);
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
    
    if (normalizedStatus === 'posted' || normalizedStatus === 'done') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (normalizedStatus === 'pending' || normalizedStatus === 'scheduled') {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    } else if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled') {
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

  const handleDeletePromoLink = (id: string) => {
    setPromoLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleAddPromoLink = () => {
    setShowAddPromoModal(true);
  };

  const handleCloseAddPromoModal = () => {
    setShowAddPromoModal(false);
  };

  const handleSavePromoLink = (promoData: Omit<PromoLink, 'id'>) => {
    const newLink: PromoLink = {
      id: Date.now().toString(),
      ...promoData
    };
    setPromoLinks((prev) => [...prev, newLink]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-canvas-text-contrast">
            Loading model profile...
          </p>
        </div>
      </div>
    );
  }

  if (!modelData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-canvas-text-contrast">Model not found</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Models
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
              className="p-2 text-gray-400 transition-colors hover:text-canvas-text-contrast"
              title="Back to Models"
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
            <h1 className="text-2xl font-bold text-canvas-text-contrast">
              Models
            </h1>
          </div>
        </div>

        {/* Main White Card */}
        <div className="w-full overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Model Profile Section */}
          <div className="p-8">
            {/* Name above both picture and stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center lg:text-left">
                <h2 className="mb-2 text-2xl font-bold text-canvas-text-contrast">
                  {modelData.name}
                </h2>
              </div>
              {userType === 'agency' && (
                <button
                  onClick={() => setShowSFSSettingsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#96C7F2] bg-[#F5FAFF] text-[#0091FF] hover:bg-[#EDF6FF] transition-colors"
                  style={{ width: '142px', height: '40px' }}
                >
                  <SFSFilterIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">SFS Settings</span>
                </button>
              )}
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
                    src={modelData.profileImage}
                    alt={modelData.name}
                    width={293}
                    height={293}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Right Column - Stats Card */}
              <div className="w-full min-w-0">
                {/* Stats Card */}
                <div className="flex flex-col w-full p-4 space-y-2 overflow-hidden bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-canvas-text-contrast">
                      Stats
                    </h3>
                    {modelData.verified && (
                      <Badge status={'success'} text={'Verified'} />
                    )}
                  </div>
                  

                  <div className="grid grid-cols-1 gap-16 text-sm md:grid-cols-2">
                    <div className="min-w-0 space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="flex-shrink-0 font-medium text-canvas-text-contrast whitespace-nowrap">
                          Username:
                        </span>
                        <span className="ml-2 font-medium truncate text-canvas-text-contrast">
                          @{modelData.username}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="flex-shrink-0 font-medium text-canvas-text-contrast whitespace-nowrap">
                          Fans:
                        </span>
                        <span className="ml-2 font-medium truncate text-canvas-text-contrast">
                          {formatNumber(modelData.fans)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="flex-shrink-0 font-medium text-canvas-text-contrast whitespace-nowrap">
                          Subscription Type:
                        </span>
                        <Badge
                          status={'info'}
                          text={modelData.subscriptionType}
                          noFixedHeight={true}
                        />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="flex-shrink-0 font-medium text-canvas-text-contrast whitespace-nowrap">
                          Language:
                        </span>
                        <span className="ml-2 font-medium truncate text-canvas-text-contrast">
                          {modelData.language}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="flex-shrink-0 font-medium text-canvas-text-contrast whitespace-nowrap">
                          Price:
                        </span>
                        <span className="ml-2 font-medium truncate text-canvas-text-contrast">
                          {modelData.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="flex-shrink-0 font-medium text-canvas-text-contrast whitespace-nowrap">
                          Payout Percentage:
                        </span>
                        <span className="ml-2 font-medium truncate text-canvas-text-contrast">
                          {modelData.payoutPercentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 ">
                        <span className="flex-shrink-0 font-medium text-canvas-text-contrast whitespace-nowrap">
                          Last Updated:
                        </span>
                        <span className="ml-2 text-sm font-medium text-canvas-text-contrast">
                          {formatDate(modelData.lastUpdated)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 ">
                        <span className="flex-shrink-0 font-medium text-canvas-text-contrast whitespace-nowrap">
                          Time zone:
                        </span>
                        <span className="ml-2 font-medium truncate text-canvas-text-contrast">
                          {modelData.timezone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {(initialModelData?.onlyfans_profile?.bio || initialModelData?.onlyfans_profile?.onlyfans_url) && (
                  <div className="flex flex-col w-full p-4 mt-6 space-y-4 overflow-hidden bg-white border border-gray-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-canvas-text-contrast">
                      Profile Information
                    </h3>
                    <div className="h-px bg-gray-200" />
                    {initialModelData?.onlyfans_profile?.bio && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-canvas-text-contrast">Bio</h4>
                        <p className="text-sm leading-relaxed text-canvas-text-contrast">
                          {initialModelData.onlyfans_profile.bio}
                        </p>
                      </div>
                    )}
                    {initialModelData?.onlyfans_profile?.onlyfans_url && (
                      <div className="pt-2">
                        <a
                          href={initialModelData.onlyfans_profile.onlyfans_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0091FF] rounded-lg hover:bg-[#007EE5] transition-colors"
                        >
                          Visit OnlyFans Profile
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-row items-center justify-between px-4 border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'rules', label: 'Model Rules' },
                { id: 'sfs-history', label: 'SFS History' },
                { id: 'vault', label: 'Vault' },
                { id: 'promo-links', label: 'Promo links' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap border-canvas-line ${
                    activeTab === tab.id
                      ? 'border-primary-solid text-canvas-text-contrast'
                      : 'border-transparent text-canvas-text hover:text-canvas-text-contrast hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="flex justify-end">
              {activeTab === 'rules' && (
                <Button
                  color="primary"
                  size="medium"
                  variant="surface"
                  onClick={handleEditRules}
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
                </Button>
              )}
              {activeTab === 'promo-links' && (
                <Button
                  color="primary"
                  size="medium"
                  variant="surface"
                  onClick={handleAddPromoLink}
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
                  Add Promo Link
                </Button>
              )}
              {/* <button
                onClick={handleEditRules}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Rules
              </button> */}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'rules' && (
              <div className="space-y-8">
                <div className="space-y-8">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-canvas-text-contrast">
                      Max SFS Per Day
                    </h4>
                    <p className="text-sm text-canvas-text-contrast">
                      {modelData.rules.maxSfsPerDay}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-canvas-text-contrast">
                      Content Allowed
                    </h4>
                    <div className="space-y-1">
                      {modelData.rules.contentAllowed.map((content, index) => (
                        <p
                          key={index}
                          className="text-sm text-canvas-text-contrast"
                        >
                          {content}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-canvas-text-contrast">
                      Pin Content
                    </h4>
                    <p className="text-sm text-canvas-text-contrast">
                      {modelData.rules.pinContent}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sfs-history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-canvas-text-contrast">
                    SFS History
                  </h3>
                  <div className="text-sm text-canvas-text-contrast">
                    {selectedSFS.length} of {sfsHistory.length} selected
                  </div>
                </div>

                {sfsHistoryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-canvas-text-contrast">Loading SFS history...</p>
                    </div>
                  </div>
                ) : sfsHistory.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-canvas-text-contrast">No SFS history yet</p>
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
                          <TableCell className="text-sm font-medium text-canvas-text-contrast">
                            {entry.date}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-canvas-text-contrast">
                            {entry.creator}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-canvas-text-contrast">
                            {entry.contentSlot}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-canvas-text-contrast">
                            {entry.promoLinkName || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.promoLink && entry.promoLink !== '#' ? (
                              <a
                                href={entry.promoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block font-medium truncate text-canvas-text-contrast max-w-48"
                              >
                                {entry.promoLink}
                              </a>
                            ) : (
                              <span className="text-canvas-text">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              status={
                                entry.status.toLowerCase() === 'posted' || entry.status.toLowerCase() === 'done'
                                  ? 'success'
                                  : entry.status.toLowerCase() === 'pending' || entry.status.toLowerCase() === 'scheduled'
                                    ? 'info'
                                    : 'warning'
                              }
                              text={entry.status.charAt(0).toUpperCase() + entry.status.slice(1).toLowerCase()}
                            />
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
                  <h3 className="text-lg font-semibold text-canvas-text-contrast">
                    Vault
                  </h3>
                  <div className="text-sm text-canvas-text-contrast">
                    {vaultData.length} latest media items
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3 font-bold text-canvas-text">
                        Label
                      </TableHead>
                      <TableHead className="w-1/4 font-bold text-canvas-text">
                        Type
                      </TableHead>
                      <TableHead className="w-1/2 font-bold text-canvas-text">
                        URL
                      </TableHead>
                      {/* <TableHead className="w-16">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoLinks.map((link) => (
                      <TableRow key={link.id} className="h-16">
                        <TableCell className="py-4 font-medium text-canvas-text-contrast">
                          {link.label}
                        </TableCell>
                        <TableCell className="py-4 font-medium text-canvas-text-contrast">
                          {link.type}
                        </TableCell>
                        <TableCell className="py-4 font-medium text-canvas-text-contrast">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-canvas-text-contrast hover:underline"
                          >
                            {link.url}
                          </a>
                        </TableCell>
                        <TableCell className="py-4">
                          <IconButton
                            variant="gray"
                            size="small"
                            type="ghost"
                            onClick={() => handleDeletePromoLink(link.id)}
                            title="Delete promo link"
                            icon={<TrashIcon className="w-4 h-4" />}
                          />
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
        initialData={{
          maxSfsPerDay: modelData?.rules?.maxSfsPerDay ?? 3,
          contentAllowed: modelData?.rules?.contentAllowed ?? [],
          massDM: false,
          pinContent: 'Accept All' as "Accept All" | "Accept Only",
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
