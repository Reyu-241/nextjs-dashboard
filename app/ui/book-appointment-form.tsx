'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { ArrowRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { bookAppointment, type PublicBookingState } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

const providersByType = {
  general_practitioner: ['General Practitioner 1', 'General Practitioner 2', 'General Practitioner 3'],
  dentist: ['Dentist 1', 'Dentist 2', 'Dentist 3'],
  nurse: ['Nurse 1', 'Nurse 2', 'Nurse 3'],
} as const;

export default function BookAppointmentForm() {
  const initialState: PublicBookingState = { message: null, errors: {} };
  const [state, formAction] = useActionState(bookAppointment, initialState);
  const [providerType, setProviderType] = useState<keyof typeof providersByType>('general_practitioner');

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

      <div>
        <label htmlFor="provider_type" className="mb-2 block text-sm font-medium text-gray-900">
          Healthcare professional
        </label>
        <select
          id="provider_type"
          name="provider_type"
          required
          value={providerType}
          onChange={(event) => setProviderType(event.target.value as keyof typeof providersByType)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-describedby="provider_type-error"
        >
          <option value="general_practitioner">General practitioner</option>
          <option value="dentist">Dentist</option>
          <option value="nurse">Nurse</option>
        </select>
        <div id="provider_type-error" aria-live="polite">
          {state.errors?.provider_type?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="provider_name" className="mb-2 block text-sm font-medium text-gray-900">
          Choose a professional
        </label>
        <select
          id="provider_name"
          name="provider_name"
          required
          defaultValue={providersByType[providerType][0]}
          key={providerType}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-describedby="provider_name-error"
        >
          {providersByType[providerType].map((provider) => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
        <div id="provider_name-error" aria-live="polite">
          {state.errors?.provider_name?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="appointment_type" className="mb-2 block text-sm font-medium text-gray-900">
          Appointment type
        </label>
        <select
          id="appointment_type"
          name="appointment_type"
          required
          defaultValue="consultation"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-describedby="appointment_type-error"
        >
          <option value="consultation">Consultation without procedure</option>
          <option value="consultation_with_procedure">Consultation with procedure</option>
        </select>
        <div id="appointment_type-error" aria-live="polite">
          {state.errors?.appointment_type?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="payment_method" className="mb-2 block text-sm font-medium text-gray-900">
          Payment method
        </label>
        <select
          id="payment_method"
          name="payment_method"
          required
          defaultValue="private"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-describedby="payment_method-error"
        >
          <option value="medical_aid">Medical aid</option>
          <option value="private">Private</option>
          <option value="insurance">Insurance</option>
        </select>
        <div id="payment_method-error" aria-live="polite">
          {state.errors?.payment_method?.map((error) => (
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
