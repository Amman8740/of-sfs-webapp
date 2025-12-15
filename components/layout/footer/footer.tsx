'use client';

import Link from 'next/link';
import { IconButton, Logo } from '@/components/ui';
import { FaFacebook, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { footerData } from '@/lib/constants';
import { FooterLink } from './footer-link';

export const socialIcons = [
  { icon: FaFacebook, url: '#' },
  { icon: FaInstagram, url: '#' },
  { icon: FaXTwitter, url: '#' },
  { icon: FaLinkedin, url: '#' },
  { icon: FaYoutube, url: '#' },
];

const currentYear = new Date().getFullYear();

export default function Footer () {
  return (
    <footer className='px-3.5 py-9 lg:px-0 lg:py-14'>
      <div className='flex flex-col items-center justify-center w-full max-w-screen-xl gap-6 mx-auto lg:gap-0'>
        <div className='flex flex-col items-center justify-center w-full gap-6 lg:flex-row lg:gap-0'>
          <Link href='/' className='flex-1'>
            <Logo />
          </Link>
          <div className='flex-1 text-center'>
            <p className='text-sm text-canvas-text'>
              © {currentYear} by (Brand Name). All rights are reserved.
            </p>
          </div>
          <div className='flex items-center justify-end flex-1 gap-x-3'>
            {socialIcons.map(({ icon: Icon, url }, index) => (
              <Link key={index} href={url}>
                <IconButton
                  variant='gray'
                  size='small'
                  type='ghost'
                  icon={<Icon />}
                  className='text-canvas-text'
                />
              </Link>
            ))}
          </div>
        </div>
        <div className='mb-3 mt-4 hidden h-[1px] w-full bg-canvas-line lg:flex'></div>
        <div className='flex flex-col items-center justify-between w-full gap-6 lg:flex-row lg:gap-0'>
          <p className='text-sm text-canvas-text'>
            Realised by{' '}
            <Link
              href='https://www.newweborder.co/'
              target='_blank'
              className='hover:transition-color rounded-sm py-px duration-300 ease-in-out hover:cursor-pointer hover:bg-black/90 hover:text-[#23FA4B]'
            >
              ◬ ɴᴇᴡ ᴡᴇʙ oʀᴅᴇʀ_
            </Link>
          </p>
          <div className='flex flex-col items-center gap-6 text-sm text-canvas-text sm:flex-row lg:gap-3'>
            {footerData.map((link, index) => (
              <FooterLink key={index} href={link.href} label={link.label} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
