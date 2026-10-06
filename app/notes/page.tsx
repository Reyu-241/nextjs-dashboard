import { auth } from '@/auth';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createNote, deleteNote, updateNote } from './actions';

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=%2Fnotes');
  }

  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from('notes')
    .select('id, title')
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch notes:', error);
    throw new Error('Failed to load notes.');
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Notes</h1>

      <form action={createNote} className="mb-8 flex gap-3">
        <label className="sr-only" htmlFor="new-note-title">
          Note title
        </label>
        <input
          id="new-note-title"
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="Write a note"
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Add note
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="text-gray-600">No notes yet. Add your first note above.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-3"
            >
              <form action={updateNote} className="flex min-w-0 flex-1 gap-2">
                <input type="hidden" name="id" value={note.id} />
                <label className="sr-only" htmlFor={`note-${note.id}`}>
                  Edit note
                </label>
                <input
                  id={`note-${note.id}`}
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  defaultValue={note.title}
                  className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2"
                />
                <button
                  type="submit"
                  className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50"
                >
                  Save
                </button>
              </form>
              <form action={deleteNote}>
                <input type="hidden" name="id" value={note.id} />
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
