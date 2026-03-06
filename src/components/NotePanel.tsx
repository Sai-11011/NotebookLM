import React, { useState } from 'react';
import { useNotebook } from '@/context/NotebookContext';
import { Plus, MoreVertical, Copy, Download, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { NoteEditorModal } from './NoteEditorModal';
import { notebookService } from '@/services/mockApi';
import { Note } from '@/types';

interface NotePanelProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function NotePanel({ isMobileOpen, onMobileClose }: NotePanelProps) {
  const { notebook, setNotebook } = useNotebook();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (!notebook) return null;

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingNote) {
        const updatedNote = await notebookService.updateNote(notebook.id, editingNote.id, noteData);
        setNotebook({
          ...notebook,
          notes: notebook.notes.map(n => n.id === editingNote.id ? updatedNote : n),
        });
      } else {
        const newNote = await notebookService.addNote(notebook.id, noteData);
        setNotebook({
          ...notebook,
          notes: [...notebook.notes, newNote],
        });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note');
    }
    setEditingNote(undefined);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await notebookService.deleteNote(notebook.id, noteId);
      setNotebook({
        ...notebook,
        notes: notebook.notes.filter(n => n.id !== noteId),
      });
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note');
    }
  };

  const openEditor = (note?: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
    setActiveMenuId(null);
  };

  const handleExport = () => {
    if (!notebook.notes.length) return;

    const text = notebook.notes.map(n => `# ${n.title}\n\n${n.content}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notebook.title}-notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Content = (
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0c]">
        <h2 className="font-semibold text-white/80">Notes</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={!notebook.notes.length}
            className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors disabled:opacity-50"
            title="Export notes"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => openEditor()}
            className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" onClick={() => setActiveMenuId(null)}>
        {notebook.notes.length === 0 ? (
          <div className="text-center p-8 text-white/40 text-sm border-2 border-dashed border-white/20 rounded-xl">
            <p>No notes yet.</p>
            <p className="mt-2 text-xs">Save interesting responses or write your own thoughts here.</p>
          </div>
        ) : (
          notebook.notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-4 rounded-xl shadow-sm border border-white/10 group relative transition-all hover:shadow-md",
                note.color || "bg-white/5"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white text-sm">{note.title}</h3>
                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === note.id ? null : note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity text-white/50 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === note.id && (
                    <div className="absolute right-0 top-6 w-32 bg-[#0a0a0c] rounded-lg shadow-2xl border border-white/10 py-1 z-10">
                      <button
                        onClick={() => openEditor(note)}
                        className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{note.content}</p>

              <div className="mt-3 pt-3 border-t border-white/10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white"
                  title="Copy to clipboard"
                  onClick={() => navigator.clipboard.writeText(note.content)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 border-l border-white/10 flex-col h-full shrink-0">
        {Content}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 bg-[#0a0a0c] z-50 md:hidden shadow-xl border-l border-white/10"
            >
              {Content}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <NoteEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(undefined);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
      />
    </>
  );
}
