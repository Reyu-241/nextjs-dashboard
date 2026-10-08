import Link from 'next/link';
import {
  fetchAppointmentStatusThisMonth,
  fetchClinicSummary,
  fetchPatientsPerMonth,
} from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';
import PatientsChart from '@/app/ui/dashboard/patients-chart';
import StatusDonut from '@/app/ui/dashboard/status-donut';

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

export default async function Page() {
  const [summary, perMonth, statusRows] = await Promise.all([
    fetchClinicSummary(),
    fetchPatientsPerMonth(),
    fetchAppointmentStatusThisMonth(),
  ]);
  const { patientCount, appointmentCount, treatmentCount, upcomingAppointments } = summary;

  return (
    <main className="p-6">
      <h1 className={`${lusitana.className} mb-6 text-xl md:text-2xl`}>
        Dashboard
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Patients" value={patientCount} detail="Active patient records" />
        <SummaryCard title="Appointments" value={appointmentCount} detail="All scheduled visits" />
        <SummaryCard title="Treatments" value={treatmentCount} detail="Completed services logged" />
        <SummaryCard title="Upcoming" value={upcomingAppointments.length} detail="Visits in the next window" />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-md border p-4">
          <h2 className="font-semibold">
            Is the practice growing? New patients per month (last 6 months)
          </h2>
          <PatientsChart rows={perMonth} />
        </section>
        <section className="rounded-md border p-4">
          <h2 className="font-semibold">
            What share of this month&apos;s appointments are no-shows?
          </h2>
          <StatusDonut rows={statusRows} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Upcoming visits</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming visits scheduled.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="rounded-md border border-gray-100 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.starts_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {appointment.status}
                    </span>
                  </div>
                  {appointment.patient_phone ? (
                    <p className="mt-2 text-sm text-gray-600">{appointment.patient_phone}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick links</h2>
          <div className="space-y-3">
            <Link href="/dashboard/patients" className="block rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Manage patients
            </Link>
            <Link href="/dashboard/appointments" className="block rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Review appointments
            </Link>
            <Link href="/dashboard/treatments" className="block rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Track treatments
            </Link>
            <Link href="/dashboard/tomorrow" className="block rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Tomorrow view
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}