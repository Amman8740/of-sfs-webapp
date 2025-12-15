import React from 'react';
import { Button, Card, Logo } from '@/components/ui';
import { createClient } from '@/lib/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod,
} from '@/lib/utils/auth-helpers/settings';
import { PasswordSignIn } from '@/components/ui/auth-forms/password-signin';
import EmailSignIn from '@/components/ui/auth-forms/email-signin';
import ForgotPassword from '@/components/ui/auth-forms/forgot-password';
import UpdatePassword from '@/components/ui/auth-forms/update-password';
import SignUp from '@/components/ui/auth-forms/signup';
import Separator from '@/components/ui/auth-forms/separator';
import OauthSignIn from '@/components/ui/auth-forms/o-auth-signin';
import Link from 'next/link';
import { SignInToastDisplay } from '@/components/auth/signin-toast-display';

export default async function SignIn({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ disable_button: boolean }>;
}) {
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Declare 'viewProp' and initialize with the default value
  let viewProp: string;

  // Assign url id to 'viewProp' if it's a valid string and ViewTypes includes it
  const { id } = await params;
  const awaitedSearchParams = await searchParams;
  if (typeof id === 'string' && viewTypes.includes(id)) {
    viewProp = id;
  } else {
    const preferredSignInView =
      (await cookies()).get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    // Check user type and redirect appropriately
    const { data: userProfile } = await (supabase as any)
      .from('user_profiles')
      .select('user_type, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();
    
    if (!userProfile || !userProfile.onboarding_completed) {
      return redirect('/onboarding');
    }
    
    const redirectPath = userProfile.user_type === 'agency' ? '/agency' : '/creator';
    return redirect(redirectPath);
  } else if (!user && viewProp === 'update_password') {
    return redirect('/signin');
  }

  return (
    <>
      <SignInToastDisplay />
      <nav className='fixed right-5 top-5'>
        {viewProp === 'signup' ? (
          <Link href='/signin'>
            <Button color='gray' variant='ghost' size='small'>
              Login
            </Button>
          </Link>
        ) : viewProp !== 'update_password' &&
          viewProp !== 'forgot_password' &&
          viewProp !== 'reset_password' ? (
          <Link href='/signin/signup'>
            <Button color='gray' variant='ghost' size='small'>
              Register
            </Button>
          </Link>
        ) : null}
      </nav>
      {viewProp === 'forgot_password' || viewProp === 'update_password' ? (
        <nav className='fixed top-0 left-0 right-0 flex items-center justify-center pt-2 pb-2'>
          <Link href='/'>
            <Logo className="w-48 h-48" />
          </Link>
        </nav>
      ) : null}
      <div className={`flex flex-col items-center justify-center w-full ${viewProp === 'forgot_password' || viewProp === 'update_password' ? 'pt-36' : ''} h-full min-h-screen p-0`} style={{ background: 'linear-gradient(to bottom right, rgba(219, 234, 258, 1) 10%, rgba(255, 255, 255, 1) 40%)' }}>
        <div className='flex flex-col h-auto gap-0 w-96'>
          {viewProp !== 'forgot_password' && viewProp !== 'update_password' ? (
            <div className='flex justify-center'>
              <Link href='/'>
                <Logo className="w-48 h-48" />
              </Link>
            </div>
          ) : null}
          <Card
            title={
              viewProp === 'forgot_password'
                ? 'Forgot your password?'
                : viewProp === 'update_password'
                  ? 'Update Password'
                  : viewProp === 'signup'
                    ? 'Welcome to App'
                    : 'Sign In'
            }
            description={
              viewProp === 'signup'
                ? "Get started by creating an account. It's free."
                : viewProp === 'reset_password'
                  ? "Don't worry, we'll send you a message to help you reset your password."
                  : viewProp === 'forgot_password'
                    ? "Don't worry, we'll send you a message to help you reset your password."
                    : viewProp === 'update_password'
                      ? 'Please set a new password for your account'
                      : 'Login to continue to the app.'
            }
          >
            <div>
              {viewProp !== 'update_password' &&
                viewProp !== 'forgot_password' &&
                allowOauth && (
                  <>
                    <OauthSignIn />
                    <Separator text='OR' />
                  </>
                )}
              {viewProp === 'password_signin' && (
                <PasswordSignIn
                  allowEmail={allowEmail}
                  redirectMethod={redirectMethod}
                />
              )}
              {viewProp === 'email_signin' && (
                <EmailSignIn
                  allowPassword={allowPassword}
                  redirectMethod={redirectMethod}
                  disableButton={awaitedSearchParams.disable_button}
                />
              )}
              {viewProp === 'forgot_password' && (
                <ForgotPassword
                  allowEmail={allowEmail}
                  redirectMethod={redirectMethod}
                  disableButton={awaitedSearchParams.disable_button}
                />
              )}
              {viewProp === 'update_password' && (
                <UpdatePassword redirectMethod={redirectMethod} />
              )}
              {viewProp === 'signup' && (
                <SignUp
                  allowEmail={allowEmail}
                  redirectMethod={redirectMethod}
                />
              )}
            </div>
          </Card>
        </div>
        <div>
          <p className='py-4 text-xs text-canvas-text'>
            By continuing, you agree to our{' '}
            <Link href='/terms-of-service' className='text-canvas-text-contrast'>
              Terms of services{' '}
            </Link>
            and{' '}
            <Link href='/privacy-policy' className='text-canvas-text-contrast'>
              Privacy Policy.
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
