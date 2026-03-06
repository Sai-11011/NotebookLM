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
    <div className="flex flex-col h-full bg-[#0a0a0c]/80 backdrop-blur-xl relative z-10">
      <div className="p-5 flex justify-between items-center relative z-20">
        <h2 className="font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Notes
        </h2>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10" onClick={() => setActiveMenuId(null)}>
        {notebook.notes.length === 0 ? (
          <div className="text-center p-8 text-white/30 text-sm border border-dashed border-white/10 rounded-2xl bg-white/[0.02] mt-4 mx-2">
            <p className="font-medium text-white/60 mb-2">No notes yet.</p>
            <p className="text-xs leading-relaxed">Save interesting responses from the agent or write your own thoughts here.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } }
            }}
            className="space-y-4"
          >
            {notebook.notes.map((note) => (
              <motion.div
                key={note.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 10 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                whileHover={{ y: -2, scale: 1.01 }}
                className={cn(
                  "p-5 rounded-2xl shadow-lg border group relative transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] isolate overflow-hidden",
                  note.color || "bg-white/5",
                  "border-white/5 hover:border-white/20"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Subtle Inner Highlight */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none" />

                <div className="flex justify-between items-start mb-3 relative z-10">
                  <h3 className="font-semibold text-white/90 text-[15px] tracking-tight pr-6">{note.title}</h3>
                  <div className="absolute right-0 -top-1">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === note.id ? null : note.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-black/20 rounded-lg transition-all text-white/50 hover:text-white backdrop-blur-sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {activeMenuId === note.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-8 w-36 bg-[#16161a]/95 backdrop-blur-xl rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 py-1.5 z-50 overflow-hidden"
                        >
                          <button
                            onClick={() => openEditor(note)}
                            className="w-full text-left px-3.5 py-2.5 text-[13px] font-medium text-white/80 hover:bg-indigo-500/20 hover:text-indigo-300 flex items-center gap-2.5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <div className="h-px bg-white/5 w-full my-0.5" />
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="w-full text-left px-3.5 py-2.5 text-[13px] font-medium text-red-400 hover:bg-red-500/20 flex items-center gap-2.5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap relative z-10 font-normal">{note.content}</p>

                <div className="mt-4 pt-3 border-t border-black/10 flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative z-10">
                  <button
                    className="p-1.5 hover:bg-black/20 rounded-lg text-white/50 hover:text-white transition-colors backdrop-blur-sm"
                    title="Copy to clipboard"
                    onClick={() => navigator.clipboard.writeText(note.content)}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
