import { notFound } from 'next/navigation';
import { fetchAppointmentById, fetchPatients } from '@/app/lib/data';
import EditForm from '@/app/ui/appointments/edit-form';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [appointment, patients] = await Promise.all([fetchAppointmentById(id), fetchPatients()]);

  if (!appointment) {
    notFound();
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl">Edit appointment</h1>
      <EditForm appointment={appointment} patients={patients} />
    </main>
  );
}
