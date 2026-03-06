import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notebookService } from '@/services/mockApi';
import { Notebook } from '@/types';
import { Plus, Book, Clock, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { TextInputModal } from '@/components/TextInputModal';

export default function Dashboard() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [renameModalState, setRenameModalState] = useState<{ isOpen: boolean; id: string; currentTitle: string }>({ isOpen: false, id: '', currentTitle: '' });
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  useEffect(() => {
    const loadNotebooks = async () => {
      const data = await notebookService.getNotebooks();
      setNotebooks(data);
      setLoading(false);
    };
    loadNotebooks();
  }, []);

  const handleCreateNotebook = async (title: string) => {
    const newNotebook = await notebookService.createNotebook(title);
    setNotebooks([newNotebook, ...notebooks]);
    navigate(`/notebook/${newNotebook.id}`);
  };

  const handleDeleteNotebook = async () => {
    if (deleteModalState.id) {
      await notebookService.deleteNotebook(deleteModalState.id);
      setNotebooks(notebooks.filter(n => n.id !== deleteModalState.id));
    }
    setDeleteModalState({ isOpen: false, id: '' });
  };

  const handleRenameNotebook = async (newTitle: string) => {
    const { id, currentTitle } = renameModalState;
    if (newTitle && newTitle !== currentTitle) {
      try {
        const updated = await notebookService.renameNotebook(id, newTitle);
        setNotebooks(notebooks.map(n => n.id === id ? updated : n));
      } catch (err) {
        console.error('Failed to rename notebook', err);
      }
    }
    setRenameModalState({ isOpen: false, id: '', currentTitle: '' });
  };

  return (
    <div className="min-h-screen bg-premium p-8" onClick={() => setActiveMenuId(null)}>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Book className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 animate-gradient-x">
              NotebookLM Clone
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/10 shadow-sm overflow-hidden">
              <img src="https://picsum.photos/seed/user/100/100" alt="User" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="h-64 rounded-[32px] border border-dashed border-white/20 flex flex-col items-center justify-center gap-4 text-white/50 hover:border-indigo-500/50 hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all group bg-white/5 backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors shadow-inner">
              <Plus className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-medium text-lg tracking-wide">New Notebook</span>
          </motion.button>

          {/* Notebook Cards */}
          {loading ? (
            [1, 2].map((i) => (
              <div key={i} className="h-64 rounded-[32px] bg-white/5 animate-pulse border border-white/5" />
            ))
          ) : (
            notebooks.map((notebook) => (
              <motion.div
                key={notebook.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="h-64 bg-white/5 backdrop-blur-xl rounded-[32px] p-6 shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] transition-all duration-300 border border-white/5 hover:border-white/20 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/notebook/${notebook.id}`)}
              >
                {/* Stunning Hover Gradient Top Bar */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-full group-hover:translate-y-0" />

                {/* Subtle Glow Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Book className="w-5 h-5" />
                    </div>
                    <div className="relative">
                      <button
                        className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === notebook.id ? null : notebook.id);
                        }}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {activeMenuId === notebook.id && (
                        <div className="absolute right-0 top-8 w-40 bg-[#0a0a0c] rounded-xl shadow-2xl border border-white/10 py-1 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              setRenameModalState({ isOpen: true, id: notebook.id, currentTitle: notebook.title });
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              setDeleteModalState({ isOpen: true, id: notebook.id });
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{notebook.title}</h3>
                  <p className="text-sm text-white/40">{notebook.sources.length} sources</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Clock className="w-3 h-3" />
                  <span>Edited {new Date(notebook.lastModified).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <TextInputModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNotebook}
        title="Create New Notebook"
        placeholder="Enter notebook title..."
        submitLabel="Create Notebook"
      />

      <TextInputModal
        isOpen={renameModalState.isOpen}
        onClose={() => setRenameModalState({ isOpen: false, id: '', currentTitle: '' })}
        onSubmit={handleRenameNotebook}
        title="Rename Notebook"
        initialValue={renameModalState.currentTitle}
        submitLabel="Rename"
      />

      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, id: '' })}
        onConfirm={handleDeleteNotebook}
        title="Delete Notebook"
        message="Are you sure you want to delete this notebook? This action cannot be undone."
        confirmLabel="Delete forever"
        variant="danger"
      />
    </div>
  );
}
