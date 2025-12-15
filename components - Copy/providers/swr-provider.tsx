'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { swrConfig } from '@/lib/utils/swr/config';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}
