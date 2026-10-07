import { createAdminClient } from '@/app/lib/supabase/admin';
import { requireClinicUser } from '@/app/lib/patients';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  await requireClinicUser();
  const supabase = createAdminClient();
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from('appointments')
    .select('id, starts_at, status, patient:patient_id(full_name, phone)')
    .gte('starts_at', start.toISOString())
    .lt('starts_at', end.toISOString())
    .order('starts_at', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205') {
      return (
        <main>
          <h1 className={`${lusitana.className} mb-6 text-2xl`}>Tomorrow at a glance</h1>
          <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            The Supabase appointments table is unavailable to the API. Apply the clinic
            database migration and reload the PostgREST schema cache, then refresh this page.
          </p>
        </main>
      );
    }

    throw new Error(`Database error ${error.code}: failed to fetch visit list.`);
  }

  const appointments = ((data ?? []) as Array<{
    id: string;
    starts_at: string;
    status: 'booked' | 'done' | 'no_show';
    patient?: { full_name: string; phone: string | null } | Array<{ full_name: string; phone: string | null }>;
  }>).map((appointment) => {
    const patient = Array.isArray(appointment.patient)
      ? appointment.patient[0]
      : appointment.patient;

    return {
      ...appointment,
      patient: patient ?? null,
    };
  });

  return (
    <main>
      <h1 className={`${lusitana.className} mb-6 text-2xl`}>Tomorrow at a glance</h1>
      {appointments.length === 0 ? (
        <p className="text-sm text-gray-500">No visits scheduled for the next 24 hours.</p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="rounded-md border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{appointment.patient?.full_name ?? 'Unknown patient'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.starts_at).toLocaleString()} · {appointment.status}
                  </p>
                </div>
                <p className="text-sm text-gray-700">{appointment.patient?.phone ?? 'No phone on file'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
