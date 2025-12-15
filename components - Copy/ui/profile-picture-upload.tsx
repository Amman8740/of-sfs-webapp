'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  isLoading?: boolean;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  isLoading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      const errorMsg = 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = 'File too large. Maximum size is 5MB';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/creator/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload file');
      }

      const data = await response.json();
      onUploadSuccess?.(data.url);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload profile picture';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!currentImageUrl) return;

    try {
      setUploading(true);
      setError(null);

      // Extract filename from URL
      const urlParts = currentImageUrl.split('/');
      const filename = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

      const response = await fetch(`/api/creator/profile-picture?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete file');
      }

      setPreview(null);
      onUploadSuccess?.('');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete profile picture';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview */}
      <div
        className="relative w-40 h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Profile preview"
            fill
            className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm text-gray-500 text-center px-2">Click to upload</p>
            <p className="text-xs text-gray-400">or drag and drop</p>
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading || isLoading}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 w-full">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Choose Image'}
        </button>

        {preview && (
          <button
            onClick={handleRemovePicture}
            disabled={uploading || isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Processing...' : 'Remove'}
          </button>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
      </p>
    </div>
  );
};
