import { fetchAppointments } from '@/app/lib/data';
import Form from '@/app/ui/treatments/create-form';

export default async function Page() {
  const appointments = await fetchAppointments();

  return (
    <main>
      <h1 className="mb-6 text-2xl">Add treatment</h1>
      <Form appointments={appointments} />
    </main>
  );
}
