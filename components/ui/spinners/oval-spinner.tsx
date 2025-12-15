'use client';

interface OvalSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function OvalSpinner({ size = 'medium', className }: OvalSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-5 h-5 border-2', 
    large: 'w-6 h-6 border-3'
  };

  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <div 
        className={`animate-spin rounded-full border-gray-200 border-t-gray-600 ${sizeClasses[size]}`}
        aria-label="loading"
      />
    </div>
  );
};
