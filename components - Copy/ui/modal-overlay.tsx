import React from 'react';

interface ModalOverlayProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ 
  children, 
  className = "flex items-center justify-center",
  onClick
}) => {
  return (
    <div 
      className={`fixed bg-black bg-opacity-50 ${className}`}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
