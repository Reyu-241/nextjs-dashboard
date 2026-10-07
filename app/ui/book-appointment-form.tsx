'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { ArrowRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { bookAppointment, type PublicBookingState } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

export default function BookAppointmentForm() {
  const initialState: PublicBookingState = { message: null, errors: {} };
  const [state, formAction] = useActionState(bookAppointment, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6" role="status">
        <h2 className="text-lg font-semibold text-green-900">Booking received</h2>
        <p className="mt-2 text-sm text-green-800">{state.message}</p>
        <Link
          href="/"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-green-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          Return to home <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
      <div>
        <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-gray-900">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          maxLength={120}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-describedby="full_name-error"
        />
        <div id="full_name-error" aria-live="polite">
          {state.errors?.full_name?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="date_of_birth" className="mb-2 block text-sm font-medium text-gray-900">
          Date of birth <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          autoComplete="bday"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          aria-describedby="date_of_birth-error"
        />
        <div id="date_of_birth-error" aria-live="polite">
          {state.errors?.date_of_birth?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          maxLength={24}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-describedby="phone-error"
        />
        <div id="phone-error" aria-live="polite">
          {state.errors?.phone?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="starts_at" className="mb-2 block text-sm font-medium text-gray-900">
          Appointment date and time
        </label>
        <input
          id="starts_at"
          name="starts_at"
          type="datetime-local"
          required
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-describedby="starts_at-error"
        />
        <p className="mt-1 text-xs text-gray-500">Times are shown in South African time (SAST).</p>
        <div id="starts_at-error" aria-live="polite">
          {state.errors?.starts_at?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message ? (
        <p className="text-sm text-red-600" role="alert">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="h-12 w-full justify-center gap-2 bg-blue-700 px-5 text-base shadow-md shadow-blue-900/15 transition hover:bg-blue-800 active:bg-blue-900 sm:w-auto"
        >
          <CalendarDaysIcon className="h-5 w-5" />
          Book appointment
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
