'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import {
  Button,
  Card,
  PasswordInput,
  PasswordValidation,
} from '@/components/ui';

type TVisibilityField = 'currentPassword' | 'password' | 'passwordConfirm';

export default function PasswordForm () {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isValidLength, setIsValidLength] = useState(false);
  const [containsCharsAndNums, setContainsCharsAndNums] = useState(false);
  const [containsSpecialOrLong, setContainsSpecialOrLong] = useState(false);
  const [visibility, setVisibility] = useState<{
    [key in TVisibilityField]: boolean;
  }>({
    currentPassword: false,
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

  const handleCurrentPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCurrentPassword(e.target.value);
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
    setIsSubmitting(true);
    await handleRequest(e, updatePassword, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title='Your Password'
      description='We recommend that you periodically update your password to help prevent unauthorized access to your account.'
      footer={
        <Button
          color='primary'
          size='small'
          variant='outline'
          type='submit'
          form='passwordForm'
          loading={isSubmitting}
          className='self-end'
          disabled={
            !currentPassword ||
            !password ||
            password !== passwordConfirm ||
            !isValidLength ||
            !containsCharsAndNums ||
            !containsSpecialOrLong
          }
        >
          Save Changes
        </Button>
      }
    >
      <form
        id='passwordForm'
        onSubmit={(e) => handleSubmit(e)}
        className='flex flex-col gap-5'
      >
        <PasswordInput
          id='passwordCurrent'
          label='Current password'
          placeholder='Current password'
          value={currentPassword}
          onChange={handleCurrentPasswordChange}
          isVisible={visibility.currentPassword}
          onToggleVisibility={() => toggleVisibility('currentPassword')}
        />
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
      </form>
    </Card>
  );
};
