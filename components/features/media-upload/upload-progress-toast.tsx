"use client";

import React, { useState, useEffect, useRef } from 'react';

interface UploadProgressToastProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
}

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export const UploadProgressToast: React.FC<UploadProgressToastProps> = ({
  isOpen,
  onClose,
  files
}) => {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [allCompleted, setAllCompleted] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isOpen && files.length > 0 && !hasStarted.current) {
      hasStarted.current = true;
      
      // Initialize upload items
      const items: UploadItem[] = files.map((file, index) => ({
        id: `upload-${index}`,
        name: file.name,
        progress: 0,
        status: 'uploading' as const
      }));
      setUploadItems(items);
      setAllCompleted(false);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadItems(prev => {
          const updated = prev.map(item => {
            if (item.status === 'uploading' && item.progress < 100) {
              const increment = Math.random() * 20 + 5; // Random progress increment
              const newProgress = Math.min(item.progress + increment, 100);
              return {
                ...item,
                progress: newProgress,
                status: newProgress >= 100 ? 'completed' as const : 'uploading' as const
              };
            }
            return item;
          });

          return updated;
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (!isOpen) {
      // Reset state when toast is closed
      setUploadItems([]);
      setAllCompleted(false);
      hasStarted.current = false;
    }
  }, [isOpen, files, onClose]);

  // Separate effect to handle completion
  useEffect(() => {
    if (uploadItems.length > 0) {
      const allDone = uploadItems.every(item => item.status === 'completed');
      if (allDone && !allCompleted) {
        setAllCompleted(true);
        // Auto close after 3 seconds when completed
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    }
  }, [uploadItems, allCompleted, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`${allCompleted ? 'bg-green-50 p-3' : 'bg-white p-4'} rounded-lg max-w-sm`}
        style={{
          boxShadow: '0px 2px 4px -2px #0000001A, 0px 4px 6px -1px #0000001A'
        }}
      >
        {/* Header (only for progress state) */}
        {!allCompleted && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Upload Progress</h3>
            <button
              onClick={onClose}
              className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}
        {allCompleted && (
          <div className="flex items-center justify-end mb-1">
            <button
              onClick={onClose}
              className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {allCompleted ? (
          /* Success State */
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.1744 8.63937C19.8209 8.27 19.4553 7.88938 19.3175 7.55469C19.19 7.24813 19.1825 6.74 19.175 6.24781C19.1609 5.33281 19.1459 4.29594 18.425 3.575C17.7041 2.85406 16.6672 2.83906 15.7522 2.825C15.26 2.8175 14.7519 2.81 14.4453 2.6825C14.1116 2.54469 13.73 2.17906 13.3606 1.82562C12.7137 1.20406 11.9788 0.5 11 0.5C10.0212 0.5 9.28719 1.20406 8.63937 1.82562C8.27 2.17906 7.88938 2.54469 7.55469 2.6825C7.25 2.81 6.74 2.8175 6.24781 2.825C5.33281 2.83906 4.29594 2.85406 3.575 3.575C2.85406 4.29594 2.84375 5.33281 2.825 6.24781C2.8175 6.74 2.81 7.24813 2.6825 7.55469C2.54469 7.88844 2.17906 8.27 1.82562 8.63937C1.20406 9.28625 0.5 10.0212 0.5 11C0.5 11.9788 1.20406 12.7128 1.82562 13.3606C2.17906 13.73 2.54469 14.1106 2.6825 14.4453C2.81 14.7519 2.8175 15.26 2.825 15.7522C2.83906 16.6672 2.85406 17.7041 3.575 18.425C4.29594 19.1459 5.33281 19.1609 6.24781 19.175C6.74 19.1825 7.24813 19.19 7.55469 19.3175C7.88844 19.4553 8.27 19.8209 8.63937 20.1744C9.28625 20.7959 10.0212 21.5 11 21.5C11.9788 21.5 12.7128 20.7959 13.3606 20.1744C13.73 19.8209 14.1106 19.4553 14.4453 19.3175C14.7519 19.19 15.26 19.1825 15.7522 19.175C16.6672 19.1609 17.7041 19.1459 18.425 18.425C19.1459 17.7041 19.1609 16.6672 19.175 15.7522C19.1825 15.26 19.19 14.7519 19.3175 14.4453C19.4553 14.1116 19.8209 13.73 20.1744 13.3606C20.7959 12.7137 21.5 11.9788 21.5 11C21.5 10.0212 20.7959 9.28719 20.1744 8.63937ZM15.2806 9.28063L10.0306 14.5306C9.96097 14.6004 9.87825 14.6557 9.7872 14.6934C9.69616 14.7312 9.59856 14.7506 9.5 14.7506C9.40144 14.7506 9.30384 14.7312 9.2128 14.6934C9.12175 14.6557 9.03903 14.6004 8.96937 14.5306L6.71937 12.2806C6.57864 12.1399 6.49958 11.949 6.49958 11.75C6.49958 11.551 6.57864 11.3601 6.71937 11.2194C6.86011 11.0786 7.05098 10.9996 7.25 10.9996C7.44902 10.9996 7.63989 11.0786 7.78063 11.2194L9.5 12.9397L14.2194 8.21937C14.2891 8.14969 14.3718 8.09442 14.4628 8.0567C14.5539 8.01899 14.6515 7.99958 14.75 7.99958C14.8485 7.99958 14.9461 8.01899 15.0372 8.0567C15.1282 8.09442 15.2109 8.14969 15.2806 8.21937C15.3503 8.28906 15.4056 8.37178 15.4433 8.46283C15.481 8.55387 15.5004 8.65145 15.5004 8.75C15.5004 8.84855 15.481 8.94613 15.4433 9.03717C15.4056 9.12822 15.3503 9.21094 15.2806 9.28063Z" fill="#30A46C"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium" style={{ color: '#171717' }}>Upload Complete</h4>
              <p className="text-xs mt-1" style={{ color: '#171717' }}>
                {files.length} media file{files.length !== 1 ? 's' : ''} have been successfully uploaded
              </p>
            </div>
          </div>
        ) : (
          /* Progress State */
          <div className="space-y-3">
            {uploadItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {/* Thumbnail Placeholder */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {Math.round(item.progress)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {item.status === 'uploading' ? 'In Progress' : 'Completed'}
                    </span>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {item.status === 'uploading' && (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                          </svg>
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
