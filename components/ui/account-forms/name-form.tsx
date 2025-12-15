'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateName } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { Button, Card, Input } from '@/components/ui';

export default function NameForm({ userName }: { userName: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState(userName);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(!inputValue.trim() || inputValue === userName);
  }, [inputValue, userName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    const fullNameInput = e.currentTarget.elements.namedItem(
      'fullName',
    ) as HTMLInputElement;

    if (fullNameInput.value === userName) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }

    await handleRequest(e, updateName, router);
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <Card
      title='Your Name'
      description='The name associated with this account.'
      footer={
        <Button
          color='primary'
          size='medium'
          variant='soft'
          type='submit'
          form='nameForm'
          loading={isSubmitting}
          className='self-start'
          disabled={isButtonDisabled}
        >
          Update Name
        </Button>
      }
    >
      <form id='nameForm' onSubmit={(e) => handleSubmit(e)}>
        <Input
          type='text'
          name='fullName'
          className='w-full'
          maxLength={64}
          value={inputValue}
          onChange={handleInputChange}
          placeholder='John Doe'
        />
      </form>
    </Card>
  );
}