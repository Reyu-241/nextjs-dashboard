'use server';
 
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { requireClinicUser } from './patients';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const PatientSchema = z.object({
  full_name: z.string().min(1, { message: 'Please enter the patient\'s full name.' }),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
});

export type PatientState = {
  errors?: {
    full_name?: string[];
    phone?: string[];
    date_of_birth?: string[];
  };
  message?: string | null;
};

export async function createPatient(prevState: PatientState, formData: FormData) {
  await requireClinicUser();
  const validated = PatientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    date_of_birth: formData.get('date_of_birth'),
  });
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create patient.',
    };
  }
  const { full_name, phone, date_of_birth } = validated.data;

  const supabase = createAdminClient();
  const { error } = await supabase.from('patients').insert({
    full_name,
    phone: phone || null,
    date_of_birth: date_of_birth || null,
    user_id: null,
  });
  if (error) {
    console.error('Failed to create patient:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { message: `Database error ${error.code}: failed to create patient.` };
  }

  revalidatePath('/dashboard/patients');
  redirect('/dashboard/patients');
}

export async function updatePatient(
  id: string,
  prevState: PatientState,
  formData: FormData,
) {
  await requireClinicUser();
  const validated = PatientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    date_of_birth: formData.get('date_of_birth'),
  });
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update patient.',
    };
  }
  const { full_name, phone, date_of_birth } = validated.data;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('patients')
    .update({
      full_name,
      phone: phone || null,
      date_of_birth: date_of_birth || null,
    })
    .eq('id', id);
  if (error) {
    console.error('Failed to update patient:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { message: `Database error ${error.code}: failed to update patient.` };
  }

  revalidatePath('/dashboard/patients');
  redirect('/dashboard/patients');
}

export async function deletePatient(id: string) {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete patient:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Database error ${error.code}: failed to delete patient.`);
  }
  revalidatePath('/dashboard/patients');
}

const AppointmentSchema = z.object({
  patient_id: z.string().min(1, { message: 'Please select a patient.' }),
  starts_at: z.string().min(1, { message: 'Please choose a start time.' }),
  status: z.enum(['booked', 'done', 'no_show'], {
    invalid_type_error: 'Please select a valid appointment status.',
  }),
});

export type AppointmentState = {
  errors?: {
    patient_id?: string[];
    starts_at?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createAppointment(
  prevState: AppointmentState,
  formData: FormData,
) {
  await requireClinicUser();
  const validated = AppointmentSchema.safeParse({
    patient_id: formData.get('patient_id'),
    starts_at: formData.get('starts_at'),
    status: formData.get('status'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create appointment.',
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('appointments').insert({
    patient_id: validated.data.patient_id,
    starts_at: validated.data.starts_at,
    status: validated.data.status,
    user_id: null,
  });

  if (error) {
    console.error('Failed to create appointment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { message: `Database error ${error.code}: failed to create appointment.` };
  }

  revalidatePath('/dashboard/appointments');
  redirect('/dashboard/appointments');
}

export async function updateAppointment(
  id: string,
  prevState: AppointmentState,
  formData: FormData,
) {
  await requireClinicUser();
  const validated = AppointmentSchema.safeParse({
    patient_id: formData.get('patient_id'),
    starts_at: formData.get('starts_at'),
    status: formData.get('status'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update appointment.',
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('appointments')
    .update({
      patient_id: validated.data.patient_id,
      starts_at: validated.data.starts_at,
      status: validated.data.status,
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update appointment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { message: `Database error ${error.code}: failed to update appointment.` };
  }

  revalidatePath('/dashboard/appointments');
  redirect('/dashboard/appointments');
}

export async function deleteAppointment(id: string) {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete appointment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Database error ${error.code}: failed to delete appointment.`);
  }
  revalidatePath('/dashboard/appointments');
}

const TreatmentSchema = z.object({
  appointment_id: z.string().min(1, { message: 'Please select an appointment.' }),
  procedure: z.string().min(1, { message: 'Please enter a procedure name.' }),
  fee_cents: z.coerce.number().int().nonnegative({
    message: 'Please enter a valid fee in cents.',
  }),
});

export type TreatmentState = {
  errors?: {
    appointment_id?: string[];
    procedure?: string[];
    fee_cents?: string[];
  };
  message?: string | null;
};

export async function createTreatment(
  prevState: TreatmentState,
  formData: FormData,
) {
  await requireClinicUser();
  const validated = TreatmentSchema.safeParse({
    appointment_id: formData.get('appointment_id'),
    procedure: formData.get('procedure'),
    fee_cents: formData.get('fee_cents'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create treatment.',
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('treatments').insert({
    appointment_id: validated.data.appointment_id,
    procedure: validated.data.procedure,
    fee_cents: validated.data.fee_cents,
    user_id: null,
  });

  if (error) {
    console.error('Failed to create treatment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { message: `Database error ${error.code}: failed to create treatment.` };
  }

  revalidatePath('/dashboard/treatments');
  redirect('/dashboard/treatments');
}

export async function updateTreatment(
  id: string,
  prevState: TreatmentState,
  formData: FormData,
) {
  await requireClinicUser();
  const validated = TreatmentSchema.safeParse({
    appointment_id: formData.get('appointment_id'),
    procedure: formData.get('procedure'),
    fee_cents: formData.get('fee_cents'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update treatment.',
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('treatments')
    .update({
      appointment_id: validated.data.appointment_id,
      procedure: validated.data.procedure,
      fee_cents: validated.data.fee_cents,
    })
    .eq('id', id);

  if (error) {
    console.error('Failed to update treatment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { message: `Database error ${error.code}: failed to update treatment.` };
  }

  revalidatePath('/dashboard/treatments');
  redirect('/dashboard/treatments');
}

export async function deleteTreatment(id: string) {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from('treatments').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete treatment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Database error ${error.code}: failed to delete treatment.`);
  }
  revalidatePath('/dashboard/treatments');
}