'use client';

interface BlueSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function BlueSpinner({ size = 'medium', className }: BlueSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-2',
    large: 'w-8 h-8 border-3'
  };

  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <div 
        className={`animate-spin rounded-full border-gray-200 border-b-blue-600 ${sizeClasses[size]}`}
        aria-label="loading"
      />
    </div>
  );
}
