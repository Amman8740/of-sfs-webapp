'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPassword } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { Button, Input, Label, PasswordInput } from '@/components/ui';

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export const PasswordSignIn = ({
  allowEmail,
  redirectMethod,
}: PasswordSignInProps) => {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signInWithPassword, router);
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
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
            </div>
            <PasswordInput
              id='password'
              label='Password'
              placeholder='Password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              isVisible={isPasswordVisible}
              onToggleVisibility={() =>
                setIsPasswordVisible(!isPasswordVisible)
              }
            />
          </div>
          <Button
            color='primary'
            size='medium'
            variant='solid'
            type='submit'
            className='mt-1'
            loading={isSubmitting}
            disabled={!email || !password}
          >
            Sign in
          </Button>
        </div>
      </form>
      <div className='flex flex-col gap-1 py-4 text-sm text-center text-canvas-text'>
        <Link href='/signin/forgot_password' className='hover:underline'>
          Forgot your password?
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
