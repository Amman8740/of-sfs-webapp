'use client';

import React, { useState } from 'react';
import { signInWithOAuth } from '@/lib/utils/auth-helpers/client';
import { type Provider } from '@supabase/supabase-js';
import { Button } from '@/components/ui';
import { GoogleIcon } from '@/components/ui/icons';

type OAuthProviders = {
  name: Provider;
  displayName: string;
  icon: React.JSX.Element;
};

export default function OauthSignIn () {
  const oAuthProviders: OAuthProviders[] = [
    {
      name: 'google',
      displayName: 'Continue with Google',
      icon: <GoogleIcon className='w-5 h-5' />,
    },
    /* Add desired OAuth providers here */
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await signInWithOAuth(e);
    setIsSubmitting(false);
  };

  return (
    <>
      {oAuthProviders.map((provider) => (
        <form key={provider.name} onSubmit={(e) => handleSubmit(e)}>
          <input type='hidden' name='provider' value={provider.name} />
          <Button
            color='gray'
            size='medium'
            variant='soft'
            type='submit'
            className='w-full'
            loading={isSubmitting}
          >
            <span className='mr-2'>{provider.icon}</span>
            <span>{provider.displayName}</span>
          </Button>
        </form>
      ))}
    </>
  );
};
