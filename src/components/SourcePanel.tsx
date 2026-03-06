import React, { useState } from 'react';
import { useNotebook } from '@/context/NotebookContext';
import { FileText, Link as LinkIcon, Youtube, File, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AddSourceModal } from './AddSourceModal';
import { ConfirmationModal } from './ConfirmationModal';
import { notebookService } from '@/services/mockApi';

interface SourcePanelProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function SourcePanel({ isMobileOpen, onMobileClose }: SourcePanelProps) {
  const { notebook, setNotebook, selectedSourceIds, toggleSourceSelection, refreshNotebook } = useNotebook();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  if (!notebook) return null;

  const handleAddSource = async (sourceData: { type: string; name?: string; url?: string; file?: File }) => {
    try {
      const newSource = await notebookService.addSource(notebook.id, sourceData);
      setNotebook({
        ...notebook,
        sources: [...notebook.sources, newSource],
      });
      // Fetch the full notebook to ensure the server state is completely synced
      await refreshNotebook();
    } catch (error) {
      console.error('Failed to add source:', error);
      throw error; // Re-throw so AddSourceModal can display the error
    }
  };

  const confirmDeleteSource = async () => {
    if (!deleteModalState.id) return;

    try {
      await notebookService.deleteSource(notebook.id, deleteModalState.id);
      setNotebook({
        ...notebook,
        sources: notebook.sources.filter(s => s.id !== deleteModalState.id),
      });
      // Also remove from selectedSourceIds if it was selected
      if (selectedSourceIds.includes(deleteModalState.id)) {
        toggleSourceSelection(deleteModalState.id);
      }
      await refreshNotebook();
    } catch (error) {
      console.error('Failed to delete source:', error);
      alert('Failed to delete source');
    } finally {
      setDeleteModalState({ isOpen: false, id: '' });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'url': return <LinkIcon className="w-4 h-4 text-blue-500" />;
      case 'youtube': return <Youtube className="w-4 h-4 text-red-600" />;
      default: return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const Content = (
    <div className="flex flex-col h-full bg-[#0a0a0c]/80 backdrop-blur-xl border-r border-white/5 relative z-10">
      <div className="p-5 flex justify-between items-center relative z-20">
        <h2 className="font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Sources
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
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

      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
        {notebook.sources.length === 0 ? (
          <div className="text-center p-6 text-white/30 text-sm border border-dashed border-white/10 rounded-2xl mx-2 mt-4 bg-white/[0.02]">
            No sources yet. Click '+' to start building your knowledge base.
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="space-y-3"
          >
            {notebook.sources.map((source) => {
              const isSelected = selectedSourceIds.includes(source.id);
              return (
                <motion.div
                  key={source.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleSourceSelection(source.id)}
                  className={cn(
                    "group flex items-center gap-3 p-3.5 rounded-xl transition-all cursor-pointer select-none relative overflow-hidden",
                    isSelected
                      ? "bg-indigo-500/15 border border-indigo-500/30 shadow-[0_4px_20px_-5px_rgba(99,102,241,0.2)]"
                      : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                  )}
                >
                  <div className="shrink-0 relative z-10">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all duration-300",
                      isSelected ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "border-white/20 bg-transparent group-hover:border-white/40"
                    )}>
                      {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className={cn("text-[13px] font-medium truncate transition-colors", isSelected ? "text-indigo-200" : "text-white/80 group-hover:text-white")}>
                      {source.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getIcon(source.type)}
                      <p className="text-[10px] font-medium tracking-wider text-white/30 truncate">{source.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModalState({ isOpen: true, id: source.id });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/15 text-red-400/70 hover:text-red-400 rounded-lg transition-all z-20 backdrop-blur-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-transparent relative z-20">
        <div className="text-xs text-white/40 text-center">
          {selectedSourceIds.length} of {notebook.sources.length} selected
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r border-white/10 flex-col h-full shrink-0">
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#0a0a0c] z-50 md:hidden shadow-xl border-r border-white/10"
            >
              {Content}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddSourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSource}
      />

      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, id: '' })}
        onConfirm={confirmDeleteSource}
        title="Remove Source"
        message="Are you sure you want to remove this source from your notebook? The AI will lose access to this information."
        confirmLabel="Remove"
        variant="danger"
      />
    </>
  );
}
