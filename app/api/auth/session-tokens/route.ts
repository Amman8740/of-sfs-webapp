import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

// Returns current user's Supabase session tokens so the extension can call
// authenticated webapp APIs using Authorization headers.
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}


