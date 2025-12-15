import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

/**
 * API endpoint to check authentication status for the extension
 * This allows the extension to verify if the user is logged in
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        isAuthenticated: false, 
        user: null 
      });
    }

    // Get basic user info
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ 
      isAuthenticated: true, 
      user: {
        id: user.id,
        email: userData?.email || user.email,
        full_name: userData?.full_name || user.user_metadata?.full_name
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      isAuthenticated: false, 
      user: null 
    });
  }
}
