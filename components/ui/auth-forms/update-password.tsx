'use client';

import React, { useState } from 'react';
import { updatePassword } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { Button, PasswordInput, PasswordValidation } from '@/components/ui';

interface UpdatePasswordProps {
  redirectMethod: string;
}

type TVisibilityField = 'password' | 'passwordConfirm';

export default function UpdatePassword ({ redirectMethod }: UpdatePasswordProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isValidLength, setIsValidLength] = useState(false);
  const [containsCharsAndNums, setContainsCharsAndNums] = useState(false);
  const [containsSpecialOrLong, setContainsSpecialOrLong] = useState(false);
  const [visibility, setVisibility] = useState<{
    [key in TVisibilityField]: boolean;
  }>({
    password: false,
    passwordConfirm: false,
  });

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

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPasswordConfirm(e.target.value);
  };

  const toggleVisibility = (field: TVisibilityField) => {
    setVisibility((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, updatePassword, router);
    setIsSubmitting(false);
  };

  return (
    <>
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)}>
        <div className='flex flex-col gap-6 lg:gap-5'>
          <div className='flex flex-col gap-6 lg:gap-5'>
            <PasswordInput
              id='password'
              label='New password'
              placeholder='New password'
              value={password}
              onChange={handlePasswordChange}
              isVisible={visibility.password}
              onToggleVisibility={() => toggleVisibility('password')}
            />
            <PasswordInput
              id='passwordConfirm'
              label='Confirm new password'
              placeholder='Confirm new password'
              value={passwordConfirm}
              onChange={handleConfirmPasswordChange}
              isVisible={visibility.passwordConfirm}
              onToggleVisibility={() => toggleVisibility('passwordConfirm')}
            />
            {passwordTouched && (
              <PasswordValidation
                isValidLength={isValidLength}
                containsCharsAndNums={containsCharsAndNums}
                containsSpecialOrLong={containsSpecialOrLong}
                passwordsMatch={password === passwordConfirm}
                passwordTouched={passwordTouched}
              />
            )}
          </div>
          <Button
            color='primary'
            size='medium'
            variant='solid'
            type='submit'
            className='mt-1'
            // onClick={(e) => handleSubmit(e)}
            loading={isSubmitting}
            disabled={
              !password ||
              password !== passwordConfirm ||
              !isValidLength ||
              !containsCharsAndNums ||
              !containsSpecialOrLong
            }
          >
            Update Password
          </Button>
        </div>
      </form>
    </>
  );
};
