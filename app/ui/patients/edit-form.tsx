'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { updatePatient, type PatientState } from '@/app/lib/actions';
import type { Patient } from '@/app/lib/data';

export default function EditForm({ patient }: { patient: Patient }) {
  const initialState: PatientState = { message: null, errors: {} };
  const updatePatientWithId = updatePatient.bind(null, patient.id);
  const [state, formAction] = useActionState(updatePatientWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="full_name" className="mb-2 block text-sm font-medium">Full name</label>
          <input id="full_name" name="full_name" type="text" defaultValue={patient.full_name}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            aria-describedby="full_name-error" />
          <div id="full_name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.full_name?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">Phone</label>
          <input id="phone" name="phone" type="tel" defaultValue={patient.phone ?? ''}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm" />
        </div>
        <div className="mb-4">
          <label htmlFor="date_of_birth" className="mb-2 block text-sm font-medium">Date of birth</label>
          <input id="date_of_birth" name="date_of_birth" type="date" defaultValue={patient.date_of_birth ?? ''}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm" />
        </div>
        <div aria-live="polite" aria-atomic="true">
          {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link href="/dashboard/patients"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200">
          Cancel
        </Link>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
// app/dashboard/patients/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { fetchPatientById } from '@/app/lib/data';
import EditForm from '@/app/ui/patients/edit-form';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const patient = await fetchPatientById(id);

  if (!patient) {
    notFound();
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl">Edit patient</h1>
      <EditForm patient={patient} />
    </main>
  );
}
// app/dashboard/patients/[id]/edit/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested patient.</p>
      <Link href="/dashboard/patients"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-400">
        Go back
      </Link>
    </main>
  );
}