import { Metadata } from 'next';
import DashboardLayout from '@/app/ui/dashboard/layout';
import { requireClinicUser } from '@/app/lib/patients';

export const metadata: Metadata = {
  title: 'Clinic Dashboard',
  description: 'Patient, appointment, and treatment operations for the clinic dashboard.',
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireClinicUser();
  return <DashboardLayout>{children}</DashboardLayout>;
}