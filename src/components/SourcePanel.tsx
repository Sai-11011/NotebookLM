import React, { useState } from 'react';
import { useNotebook } from '@/context/NotebookContext';
import { FileText, Link as LinkIcon, Youtube, File, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AddSourceModal } from './AddSourceModal';
import { notebookService } from '@/services/mockApi';

interface SourcePanelProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function SourcePanel({ isMobileOpen, onMobileClose }: SourcePanelProps) {
  const { notebook, setNotebook, selectedSourceIds, toggleSourceSelection } = useNotebook();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (!notebook) return null;

  const handleAddSource = async (sourceData: { type: string; name?: string; url?: string; file?: File }) => {
    try {
      const newSource = await notebookService.addSource(notebook.id, sourceData);
      setNotebook({
        ...notebook,
        sources: [...notebook.sources, newSource],
      });
    } catch (error) {
      console.error('Failed to add source:', error);
      throw error; // Re-throw so AddSourceModal can display the error
    }
  };

  const handleDeleteSource = async (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this source?')) return;

    try {
      await notebookService.deleteSource(notebook.id, sourceId);
      setNotebook({
        ...notebook,
        sources: notebook.sources.filter(s => s.id !== sourceId),
      });
    } catch (error) {
      console.error('Failed to delete source:', error);
      alert('Failed to delete source');
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
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0c]">
        <h2 className="font-semibold text-white/80">Sources</h2>
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

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notebook.sources.length === 0 ? (
          <div className="text-center p-4 text-white/40 text-sm">
            No sources added yet. Upload a PDF or add a link to get started.
          </div>
        ) : (
          notebook.sources.map((source) => {
            const isSelected = selectedSourceIds.includes(source.id);
            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => toggleSourceSelection(source.id)}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer select-none relative",
                  isSelected
                    ? "bg-indigo-500/20 border-indigo-500/30 ring-1 ring-indigo-500/30"
                    : "bg-white/5 border-white/10"
                )}
              >
                <div className="shrink-0">
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isSelected ? "bg-indigo-500 border-indigo-500" : "border-white/20 bg-transparent"
                  )}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", isSelected ? "text-indigo-300" : "text-white/80")}>
                    {source.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {getIcon(source.type)}
                    <p className="text-xs text-white/40 truncate">{source.type.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSource(e, source.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-[#0a0a0c]">
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
    </>
  );
}
