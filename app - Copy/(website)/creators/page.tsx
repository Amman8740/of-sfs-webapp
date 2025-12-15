'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui';
import { toast } from 'sonner';

interface Model {
  id: string;
  name: string;
  username: string;
  email: string;
  display_picture_url?: string;
  onlyfans_link?: string;
  telegram_link?: string;
  fan_count: number;
  subscription_type: string;
  is_verified: boolean;
  verification_date?: string;
  language?: string;
  timezone?: string;
  price?: number;
  status: string;
  created_at: string;
}

interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  pages: number;
}

export default function CreatorsListPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 12,
    offset: 0,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  useEffect(() => {
    fetchModels();
  }, [currentPage, searchTerm, showVerifiedOnly]);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * pagination.limit;
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString(),
        status: 'Active',
        verified: showVerifiedOnly ? 'true' : 'false'  // Show all or verified only
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/models/public?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      
      if (data.success) {
        setModels(data.data);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to load creators');
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Error loading creators');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && models.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">Loading creators...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Explore Creators</h1>
          <p className="text-gray-600">Browse and discover amazing creators on our platform</p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
          <input
            type="text"
            placeholder="Search creators by name or username..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Filters and View Toggle */}
          <div className="flex items-center space-x-2">
            {/* Verified Filter Toggle */}
            <button
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
              className={`px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${
                showVerifiedOnly
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              title="Show verified creators only"
            >
              ✓ Verified Only
            </button>
            
            {/* View Toggle Button */}
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V3z" />
                <path d="M5 11a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg border transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              title="Table View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {models.length} of {pagination.total} creators
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <>
            {models.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
                {models.map((model) => (
                  <a
                    key={model.id}
                    href={`/creators/${model.id}`}
                    className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-lg"
                  >
                    {/* Profile Picture */}
                    <div className="relative w-full h-48 bg-gray-200">
                      {model.display_picture_url ? (
                        <Image
                          src={model.display_picture_url}
                          alt={model.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-300">
                          <span className="text-gray-600">No Image</span>
                        </div>
                      )}
                      {model.is_verified && (
                        <div className="absolute px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full top-2 right-2">
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">{model.name}</h3>
                      <p className="mb-3 text-sm text-gray-500">@{model.username}</p>

                      {/* Stats */}
                      <div className="mb-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fans:</span>
                          <span className="font-semibold">{model.fan_count.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-semibold">{model.subscription_type}</span>
                        </div>
                        {model.price && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold">${model.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Links */}
                      <div className="flex gap-2">
                        {model.onlyfans_link && (
                          <a
                            href={model.onlyfans_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 text-xs font-medium text-center text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
                          >
                            OnlyFans
                          </a>
                        )}
                        {model.telegram_link && (
                          <a
                            href={model.telegram_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 text-xs font-medium text-center text-white transition-colors bg-blue-400 rounded hover:bg-blue-500"
                          >
                            Telegram
                          </a>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">No creators found. Try adjusting your search.</p>
              </div>
            )}
          </>
        ) : (
          /* Table View */
          <>
            {models.length > 0 ? (
              <div className="mb-8 overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Creator</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fan Count</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Subscription</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Links</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {models.map((model) => (
                      <tr key={model.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/creators/${model.id}`)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              {model.display_picture_url ? (
                                <Image
                                  src={model.display_picture_url}
                                  alt={model.name}
                                  width={40}
                                  height={40}
                                  className="object-cover rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{model.name}</div>
                              <div className="text-sm text-gray-500">@{model.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {model.fan_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            model.subscription_type === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : model.subscription_type === 'Free'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {model.subscription_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          ${model.price || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {model.is_verified ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 space-x-2 text-sm whitespace-nowrap">
                          {model.onlyfans_link && (
                            <a
                              href={model.onlyfans_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                              OF
                            </a>
                          )}
                          {model.telegram_link && (
                            <a
                              href={model.telegram_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-2 py-1 text-xs text-white bg-blue-400 rounded hover:bg-blue-500"
                            >
                              TG
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">No creators found. Try adjusting your search.</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
