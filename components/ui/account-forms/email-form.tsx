'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEmail } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { Button, Card, Input } from '@/components/ui';

export default function EmailForm({ userEmail }: { userEmail: string | undefined }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState(userEmail ?? '');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(!inputValue.trim() || inputValue === userEmail);
  }, [inputValue, userEmail]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    const newEmailInput = e.currentTarget.elements.namedItem(
      'newEmail',
    ) as HTMLInputElement;

    if (newEmailInput.value === userEmail) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }

    await handleRequest(e, updateEmail, router);
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <Card
      title='Your Email'
      description='The email address associated with this account.'
      footer={
        <Button
          color='primary'
          size='medium'
          variant='soft'
          type='submit'
          form='emailForm'
          loading={isSubmitting}
          className='self-start'
          disabled={isButtonDisabled}
        >
          Update Email
        </Button>
      }
    >
      <form id='emailForm' onSubmit={(e) => handleSubmit(e)}>
        <Input
          type='email'
          name='newEmail'
          placeholder='Your email'
          maxLength={64}
          className='w-full'
          value={inputValue}
          onChange={handleInputChange}
        />
      </form>
    </Card>
  );
}