import React, { PropsWithChildren, Suspense } from 'react';
import { Metadata } from 'next';
import { getURL } from '@/lib/utils';
import '../styles/main.css';
import { Manrope } from 'next/font/google';
import { Toaster as SonnerToaster } from 'sonner';
import { NotificationProvider } from '@/components/providers/notification-provider';
import { BrowserNotificationPermission } from '@/components/features/browser-notification-permission';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  preload: true,
  weight: ['400', '500', '600', '700'],
});

const meta = {
  title: 'OF Assist',
  description: 'Your trusted partner for cutting-edge software solutions.',
  cardImage: '/og.png',
  robots: 'follow, index',
  favicon: '/favicon.ico',
  url: getURL(),
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: 'origin-when-cross-origin',
    keywords: ['Agency', 'Client', 'Dashboard', 'Management'],
    authors: [{ name: 'OF Assist', url: 'https://of-assist.com/' }],
    creator: 'OF Assist',
    publisher: 'OF Assist',
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
      type: 'website',
      siteName: meta.title,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@OFAssist',
      creator: '@OFAssist',
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
    },
  };
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className={`${manrope.variable} font-sans`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://cdn.onlyfans.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://qyloyaubnicryoazpcja.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.onlyfans.com" />
        <link rel="dns-prefetch" href="https://qyloyaubnicryoazpcja.supabase.co" />
      </head>
      <body className='loading bg-canvas-on-canvas' suppressHydrationWarning={true}>
        <NotificationProvider>
          {children}
          <BrowserNotificationPermission />
        </NotificationProvider>
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
