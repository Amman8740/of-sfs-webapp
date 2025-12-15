import React from 'react';
import { 
  ModelsPage, 
  SchedulerPage, 
  PromoLinksPage, 
  MediaUploadPage, 
  NotificationsPage, 
  ProfilePage,
  CreatorProfilePage,
  ModelInfoPage,
  AccountPage,
  PeoplePage,
} from '@/components/features';
import { AgencySFSRequestsPage } from './scheduler/agency-sfs-requests-page';

interface ContentSwitcherProps {
  selectedOption: string;
  modelId?: string;
  modelUserId?: string;
  initialModelData?: any;
  modelsData?: any[];
  userType?: 'agency' | 'creator';
  data?: {
    userData?: Record<string, unknown> | null;
    userProfile?: Record<string, unknown> | null;
    subscriptionData?: Record<string, unknown> | null;
    productsData?: Record<string, unknown>[] | null;
    customerData?: Record<string, unknown> | null;
    pricesData?: Record<string, unknown>[] | null;
  };
  mutateFunctions?: {
    mutateUserData?: () => void;
    mutateSubscriptionData?: () => void;
    mutateProductsData?: () => void;
    mutateCustomerData?: () => void;
    mutatePricesData?: () => void;
  };
}

export const ContentSwitcher: React.FC<ContentSwitcherProps> = ({ 
  selectedOption, 
  modelId,
  modelUserId,
  initialModelData,
  modelsData,
  userType,
  data, 
  mutateFunctions,
}) => {
  const renderContent = () => {
    switch (selectedOption) {
      case 'models':
        return <ModelsPage data={modelsData || []} mutateData={() => {}} userType={userType} onModelClick={(modelId) => {
          // This will be handled by the parent component
          console.log('Model clicked from content switcher:', modelId);
        }} />;
      case 'model-details':
        return <ModelInfoPage modelId={modelId || ''} modelUserId={modelUserId} userType={userType} initialModelData={initialModelData} />;
      case 'scheduler':
      case 'scheduled-sfs':
      case 'smart-match':
        return <SchedulerPage data={[]} mutateData={() => {}} selectedOption={selectedOption} userType={userType} />;
      case 'sfs-requests':
        // For agency users, show agency-specific SFS requests page
        // For creator users, show creator SFS requests page
        return userType === 'agency' 
          ? <AgencySFSRequestsPage />
          : <SchedulerPage data={[]} mutateData={() => {}} selectedOption={selectedOption} userType={userType} />;
      case 'promo-links':
        return <PromoLinksPage />;
      case 'media-upload':
        return <MediaUploadPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'people':
        return <PeoplePage />;
     case 'profile':
  console.log('ContentSwitcher - Profile case:', { 
    userType, 
    userData: data?.userData, 
    userProfile: data?.userProfile, 
    initialModelData 
  });
  return userType === 'creator'
    ? (
        <CreatorProfilePage
          // ✅ use server-fetched creator model data
          initialCreatorData={initialModelData || data?.userData}
          userProfile={data?.userProfile}
        />
      )
    : (
        <ProfilePage data={[]} mutateData={() => {}} />
      );
      case 'account':
        return <AccountPage />;
      default:
        console.log('-------------------default-------------------')
        return <ModelsPage data={modelsData || []} mutateData={() => {}} onModelClick={(modelId) => {
          // This will be handled by the parent component
          console.log('Model clicked from content switcher:', modelId);
        }} />;
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};
