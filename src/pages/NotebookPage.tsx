import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notebookService } from '@/services/mockApi';
import { NotebookContext } from '@/context/NotebookContext';
import { Notebook } from '@/types';
import { SourcePanel } from '@/components/SourcePanel';
import { ChatPanel } from '@/components/ChatPanel';
import { NotePanel } from '@/components/NotePanel';
import { ArrowLeft, Share2, MoreHorizontal, PanelLeft, PanelRight } from 'lucide-react';

export default function NotebookPage() {
  const { id } = useParams<{ id: string }>();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  // Mobile sidebar states
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [isNotePanelOpen, setIsNotePanelOpen] = useState(false);

  const refreshNotebook = async () => {
    if (id) {
      try {
        const data = await notebookService.getNotebook(id);
        setNotebook(data);
      } catch {
        setNotebook(null);
      }
    }
  };

  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSourceIds(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          const data = await notebookService.getNotebook(id);
          setNotebook(data);
        } catch {
          setNotebook(null);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-premium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!notebook) {
    return <div>Notebook not found</div>;
  }

  return (
    <NotebookContext.Provider value={{ notebook, setNotebook, refreshNotebook, selectedSourceIds, toggleSourceSelection }}>
      <div className="h-screen flex flex-col bg-premium overflow-hidden text-white">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-premium shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Mobile Toggle: Sources */}
            <button
              onClick={() => setIsSourcePanelOpen(true)}
              className="md:hidden p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="font-semibold text-white truncate max-w-[150px] sm:max-w-xs">{notebook.title}</h1>
              <p className="text-xs text-white/40 hidden sm:block">NotebookLM Clone</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Toggle: Notes */}
            <button
              onClick={() => setIsNotePanelOpen(true)}
              className="md:hidden p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <PanelRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => alert('Share feature coming soon!')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white rounded-full transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => alert('More options coming soon!')}
              className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-medium ml-2 hidden sm:flex">
              H
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          <SourcePanel
            isMobileOpen={isSourcePanelOpen}
            onMobileClose={() => setIsSourcePanelOpen(false)}
          />

          <main className="flex-1 min-w-0 relative flex flex-col">
            <ChatPanel />
          </main>

          <NotePanel
            isMobileOpen={isNotePanelOpen}
            onMobileClose={() => setIsNotePanelOpen(false)}
          />
        </div>
      </div>
    </NotebookContext.Provider>
  );
}
