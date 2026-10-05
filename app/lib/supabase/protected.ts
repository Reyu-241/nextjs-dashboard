import { redirect } from 'next/navigation';
import { createClient } from './server';

export async function requireSupabaseUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims) {
    redirect('/login');
  }

  return claims;
}