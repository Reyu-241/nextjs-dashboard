'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { updateAppointment, type AppointmentState } from '@/app/lib/actions';
import type { Appointment, Patient } from '@/app/lib/data';

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function EditForm({
  appointment,
  patients,
}: {
  appointment: Appointment;
  patients: Patient[];
}) {
  const initialState: AppointmentState = { message: null, errors: {} };
  const updateAppointmentWithId = updateAppointment.bind(null, appointment.id);
  const [state, formAction] = useActionState(updateAppointmentWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="patient_id" className="mb-2 block text-sm font-medium">
            Patient
          </label>
          <select
            id="patient_id"
            name="patient_id"
            defaultValue={appointment.patient_id}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            aria-describedby="patient_id-error"
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
          <div id="patient_id-error" aria-live="polite" aria-atomic="true">
            {state.errors?.patient_id?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="starts_at" className="mb-2 block text-sm font-medium">
            Start time
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(appointment.starts_at)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            aria-describedby="starts_at-error"
          />
          <div id="starts_at-error" aria-live="polite" aria-atomic="true">
            {state.errors?.starts_at?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="mb-2 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={appointment.status}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          >
            <option value="booked">Booked</option>
            <option value="done">Done</option>
            <option value="no_show">No-show</option>
          </select>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/appointments"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
