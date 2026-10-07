import { notFound } from 'next/navigation';
import { fetchPatientById } from '@/app/lib/data';
import { createAdminClient } from '@/app/lib/supabase/admin';
import EditForm from '@/app/ui/patients/edit-form';
import { UploadForm } from '@/app/ui/patients/upload-form';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const patient = await fetchPatientById(id);

  if (!patient) {
    notFound();
  }

  let fileUrl: string | null = null;
  if (patient.file_path) {
    const supabase = createAdminClient();
    const { data } = await supabase.storage
      .from('patient-files')
      .createSignedUrl(patient.file_path, 60);
    fileUrl = data?.signedUrl ?? null;
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl">Edit patient</h1>
      {fileUrl ? (
        <p className="mb-4">
          <a href={fileUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">
            View patient file
          </a>
        </p>
      ) : null}
      <div className="mb-6">
        <UploadForm patientId={patient.id} />
      </div>
      <EditForm patient={patient} />
    </main>
  );
}
