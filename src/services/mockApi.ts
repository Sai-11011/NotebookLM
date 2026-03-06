import { Notebook, Source, Note, Message } from '@/types';

/**
 * Base URL for the Flask backend API.
 * In production, Flask serves both the frontend and the API on the same port,
 * so we can use a relative URL. During Vite dev server usage, set VITE_API_URL
 * in your .env to point to http://localhost:5000.
 */
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const notebookService = {
  // ── Notebooks ─────────────────────────────────────────────────────────────

  getNotebooks: async (): Promise<Notebook[]> => {
    return apiFetch<Notebook[]>('/api/notebooks');
  },

  getNotebook: async (id: string): Promise<Notebook> => {
    return apiFetch<Notebook>(`/api/notebooks/${id}`);
  },

  createNotebook: async (title: string): Promise<Notebook> => {
    return apiFetch<Notebook>('/api/notebooks', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  renameNotebook: async (id: string, title: string): Promise<Notebook> => {
    return apiFetch<Notebook>(`/api/notebooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  deleteNotebook: async (id: string): Promise<void> => {
    await apiFetch(`/api/notebooks/${id}`, { method: 'DELETE' });
  },

  // ── Sources ──────────────────────────────────────────────────────────────

  addSource: async (
    notebookId: string,
    source: { type: string; name?: string; url?: string; content?: string; file?: File }
  ): Promise<Source> => {
    // PDF upload uses FormData, others use JSON
    if (source.type === 'pdf' && source.file) {
      const form = new FormData();
      form.append('type', 'pdf');
      form.append('file', source.file);
      const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/sources`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Upload failed: ${res.status}`);
      }
      return res.json();
    }

    return apiFetch<Source>(`/api/notebooks/${notebookId}/sources`, {
      method: 'POST',
      body: JSON.stringify(source),
    });
  },

  deleteSource: async (notebookId: string, sourceId: string): Promise<void> => {
    await apiFetch(`/api/notebooks/${notebookId}/sources/${sourceId}`, {
      method: 'DELETE',
    });
  },

  // ── Notes ────────────────────────────────────────────────────────────────

  addNote: async (
    notebookId: string,
    note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Note> => {
    return apiFetch<Note>(`/api/notebooks/${notebookId}/notes`, {
      method: 'POST',
      body: JSON.stringify(note),
    });
  },

  updateNote: async (
    notebookId: string,
    noteId: string,
    updates: Partial<Omit<Note, 'id' | 'createdAt'>>
  ): Promise<Note> => {
    return apiFetch<Note>(`/api/notebooks/${notebookId}/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteNote: async (notebookId: string, noteId: string): Promise<void> => {
    await apiFetch(`/api/notebooks/${notebookId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  // ── Chat ─────────────────────────────────────────────────────────────────

  sendMessage: async (notebookId: string, message: string): Promise<Message> => {
    return apiFetch<Message>(`/api/notebooks/${notebookId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  getMessages: async (notebookId: string): Promise<Message[]> => {
    return apiFetch<Message[]>(`/api/notebooks/${notebookId}/chat`);
  },

  clearChat: async (notebookId: string): Promise<void> => {
    await apiFetch(`/api/notebooks/${notebookId}/chat`, { method: 'DELETE' });
  },
};
