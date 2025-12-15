'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProxiedImageProps {
  src: string; // Original image URL
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  userId?: string; // For rate limiting and caching
  fallbackSrc?: string; // Fallback image if proxy fails
  showError?: boolean; // Whether to show error state
}

/**
 * ProxiedImage component that uses the proxy API to display images
 * from external URLs that are blocked by CORS (like OnlyFans)
 */
export function ProxiedImage({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  userId,
  fallbackSrc,
  showError = false,
}: ProxiedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Build proxy URL
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}${userId ? `&userId=${userId}` : ''}`;

  const handleImageLoad = () => {
    setLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setImageError(true);
  };

  // If there's an error and no fallback, show error state
  if (imageError && !fallbackSrc && showError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    );
  }

  // If there's an error and we have a fallback, use it
  if (imageError && fallbackSrc) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={proxyUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        unoptimized // Since we're proxying, let the browser handle the image
      />

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
          style={{ width, height }}
        >
          <div className="text-gray-400">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// Example usage component
export function ImageExample() {
  const onlyFansImageUrl = 'https://thumbs.onlyfans.com/public/files/thumbs/c144/p/pf/pfg/pfgxqheeqydup6tojsxvcoc4punrdfpt1609967190/avatar.jpg';
  const coverImageUrl = 'https://public.onlyfans.com/files/s/sz/szs/szs3ij5cbrdj6w4dkqy875ibjqzoh47p1706040628/392983124/header.jpg';

  return (
    <div className="p-8 space-y-8">
      <h2 className="mb-4 text-2xl font-bold">Proxied Image Examples</h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Profile Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Profile Image</h3>
          <ProxiedImage
            src={onlyFansImageUrl}
            alt="Profile Picture"
            width={200}
            height={200}
            className="border-4 border-white rounded-full shadow-lg"
            userId="user123"
            showError={true}
          />
          <p className="text-sm text-gray-600">Original URL: {onlyFansImageUrl}</p>
        </div>

        {/* Cover Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cover Image</h3>
          <ProxiedImage
            src={coverImageUrl}
            alt="Cover Image"
            width={400}
            height={200}
            className="rounded-lg"
            userId="user123"
            showError={true}
          />
          <p className="text-sm text-gray-600">Original URL: {coverImageUrl}</p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="p-6 rounded-lg bg-gray-50">
        <h3 className="mb-4 text-lg font-semibold">How to Use</h3>
        <pre className="p-4 overflow-x-auto text-sm text-green-400 bg-gray-800 rounded">
{`<ProxiedImage
  src="https://onlyfans.com/image.jpg"
  alt="Profile Picture"
  width={200}
  height={200}
  className="rounded-full"
  userId="user123"
  showError={true}
/>`}
        </pre>
      </div>
    </div>
  );
}