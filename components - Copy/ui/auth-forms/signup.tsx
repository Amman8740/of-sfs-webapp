'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import {
  Button,
  Input,
  Label,
  PasswordValidation,
  PasswordInput,
} from '@/components/ui';

// Define prop type with allowEmail boolean
interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function SignUp ({ allowEmail, redirectMethod }: SignUpProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isValidLength, setIsValidLength] = useState(false);
  const [containsCharsAndNums, setContainsCharsAndNums] = useState(false);
  const [containsSpecialOrLong, setContainsSpecialOrLong] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
    if (!passwordTouched) {setPasswordTouched(true);}
    if (value) {
      setIsValidLength(value.length >= 8);
      setContainsCharsAndNums(
        /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value),
      );
      setContainsSpecialOrLong(
        value.length < 12 ? /[!@#$%^&*(),.?":{}|<>]/.test(value) : true,
      );
    } else {
      setIsValidLength(false);
      setContainsCharsAndNums(false);
      setContainsSpecialOrLong(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signUp, router);
    setIsSubmitting(false);
  };

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className='flex flex-col gap-6 lg:gap-5'>
          <div className='flex flex-col gap-6 lg:gap-5'>
            <div className='flex flex-col gap-1.5 pt-3 lg:p-0'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='name@example.com'
                type='email'
                name='email'
                autoComplete='email'
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
              onChange={handlePasswordChange}
              isVisible={isPasswordVisible}
              onToggleVisibility={() =>
                setIsPasswordVisible(!isPasswordVisible)
              }
            />
          </div>
          {passwordTouched && (
            <PasswordValidation
              isValidLength={isValidLength}
              containsCharsAndNums={containsCharsAndNums}
              containsSpecialOrLong={containsSpecialOrLong}
              passwordTouched={passwordTouched}
            />
          )}
          <Button
            color='primary'
            size='medium'
            variant='solid'
            type='submit'
            className='mt-1'
            loading={isSubmitting}
            disabled={
              !password ||
              !isValidLength ||
              !containsCharsAndNums ||
              !containsSpecialOrLong
            }
          >
            Sign up
          </Button>
        </div>
      </form>
      <div className='flex flex-col gap-1 py-4 text-sm text-center text-canvas-text'>
        <p>
          Already have an account?{' '}
          <Link href='/signin/password_signin' className='hover:underline'>
            Sign in
          </Link>
        </p>
        {allowEmail && (
          <p>
            <Link href='/signin/email_signin'>Sign in via magic link</Link>
          </p>
        )}
      </div>
    </>
  );
};
