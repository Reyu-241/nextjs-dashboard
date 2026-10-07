import { fetchAppointments, fetchPatients, fetchTreatments } from '@/app/lib/data';
import { CreateTreatment, UpdateTreatment, DeleteTreatment } from '@/app/ui/treatments/buttons';
import { formatCurrency } from '@/app/lib/utils';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  const [treatments, appointments, patients] = await Promise.all([
    fetchTreatments(),
    fetchAppointments(),
    fetchPatients(),
  ]);

  const patientMap = new Map(patients.map((patient) => [patient.id, patient.full_name]));
  const appointmentMap = new Map(
    appointments.map((appointment) => [
      appointment.id,
      patientMap.get(appointment.patient_id) ?? 'Unknown patient',
    ]),
  );

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Treatments</h1>
        <CreateTreatment />
      </div>

      {treatments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No treatments yet.</p>
      ) : (
        <table className="mt-6 min-w-full text-gray-900">
          <thead className="text-left text-sm font-normal">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-3 py-3 font-medium">Procedure</th>
              <th className="px-3 py-3 font-medium">Fee</th>
              <th className="py-3 pl-6 pr-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {treatments.map((treatment) => (
              <tr key={treatment.id} className="border-b text-sm">
                <td className="whitespace-nowrap px-4 py-3">
                  {appointmentMap.get(treatment.appointment_id) ?? 'Unknown appointment'}
                </td>
                <td className="whitespace-nowrap px-3 py-3">{treatment.procedure}</td>
                <td className="whitespace-nowrap px-3 py-3">{formatCurrency(treatment.fee_cents)}</td>
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  <div className="flex justify-end gap-3">
                    <UpdateTreatment id={treatment.id} />
                    <DeleteTreatment id={treatment.id} />
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
