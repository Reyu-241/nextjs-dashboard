import { notFound } from 'next/navigation'
import { fetchAppointmentById, fetchPatients } from '@/app/lib/data'
import EditAppointmentForm from '@/app/ui/appointments/edit-form'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [appointment, patients] = await Promise.all([fetchAppointmentById(id), fetchPatients()])
  if (!appointment) notFound()
  return <EditAppointmentForm appointment={appointment} patients={patients} />
}