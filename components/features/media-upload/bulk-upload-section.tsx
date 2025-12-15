"use client";

import React, { useState, useRef } from 'react';
import { UploadIcon } from '@/components/ui/icons';

interface BulkUploadSectionProps {
  onFilesSelected: (files: File[]) => void;
  onClose?: () => void;
}

export const BulkUploadSection: React.FC<BulkUploadSectionProps> = ({ onFilesSelected, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
      onFilesSelected(fileArray);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    console.log('Uploading files:', selectedFiles);
    // Here you would typically upload the files
    setSelectedFiles([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Select Media</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : selectedFiles.length > 0 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFiles.length === 0 ? (
          <>
            {/* Upload Icon */}
            <div className="flex justify-center mb-4">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M27.665 36.89C27.4825 36.6157 27.235 36.3907 26.9445 36.2351C26.654 36.0795 26.3296 35.9981 26 35.9981C25.6705 35.9981 25.3461 36.0795 25.0556 36.2351C24.7651 36.3907 24.5176 36.6157 24.335 36.89L19.1225 44.7125L16.6825 40.9175C16.5015 40.6357 16.2525 40.4039 15.9585 40.2434C15.6646 40.0829 15.335 39.9988 15 39.9988C14.6651 39.9988 14.3355 40.0829 14.0416 40.2434C13.7476 40.4039 13.4986 40.6357 13.3175 40.9175L4.31754 54.9175C4.12305 55.2197 4.01356 55.5686 4.00057 55.9277C3.98759 56.2868 4.07159 56.6428 4.24375 56.9582C4.41591 57.2736 4.66986 57.5368 4.97892 57.7201C5.28797 57.9035 5.64071 58.0001 6.00004 58H38C38.3622 58.0002 38.7177 57.9021 39.0284 57.7161C39.3392 57.5301 39.5936 57.2633 39.7646 56.944C39.9355 56.6247 40.0165 56.265 39.999 55.9032C39.9815 55.5415 39.8661 55.1913 39.665 54.89L27.665 36.89ZM9.66254 54L15 45.6975L17.4075 49.4475C17.5871 49.727 17.8335 49.9574 18.1244 50.1179C18.4153 50.2783 18.7416 50.3638 19.0739 50.3665C19.4061 50.3692 19.7338 50.2892 20.0273 50.1335C20.3208 49.9779 20.5709 49.7515 20.755 49.475L26.005 41.6075L34.2625 54H9.66254ZM53.4125 20.585L39.4125 6.585C39.0378 6.21064 38.5298 6.00025 38 6H14C12.9392 6 11.9218 6.42143 11.1716 7.17157C10.4215 7.92172 10 8.93913 10 10V32C10 32.5304 10.2108 33.0391 10.5858 33.4142C10.9609 33.7893 11.4696 34 12 34C12.5305 34 13.0392 33.7893 13.4143 33.4142C13.7893 33.0391 14 32.5304 14 32V10H36V22C36 22.5304 36.2108 23.0391 36.5858 23.4142C36.9609 23.7893 37.4696 24 38 24H50V54H48C47.4696 54 46.9609 54.2107 46.5858 54.5858C46.2108 54.9609 46 55.4696 46 56C46 56.5304 46.2108 57.0391 46.5858 57.4142C46.9609 57.7893 47.4696 58 48 58H50C51.0609 58 52.0783 57.5786 52.8285 56.8284C53.5786 56.0783 54 55.0609 54 54V22C54.0003 21.7373 53.9487 21.4771 53.8483 21.2343C53.7479 20.9915 53.6007 20.7709 53.415 20.585H53.4125ZM40 12.8275L47.1725 20H40V12.8275Z" fill="#DBDBDB"/>
              </svg>
            </div>
            
            <p className="text-gray-600 mb-2">Drag and drop file(s) here or select from device.</p>
            <p className="text-sm text-gray-500 mb-4">Size Limit: 3GB</p>
            
            <button
              onClick={handleFileInputClick}
              className="bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors px-4 py-2"
            >
              Add Media
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <UploadIcon className="w-6 h-6 text-blue-600" />
            </div>
            
            <p className="text-gray-600 mb-2">{selectedFiles.length} file(s) selected</p>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleFileInputClick}
                className="flex items-center gap-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors px-4 py-2"
              >
                <UploadIcon className="w-4 h-4" />
                Add More Media
              </button>
              
              <button
                onClick={handleUpload}
                className="bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors px-4 py-2"
              >
                Upload
              </button>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
};
