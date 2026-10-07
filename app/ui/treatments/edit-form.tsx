'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { updateTreatment, type TreatmentState } from '@/app/lib/actions';
import type { Appointment, Treatment } from '@/app/lib/data';

export default function EditForm({
  treatment,
  appointments,
}: {
  treatment: Treatment;
  appointments: Appointment[];
}) {
  const initialState: TreatmentState = { message: null, errors: {} };
  const updateTreatmentWithId = updateTreatment.bind(null, treatment.id);
  const [state, formAction] = useActionState(updateTreatmentWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="appointment_id" className="mb-2 block text-sm font-medium">
            Appointment
          </label>
          <select
            id="appointment_id"
            name="appointment_id"
            defaultValue={treatment.appointment_id}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            aria-describedby="appointment_id-error"
          >
            {appointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {new Date(appointment.starts_at).toLocaleString()} - {appointment.status}
              </option>
            ))}
          </select>
          <div id="appointment_id-error" aria-live="polite" aria-atomic="true">
            {state.errors?.appointment_id?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="procedure" className="mb-2 block text-sm font-medium">
            Procedure
          </label>
          <input
            id="procedure"
            name="procedure"
            type="text"
            defaultValue={treatment.procedure}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            aria-describedby="procedure-error"
          />
          <div id="procedure-error" aria-live="polite" aria-atomic="true">
            {state.errors?.procedure?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="fee_cents" className="mb-2 block text-sm font-medium">
            Fee (cents)
          </label>
          <input
            id="fee_cents"
            name="fee_cents"
            type="number"
            min="0"
            step="1"
            defaultValue={treatment.fee_cents}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            aria-describedby="fee_cents-error"
          />
          <div id="fee_cents-error" aria-live="polite" aria-atomic="true">
            {state.errors?.fee_cents?.map((error) => (
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
          href="/dashboard/treatments"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
