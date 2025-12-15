'use client';

import { useEffect } from 'react';

/**
 * Hook to report Web Vitals to analytics
 */
export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Observer for Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric = {
          name: entry.name,
          value: entry.startTime + entry.duration,
          timestamp: Date.now(),
        };
        reportMetric(metric);
      }
    });

    // Observe different metric types
    try {
      observer.observe({
        entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input'],
      });
    } catch (e) {
      // Some entry types may not be available in all browsers
    }

    return () => observer.disconnect();
  }, []);
};

/**
 * Send metric to analytics endpoint
 */
const reportMetric = (metric: any) => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    const body = JSON.stringify(metric);
    
    // Use sendBeacon if available for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/metrics', body);
    } else {
      // Fallback to fetch
      fetch('/api/analytics/metrics', {
        method: 'POST',
        body: body,
        keepalive: true,
      }).catch(() => {
        // Silently fail, don't disrupt user experience
      });
    }
  }
};
