import type { Metadata } from 'next';
import Link from 'next/link';
import BookAppointmentForm from '@/app/ui/book-appointment-form';
import { lusitana } from '@/app/ui/fonts';

export const metadata: Metadata = {
  title: 'Book an appointment | Clinic',
  description: 'Request a clinic appointment online.',
};

export default function BookPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Clinic home
        </Link>
        <h1 className={`${lusitana.className} mt-6 text-3xl text-gray-900`}>
          Book an appointment
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your contact details and choose a date and time. No account is needed.
        </p>
        <div className="mt-6">
          <BookAppointmentForm />
        </div>
      </div>
    </main>
  );
}
