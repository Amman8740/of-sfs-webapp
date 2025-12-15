import React from 'react';

interface ChevronUpIconProps {
  className?: string;
}

export const ChevronUpIcon: React.FC<ChevronUpIconProps> = ({ className = "w-4 h-4" }) => {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12 10L8 6L4 10" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
