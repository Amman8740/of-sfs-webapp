import React from 'react';
import { PlusIcon } from '@/components/ui/icons';

interface AddModelsButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  size?: 'default' | 'small';
}

export const AddModelsButton: React.FC<AddModelsButtonProps> = ({ 
  onClick, 
  className = "",
  children = "Add Model",
  size = 'default'
}) => {
  const isSmall = size === 'small';
  
  return (
    <button
      onClick={onClick}
      className={`bg-primary-solid text-primary-on-primary rounded-xl hover:bg-primary-solid-hover transition-colors flex items-center justify-center ${className}`}
      style={isSmall ? {
        height: '36px',
        padding: '0 16px',
        gap: '6px'
      } : {
        width: '320px',
        height: '48px',
        padding: '0 24px',
        gap: '8px'
      }}
    >
      <div className={`${isSmall ? 'w-4 h-4' : 'w-6 h-6'} bg-primary-solid rounded-full flex items-center justify-center`}>
        <PlusIcon className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
      </div>
      <span className={`font-normal ${isSmall ? 'text-sm' : 'text-base'} leading-6 tracking-[0.5%]`}>{children}</span>
    </button>
  );
};
