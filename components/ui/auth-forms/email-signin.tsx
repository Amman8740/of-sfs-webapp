'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmail } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { Button, Input, Label } from '@/components/ui';

// Define prop type with allowPassword boolean
interface EmailSignInProps {
  allowPassword: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function EmailSignIn ({
  allowPassword,
  redirectMethod,
  disableButton,
}: EmailSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signInWithEmail, router);
    setIsSubmitting(false);
  };

  return (
    <>
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)}>
        <div className='flex flex-col gap-6 lg:gap-5'>
          <div className='flex flex-col gap-6 lg:gap-5'>
            <div className='flex flex-col gap-1.5 pt-3 lg:p-0'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='name@example.com'
                type='email'
                name='email'
                autoCapitalize='none'
                autoComplete='email'
                autoCorrect='off'
              />
            </div>
          </div>
          <Button
            color='primary'
            size='medium'
            variant='solid'
            type='submit'
            className='mt-1'
            loading={isSubmitting}
            disabled={disableButton}
          >
            Sign in
          </Button>
        </div>
      </form>
      {allowPassword && (
        <div className='flex flex-col gap-1 py-4 text-sm text-center text-canvas-text'>
          <Link href='/signin/password_signin' className='hover:underline'>
            Sign in with email and password
          </Link>
          <p>
            Don&apos;t have an account?{' '}
            <Link href='/signin/signup' className='hover:underline'>
              Sign up
            </Link>
          </p>
        </div>
      )}
    </>
  );
};
