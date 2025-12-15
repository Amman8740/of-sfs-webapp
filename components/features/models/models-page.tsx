"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ModelsIcon, GridIcon } from '@/components/ui/icons';
import { AddModelsButton, PrimaryButton } from '@/components/ui/button';
import { AddModelModal, ModelFormData } from './add-model-modal';
import { ModelCard } from './model-card';
import { Pagination } from '@/components/ui';
import { toast } from 'sonner';
// Removed useModels - now using server-provided data
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

interface ModelsPageProps {
  // Keep these for backward compatibility, but we'll use SWR internally
  data?: any;
  mutateData?: () => void;
  onModelClick?: (modelId: string) => void;
  userType?: 'agency' | 'creator';
}

export const 
ModelsPage: React.FC<ModelsPageProps> = ({ data, onModelClick, userType }) => {
  const router = useRouter();
  const handleDeleteModel = async (id: string) => {
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        toast.error('Delete failed');
        return;
      }
      toast.success('Model deleted');
      mutate();
    } catch {
      toast.error('Delete failed');
    }
  };
  // Use server-provided data instead of client-side SWR
  const models = data || [];
  const isLoading = false;
  const error = null;
  const mutate = () => {}; // No-op since we're using server data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Pagination settings
  const itemsPerPage = viewMode === 'grid' ? 12 : 10;
  const totalPages = Math.ceil((models?.length || 0) / itemsPerPage);
  
  // Calculate which models to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentModels = models?.slice(startIndex, endIndex) || [];

  const handleAddModel = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'table' ? 'grid' : 'table');
  };


  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSubmitModel = async (modelData: ModelFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to create model';
        toast.error('Failed to create model', {
          description: errorMessage,
        });
        return;
      }

     
      mutate();
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('An unexpected error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC] rounded-tl-xl">
        <div className="pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Models</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading models...</div>
        </div>
      </div>
    );
  }

  // Show error state (this should never happen with server data, but keeping for safety)
  if (error) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC] rounded-tl-xl">
        <div className="pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Models</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">Error loading models: Unknown error</div>
        </div>
      </div>
    );
  }

  // If we have models, show them in a table
  if (models && models.length > 0) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC] rounded-tl-xl">
        {/* Header with Add Button and View Toggle */}
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Models</h1>
          <div className="flex items-center space-x-3">
            {/* View Toggle Button */}
            <button
              onClick={toggleViewMode}
              className={`p-2 rounded-lg border transition-colors ${
                viewMode === 'grid' 
                  ? 'text-white border-transparent' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              style={viewMode === 'grid' ? { backgroundColor: '#0091FF' } : {}}
              title={viewMode === 'table' ? 'Switch to Grid View' : 'Switch to Table View'}
            >
              <GridIcon className="w-5 h-5" />
            </button>
            {userType === 'agency' && (
              <AddModelsButton 
                onClick={handleAddModel} 
                size="small"
              />
            )}
          </div>
        </div>

        {/* Models Display - Table or Grid */}
        {viewMode === 'table' ? (
          <div className="overflow-hidden rounded-lg shadow">
            <table className="min-w-full divide-y divide-[#FCFCFC]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    <div className="flex items-center space-x-1">
                      <span>Model</span>
                      <div className="flex flex-col">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-3 h-3 -mt-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    <div className="flex items-center space-x-1">
                      <span>Fan count</span>
                      <div className="flex flex-col">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-3 h-3 -mt-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    <div className="flex items-center space-x-1">
                      <span>Subscription type</span>
                      <div className="flex flex-col">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-3 h-3 -mt-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <div className="flex flex-col">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-3 h-3 -mt-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    <div className="flex items-center space-x-1">
                      <span>Verified on</span>
                      <div className="flex flex-col">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-3 h-3 -mt-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Options
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentModels.map((model: any) => (
                  <tr key={model.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{model.name}</div>
                      {model.username && (
                        <div className="text-sm text-gray-500">@{model.username}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {model.fan_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        model.subscription_type === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : model.subscription_type === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {model.subscription_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {model.is_verified ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                          Not Verified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {model.verification_date 
                        ? new Date(model.verification_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 text-gray-400 transition-colors bg-gray-100 rounded-full hover:text-gray-600 hover:bg-gray-200">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white min-w-[160px] shadow-lg rounded-lg ring-1 ring-gray-200">
                          <DropdownMenuItem onSelect={() => router.push(`/models/${model.id}`)}>
                            <span className="block px-2 py-1 transition-colors rounded hover:bg-gray-100">View profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => console.log('Upload media:', model.id)}>
                            <span className="block px-2 py-1 transition-colors rounded hover:bg-gray-100">Upload media</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onSelect={() => handleDeleteModel(model.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {currentModels.map((model: any) => (
              <div 
                key={model.id} 
                className="relative flex items-center justify-between p-4 transition-shadow bg-white rounded-lg hover:shadow-md"
                style={{
                  width: '100%',
                  minHeight: '137px',
                  boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Options Menu - Top Right */}
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white rounded-lg shadow-lg ring-1 ring-gray-200">
                      <DropdownMenuItem 
                        onSelect={() => router.push(`/models/${model.id}`)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        View profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onSelect={() => console.log('Upload media:', model.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Upload media
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onSelect={() => console.log('Delete:', model.id)}
                        className="w-full px-4 py-2 text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Profile Picture - Left Side */}
                <div className="flex-shrink-0 mr-6">
                  <div 
                    className="flex items-center justify-center overflow-hidden bg-gray-200 rounded-lg"
                    style={{
                      width: '108.85638427734375px',
                      height: '108.85638427734375px'
                    }}
                  >
                    {model.display_picture_url ? (
                      <Image 
                        src={model.display_picture_url} 
                        alt={model.name} 
                        width={109}
                        height={109}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
                        }}
                      />
                    ) : null}
                    <div 
                      className="flex items-center justify-center w-full h-full bg-gray-200"
                      style={{ display: model.display_picture_url ? 'none' : 'flex' }}
                    >
                      <svg 
                        className="w-12 h-12 text-gray-400" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Content - Right Side */}
                <div className="flex flex-col justify-between flex-1 h-full">
                  <div>
                    {/* Model Name */}
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{model.name}</h3>
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Fans:</span> {model.fan_count.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Sub type:</span> 
                        <span className={`ml-1 ${
                          model.subscription_type === 'Paid' 
                            ? 'text-green-600' 
                            : model.subscription_type === 'Pending'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {model.subscription_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Verification Badge - Bottom */}
                  <div className="mt-3">
                    {model.is_verified ? (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-md">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-md">
                        Not Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {models.length > 0 && (
          <div className="flex items-center justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showInfo={true}
              totalItems={models.length}
              itemsPerPage={itemsPerPage}
              currentItemsStart={startIndex + 1}
              currentItemsEnd={Math.min(endIndex, models.length)}
              itemLabel="Models"
            />
          </div>
        )}

        {/* Add Model Modal */}
        <AddModelModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModel}
        />
      </div>
    );
  }

  // Empty state when no models
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Models</h1>
      </div>

      {/* Content Area */}
      <div className="flex items-center justify-center min-h-[500px]">
        <div 
          className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
          style={{
            maxWidth: '448px',
            width: '100%',
            minHeight: '410px'
          }}
        >
          {/* Icon and Text Section */}
          <div className="flex flex-col items-center justify-center flex-grow gap-6 mb-8">
            {/* Models Icon - Made larger and properly centered */}
            <div className="flex items-center justify-center">
              <ModelsIcon className="w-32 h-32 text-gray-300" />
            </div>

            {/* Text Content */}
            <div className="text-center">
              <h3 className="mb-3 text-lg font-medium text-gray-900">
                {userType === 'creator' ? 'No Models Available' : 'No Models Found'}
              </h3>
              <p className="max-w-sm leading-relaxed text-center text-gray-500">
                {userType === 'creator' 
                  ? 'You don\'t have any models assigned yet.'
                  : 'Start by adding your first creator profile to manage profiles'
                }
              </p>
            </div>
          </div>

          {/* Add Model Button - Positioned at bottom, only for agency */}
          {userType === 'agency' && (
            <div className="flex justify-center w-full">
              <AddModelsButton 
                onClick={handleAddModel}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Model Modal */}
      {userType === 'agency' && (
        <AddModelModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModel}
        />
      )}
    </div>
  );
};
