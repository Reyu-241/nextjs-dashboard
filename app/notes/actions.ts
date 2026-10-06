'use server';

import { auth } from '@/auth';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const noteTitleSchema = z.string().trim().min(1).max(200);
const noteIdSchema = z.coerce.number().int().positive().safe();

async function requireSignedInUser() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=%2Fnotes');
  }
}

function getNoteTitle(formData: FormData) {
  const parsed = noteTitleSchema.safeParse(formData.get('title'));
  if (!parsed.success) {
    throw new Error('A note title of 1 to 200 characters is required.');
  }
  return parsed.data;
}

function getNoteId(formData: FormData) {
  const parsed = noteIdSchema.safeParse(formData.get('id'));
  if (!parsed.success) {
    throw new Error('Invalid note ID.');
  }
  return parsed.data;
}

export async function createNote(formData: FormData) {
  await requireSignedInUser();
  const title = getNoteTitle(formData);
  const supabase = await createClient();
  const { error } = await supabase.from('notes').insert({ title });

  if (error) {
    console.error('Failed to create note:', error);
    throw new Error('Failed to create note.');
  }

  revalidatePath('/notes');
}

export async function updateNote(formData: FormData) {
  await requireSignedInUser();
  const id = getNoteId(formData);
  const title = getNoteTitle(formData);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .update({ title })
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('Failed to update note:', error);
    throw new Error('Failed to update note.');
  }
  if (!data.length) {
    throw new Error('Note not found.');
  }

  revalidatePath('/notes');
}

export async function deleteNote(formData: FormData) {
  await requireSignedInUser();
  const id = getNoteId(formData);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('Failed to delete note:', error);
    throw new Error('Failed to delete note.');
  }
  if (!data.length) {
    throw new Error('Note not found.');
  }

  revalidatePath('/notes');
}
