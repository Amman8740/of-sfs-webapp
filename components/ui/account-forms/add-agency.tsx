'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

export default function AddAgencySection() {
  const [agencyCode, setAgencyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!agencyCode.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/agency/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: agencyCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join agency');
        return;
      }

      setSuccess(true);
      setAgencyCode('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting agency code:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
      <div className="grid grid-cols-2">
        {/* Left section - Title and description */}
        <div className="p-8 bg-[#FCFCFC]">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">Add Agency</h2>
          <p className="text-gray-600">
            Enter the unique code provided by your agency to associate with it.
          </p>
        </div>
        
        {/* Right section - Input and Button */}
        <div className="flex flex-col justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg">
                Successfully joined the agency! A request has been sent to the agency.
              </div>
            )}

            <div>
              <label 
                htmlFor="agencyCode" 
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Agency Code
              </label>
              <input
                id="agencyCode"
                type="text"
                value={agencyCode}
                onChange={(e) => setAgencyCode(e.target.value.toUpperCase())}
                placeholder="Enter Agency Code"
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit}
                color="primary"
                size="medium"
                variant="solid"
                disabled={!agencyCode.trim() || isLoading}
                className="px-8"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
