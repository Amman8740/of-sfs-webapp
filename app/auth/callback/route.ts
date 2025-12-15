import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/lib/utils/helpers';
import { checkOnboardingStatus } from '@/lib/utils/onboarding';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again.",
        ),
      );
    }

    // Check if user needs onboarding
    if (data.user) {
      const onboardingStatus = await checkOnboardingStatus(data.user.id);
      
      if (onboardingStatus.needsOnboarding) {
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
      }
      
      // Redirect to appropriate dashboard based on user type
      console.log('Auth callback - onboarding status:', onboardingStatus);
      const redirectPath = onboardingStatus.userType === 'agency' ? '/agency' : '/creator';
      console.log('Auth callback - redirecting to:', redirectPath);
      return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
}
