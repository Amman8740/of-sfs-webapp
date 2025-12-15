'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  currentPage: 'agency' | 'creator' | 'account';
  selectedOption: string;
  setCurrentPage: (page: 'agency' | 'creator' | 'account') => void;
  setSelectedOption: (option: string) => void;
  navigateToAccount: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
  initialPage?: 'agency' | 'creator' | 'account';
  initialOption?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialPage = 'agency',
  initialOption = 'models'
}) => {
  const [currentPage, setCurrentPage] = useState<'agency' | 'creator' | 'account'>(initialPage);
  const [selectedOption, setSelectedOption] = useState(initialOption);

  const navigateToAccount = () => {
    setCurrentPage('account');
    setSelectedOption('account');
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        selectedOption,
        setCurrentPage,
        setSelectedOption,
        navigateToAccount
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
