import { createClient } from '@/lib/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
    .from('user-profiles')
    .select('*')
    .eq('id', user.id)

    if (!error) {
      return Response.json({ error: error }, { status: 401 });
    }
    
    return Response.json({ data: data });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 

