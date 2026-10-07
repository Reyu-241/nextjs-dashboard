import { Metadata } from 'next';
import DashboardLayout from '@/app/ui/dashboard/layout';

export const metadata: Metadata = {
  title: 'Clinic Dashboard',
  description: 'Patient, appointment, and treatment operations for the clinic dashboard.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}