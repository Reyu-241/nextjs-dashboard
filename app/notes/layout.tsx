import DashboardLayout from '@/app/ui/dashboard/layout';

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
