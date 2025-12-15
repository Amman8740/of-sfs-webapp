import React, { PropsWithChildren, Suspense } from 'react';
import { Metadata } from 'next';
import { getURL } from '@/lib/utils';
import 'styles/main.css';
import { Navbar, UnifiedSidebar } from '@/components/layout';
import { SessionGuard } from '@/components/auth/session-guard';
import { Archivo } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { SWRProvider } from '@/components/providers/swr-provider';
import { createClient } from '@/lib/utils/supabase/server';
import { getUser } from '@/lib/utils/supabase/queries';
import { NavigationProvider } from '@/components/layout/navigation-context';

export const dynamic = 'force-dynamic';

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

const meta = {
  title: 'OF Assist Webapp',
  description: 'Your trusted partner for cutting-edge software solutions.',
  cardImage: '/og.png',
  robots: 'nofollow, noindex',
  favicon: '/favicon.ico',
  url: getURL(),
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: 'origin-when-cross-origin',
    keywords: ['Vercel', 'Supabase', 'Next.js', 'Stripe', 'Subscription'],
    authors: [{ name: 'Vercel', url: 'https://www.newweborder.co/' }],
    creator: 'New',
    publisher: 'Vercel',
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
      site: '@Vercel',
      creator: '@Vercel',
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
    },
  };
}


export default async function AppLayout({ children }: PropsWithChildren) {
  // Get user type for sidebar
  let userType: 'agency' | 'creator' = 'creator'; // default
  
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);
    
    if (user) {
      const { data: userProfile } = await (supabase as any)
        .from('user_profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle();
      
      if (userProfile?.user_type) {
        userType = userProfile.user_type;
      }
    }
  } catch (error) {
    console.error('Error fetching user type in layout:', error);
  }

  return (
    <SWRProvider>
      <NextTopLoader color= "#0091ff" showSpinner={false} />
      <SessionGuard>
        <NavigationProvider initialPage="agency" initialOption="models">
          <div className="h-screen overflow-hidden">
            {/* Navbar fixed on top */}
            <Navbar />

            <div className="flex h-full pt-16">
              {/* Sidebar fixed on left */}
              <UnifiedSidebar userType={userType} />

              {/* Main content scrollable */}
              <div className="flex-1 ml-[288px] h-full overflow-y-auto bg-[#FCFCFC] rounded-tl-xl py-4">
                {children}
              </div>
            </div>
          </div>
        </NavigationProvider>
      </SessionGuard>
    </SWRProvider>
  );
}
