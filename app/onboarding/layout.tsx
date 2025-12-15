import React, { PropsWithChildren } from 'react';
import { Metadata } from 'next';
import { getURL } from '@/lib/utils';
import 'styles/main.css';
import { Archivo, Nunito_Sans } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';


const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito-sans',
  weight: ['400', '700'],
});

const meta = {
  title: 'OF Assist - Onboarding',
  description: 'Complete your profile setup for OF Assist.',
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
    keywords: ['Onboarding', 'Setup', 'Profile'],
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

export default function OnboardingLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className={`${archivo.variable} ${nunitoSans.variable} font-sans`}>
      <body className='loading bg-canvas-on-canvas'>
        <NextTopLoader color='#0091ff' showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
