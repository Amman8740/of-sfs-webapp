import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  // Revalidate on focus - useful for keeping data fresh
  revalidateOnFocus: true,
  
  // Revalidate on reconnect - useful for mobile users
  revalidateOnReconnect: true,
  
  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,
  
  // Retry failed requests
  errorRetryCount: 3,
  
  // Retry with exponential backoff
  errorRetryInterval: 5000,
  
  // Keep previous data while revalidating
  keepPreviousData: true,
  
  // Refresh interval for real-time data (5 seconds)
  refreshInterval: 5000,
  
  // Only refresh when window is focused
  refreshWhenHidden: false,
  
  // Refresh when offline
  refreshWhenOffline: false,
  
  // Focus throttling interval
  focusThrottleInterval: 5000,
  
  // Loading timeout
  loadingTimeout: 3000,
  
  // Compare function for determining if data has changed
  compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
};
