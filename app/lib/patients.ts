import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { cache } from 'react';

export const requireClinicUser = cache(async function requireClinicUser() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.id) {
    throw new Error('The signed-in clinic user has no account ID.');
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc('claim_unowned_clinic_data', {
    requested_user_id: session.user.id,
  });

  if (error) {
    console.error('Failed to initialize clinic data ownership:', {
      code: error.code,
      message: error.message,
    });
    throw new Error('Failed to initialize clinic data ownership.');
  }

  return session.user.id;
});
