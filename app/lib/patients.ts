import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function requireClinicUser() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }
}
