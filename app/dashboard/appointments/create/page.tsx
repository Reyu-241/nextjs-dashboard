import { fetchPatients } from '@/app/lib/data';
import Form from '@/app/ui/appointments/create-form';

export default async function Page() {
  const patients = await fetchPatients();

  return (
    <main>
      <h1 className="mb-6 text-2xl">Add appointment</h1>
      <Form patients={patients} />
    </main>
  );
}