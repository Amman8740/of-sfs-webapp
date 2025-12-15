'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestPasswordUpdate } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { Button, Input, Label } from '@/components/ui';

// Define prop type with allowEmail boolean
interface ForgotPasswordProps {
  allowEmail: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function ForgotPassword ({
  allowEmail,
  redirectMethod,
}: ForgotPasswordProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, requestPasswordUpdate, router);
    setIsSubmitting(false);
    setEmail('');
  };

  return (
    <>
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)}>
        <div className='flex flex-col gap-6 lg:gap-5'>
          <div className='grid gap-1'>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
            </div>
          </div>
          <Button
            color='primary'
            size='medium'
            variant='solid'
            type='submit'
            loading={isSubmitting}
            disabled={!email}
          >
            Send reset password instructions
          </Button>
        </div>
      </form>
      <div className='flex flex-col gap-1 py-4 text-sm text-center text-canvas-text'>
        <Link href='/signin/password_signin' className='hover:underline'>
          Sign in with email and password
        </Link>
        {allowEmail && (
          <Link href='/signin/email_signin' className='hover:underline'>
            Sign in via magic link
          </Link>
        )}
        <p>
          Don&apos;t have an account?{' '}
          <Link href='/signin/signup' className='hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
};
