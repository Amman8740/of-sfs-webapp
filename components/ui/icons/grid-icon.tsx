import React from 'react';

interface GridIconProps {
  className?: string;
}

export const GridIcon: React.FC<GridIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 18 18" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M2.25 2.25H7.5V7.5H2.25V2.25ZM9 2.25H14.25V7.5H9V2.25ZM2.25 9H7.5V14.25H2.25V9ZM9 9H14.25V14.25H9V9ZM3.375 3.375V6.375H6.375V3.375H3.375ZM10.125 3.375V6.375H13.125V3.375H10.125ZM3.375 10.125V13.125H6.375V10.125H3.375ZM10.125 10.125V13.125H13.125V10.125H10.125Z" fill="currentColor"/>
    </svg>
  );
};
