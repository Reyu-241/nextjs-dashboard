import { fetchAppointments, fetchPatients } from '@/app/lib/data';
import { CreateAppointment, UpdateAppointment, DeleteAppointment } from '@/app/ui/appointments/buttons';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  const [appointments, patients] = await Promise.all([fetchAppointments(), fetchPatients()]);
  const patientMap = new Map(patients.map((patient) => [patient.id, patient.full_name]));

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Appointments</h1>
        <CreateAppointment />
      </div>

      {appointments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No appointments yet. Add the first one.</p>
      ) : (
        <table className="mt-6 min-w-full text-gray-900">
          <thead className="text-left text-sm font-normal">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-3 py-3 font-medium">Starts</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="py-3 pl-6 pr-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b text-sm">
                <td className="whitespace-nowrap px-4 py-3">{patientMap.get(appointment.patient_id) ?? 'Unknown patient'}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  {new Date(appointment.starts_at).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-3 py-3">{appointment.status}</td>
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  <div className="flex justify-end gap-3">
                    <UpdateAppointment id={appointment.id} />
                    <DeleteAppointment id={appointment.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
