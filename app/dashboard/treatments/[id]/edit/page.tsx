import { notFound } from 'next/navigation';
import { fetchAppointments, fetchTreatmentById } from '@/app/lib/data';
import EditForm from '@/app/ui/treatments/edit-form';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [treatment, appointments] = await Promise.all([
    fetchTreatmentById(id),
    fetchAppointments(),
  ]);

  if (!treatment) {
    notFound();
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl">Edit treatment</h1>
      <EditForm treatment={treatment} appointments={appointments} />
    </main>
  );
}
