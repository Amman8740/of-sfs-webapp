'use client';

import React, { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { SignOut } from '@/lib/utils/auth-helpers/server';
import { handleRequest } from '@/lib/utils/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/lib/utils/auth-helpers/settings';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function SignOutForm () {
  let router: AppRouterInstance | null = useRouter();
  router = getRedirectMethod() === 'client' ? router : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, SignOut, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title='Sign out'
      description='Sign out of () account.'
      footer={
        <form onSubmit={(e) => handleSubmit(e)}>
          <input type='hidden' name='pathName' value={usePathname()} />
          <Button
            type='submit'
            color='primary'
            size='small'
            variant='soft'
            loading={isSubmitting}
            className=''
          >
            Logout
          </Button>
        </form>
      }
    >
      <></>
    </Card>
  );
};
