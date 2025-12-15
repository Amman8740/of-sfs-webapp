import React from 'react';

interface OperationProgressProps {
  isVisible: boolean;
  title: string;
  progress: number;
  total: number;
  status: 'processing' | 'completed' | 'failed';
}

export const OperationProgress: React.FC<OperationProgressProps> = ({
  isVisible,
  title,
  progress,
  total,
  status,
}) => {
  if (!isVisible) return null;

  const percentage = Math.round((progress / total) * 100);
  
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'In Progress';
      default:
        return 'In Progress';
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in fade-in">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-96">
        <div className="flex items-center gap-4">
          {/* Placeholder Image */}
          <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0" />
          
          <div className="flex-1">
            {/* Status Text */}
            <div className="font-semibold text-gray-800 mb-1">{getStatusText()}</div>
            
            {/* Progress Bar Container */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`${getStatusColor()} h-full rounded-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            {/* Progress Text */}
            <div className="text-xs text-gray-600 mt-2">
              {title}: {progress} of {total} ({percentage}%)
            </div>
          </div>

          {/* Close Button */}
          {status !== 'processing' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-gray-400 hover:text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
