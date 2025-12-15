'use client';

import { useState, useEffect } from 'react';

interface AgencyCodeSectionProps {
  userId: string;
}

export default function AgencyCodeSection({ userId }: AgencyCodeSectionProps) {
  const [agencyCode, setAgencyCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgencyCode = async () => {
      try {
        if (!userId) {
          setError('User ID not available');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        console.log('Fetching agency code for user:', userId);

        // Try to get the code using the new endpoint
        const response = await fetch('/api/agency/code', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Error response:', data);
          setError(data.error || 'Failed to load agency code');
          setIsLoading(false);
          return;
        }

        if (data.code) {
          console.log('Agency code found:', data.code);
          setAgencyCode(data.code);
          setError('');
        } else if (response.status === 200 && !data.code) {
          // Code doesn't exist yet, try to generate it
          console.log('No code found, attempting to generate...');
          const generateResponse = await fetch('/api/agency/code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const generateData = await generateResponse.json();

          if (!generateResponse.ok) {
            console.error('Generate error:', generateData);
            setError(generateData.error || 'Failed to generate agency code');
            setIsLoading(false);
            return;
          }

          if (generateData.code) {
            console.log('Agency code generated:', generateData.code);
            setAgencyCode(generateData.code);
            setError('');
          } else {
            setError('Failed to generate agency code');
          }
        } else {
          setError('Unable to load or generate agency code');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchAgencyCode();
    }
  }, [userId]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(agencyCode);
      setIsCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy code');
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
        <div className="grid grid-cols-2">
          <div className="p-8 bg-[#FCFCFC]">
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Agency Code</h2>
            <p className="text-gray-600">Share this unique code with creators to allow them to join your agency.</p>
          </div>
          <div className="flex items-center justify-center p-8 bg-white">
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
      <div className="grid grid-cols-2">
        {/* Left section - Title and description */}
        <div className="p-8 bg-[#FCFCFC]">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">Agency Code</h2>
          <p className="text-gray-600">
            Share this unique code with creators to allow them to join your agency.
          </p>
        </div>
        
        {/* Right section - Code display and copy button */}
        <div className="flex flex-col justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 rounded-lg bg-red-50">
                <p className="font-medium">{error}</p>
                <p className="mt-2 text-xs opacity-75">
                 Share this unique code with creators to allow them to join your agency.
                </p>
              </div>
            )}

            {agencyCode && !error ? (
              <>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="mb-1 text-xs text-gray-500">Your Agency Code</p>
                    <p className="font-mono text-lg font-bold tracking-widest text-gray-900">
                      {agencyCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex-shrink-0 p-2 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
                    title="Copy code"
                  >
                    {isCopied ? (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {isCopied ? 'Copied!' : 'Copy Code'}
                  </button>
                  <button
                    onClick={() => {
                      const text = `Join my agency using this code: ${agencyCode}`;
                      navigator.clipboard.writeText(text);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="flex-1 px-6 py-2.5 text-sm font-medium text-blue-600 transition-colors bg-blue-50 rounded-lg hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Share
                  </button>
                </div>

                <p className="text-xs text-center text-gray-500">
                  Creators can use this code in their profile to request joining your agency.
                </p>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-gray-500">Unable to load agency code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
