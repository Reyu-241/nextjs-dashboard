import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { requireClinicUser } from './patients';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchRevenue() {
  try {
    // We artificially delay a response for demo purposes.
    // Don't do this in production :)
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
 
    const data = await sql<Revenue[]>`SELECT * FROM revenue`;
 
    console.log('Data fetch completed after 3 seconds.');
 
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}


export type Patient = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  file_path: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  user_id: string | null;
  patient_id: string;
  starts_at: string;
  status: 'booked' | 'done' | 'no_show';
  provider_type: 'general_practitioner' | 'dentist' | 'nurse' | null;
  provider_name: string | null;
  appointment_type: 'consultation' | 'consultation_with_procedure' | null;
  payment_method: 'medical_aid' | 'private' | 'insurance' | null;
  created_at: string;
};

export type Treatment = {
  id: string;
  user_id: string | null;
  appointment_id: string;
  procedure: string;
  fee_cents: number;
  created_at: string;
};

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;

  const code = String(error.code ?? '').toUpperCase();
  const message = String(error.message ?? '').toLowerCase();

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('relation') && message.includes('does not exist')
  );
}

export async function fetchPatients(): Promise<Patient[]> {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, user_id, full_name, phone, date_of_birth, file_path, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch patients:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('Failed to fetch patients.');
  }
  return data as Patient[];
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, user_id, full_name, phone, date_of_birth, file_path, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch patient:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('Failed to fetch patient.');
  }
  return (data as Patient | null) ?? null;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('id, user_id, patient_id, starts_at, status, provider_type, provider_name, appointment_type, payment_method, created_at')
    .order('starts_at', { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('Appointments table is not yet created in Supabase. Returning empty list until migration is applied.');
      return [];
    }

    console.error('Failed to fetch appointments:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('Failed to fetch appointments.');
  }

  return (data ?? []) as Appointment[];
}

export async function fetchTreatments(): Promise<Treatment[]> {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('treatments')
    .select('id, user_id, appointment_id, procedure, fee_cents, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('Treatments table is not yet created in Supabase. Returning empty list until migration is applied.');
      return [];
    }

    console.error('Failed to fetch treatments:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('Failed to fetch treatments.');
  }

  return (data ?? []) as Treatment[];
}

export async function fetchAppointmentById(id: string): Promise<Appointment | null> {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('id, user_id, patient_id, starts_at, status, provider_type, provider_name, appointment_type, payment_method, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('Appointments table is not yet created in Supabase. Returning null for this record.');
      return null;
    }

    console.error('Failed to fetch appointment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('Failed to fetch appointment.');
  }

  return (data as Appointment | null) ?? null;
}

export async function fetchTreatmentById(id: string): Promise<Treatment | null> {
  await requireClinicUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('treatments')
    .select('id, user_id, appointment_id, procedure, fee_cents, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('Treatments table is not yet created in Supabase. Returning null for this record.');
      return null;
    }

    console.error('Failed to fetch treatment:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('Failed to fetch treatment.');
  }

  return (data as Treatment | null) ?? null;
}

export type ClinicSummary = {
  patientCount: number;
  appointmentCount: number;
  treatmentCount: number;
  upcomingAppointments: Array<{
    id: string;
    starts_at: string;
    status: 'booked' | 'done' | 'no_show';
    patient_name: string;
    patient_phone: string | null;
  }>;
};

export async function fetchClinicSummary(): Promise<ClinicSummary> {
  await requireClinicUser();
  const supabase = createAdminClient();

  const [patientsResult, appointmentsResult, treatmentsResult, upcomingResult] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }),
    supabase.from('appointments').select('id', { count: 'exact', head: true }),
    supabase.from('treatments').select('id', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('id, starts_at, status, patient:patient_id(full_name, phone)')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(5),
  ]);

  if (isMissingTableError(patientsResult.error) || isMissingTableError(appointmentsResult.error) || isMissingTableError(treatmentsResult.error) || isMissingTableError(upcomingResult.error)) {
    return {
      patientCount: 0,
      appointmentCount: 0,
      treatmentCount: 0,
      upcomingAppointments: [],
    };
  }

  const patientCount = patientsResult.count ?? 0;
  const appointmentCount = appointmentsResult.count ?? 0;
  const treatmentCount = treatmentsResult.count ?? 0;

  const upcomingAppointments = (upcomingResult.data ?? []).map((row: any) => ({
    id: row.id,
    starts_at: row.starts_at,
    status: row.status,
    patient_name: row.patient?.full_name ?? 'Unknown patient',
    patient_phone: row.patient?.phone ?? null,
  }));

  return {
    patientCount,
    appointmentCount,
    treatmentCount,
    upcomingAppointments,
  };
}

export interface StatusRow {
  status: 'booked' | 'done' | 'no_show'
  total: number
}

export interface PatientsPerMonthRow {
  label: string
  new_patients: number
}

export async function fetchPatientsPerMonth(): Promise<PatientsPerMonthRow[]> {
  await requireClinicUser()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('patients_per_month')
    .select('label, new_patients')
    .order('month_start', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as PatientsPerMonthRow[]
}

export async function fetchAppointmentStatusThisMonth(): Promise<StatusRow[]> {
  await requireClinicUser()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('appointment_status_this_month')
    .select('status, total')

  if (error) throw new Error(error.message)
  return (data ?? []) as StatusRow[]
}
