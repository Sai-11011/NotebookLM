import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import {
  FileText,
  Link as LinkIcon,
  Youtube,
  Upload,
  Loader2,
  Search,
  ChevronDown,
  ArrowRight,
  Triangle,
  ClipboardList,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (source: { type: string; name?: string; url?: string; file?: File; content?: string }) => Promise<void>;
}

type ViewType = 'main' | 'web' | 'file' | 'text' | 'drive';

export function AddSourceModal({ isOpen, onClose, onAdd }: AddSourceModalProps) {
  const [view, setView] = useState<ViewType>('main');
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setView('main');
    setUrl('');
    setTextContent('');
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    try {
      await onAdd({ type: 'pdf', file, name: file.name });
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload PDF');
      setLoading(false);
    }
  };

  const handleWebSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setError(null);
    setLoading(true);
    try {
      const type = url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' : 'url';
      await onAdd({ type, url, name: url });
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add web source');
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textContent) return;
    setError(null);
    setLoading(true);
    try {
      await onAdd({ type: 'text', content: textContent, name: 'Pasted Text' });
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save text');
      setLoading(false);
    }
  };

  const renderMainView = () => (
    <div className="flex flex-col items-center">
      {/* Search Bar Segment */}
      <div className="w-full max-w-2xl mb-12">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm"></div>

          <form
            onSubmit={handleWebSubmit}
            className="relative flex items-center bg-[#1a1a1e]/90 backdrop-blur-xl border border-white/10 rounded-full p-2 h-16 shadow-2xl transition-all focus-within:border-blue-500/50"
          >
            <Search className="w-6 h-6 text-white/40 ml-4 shrink-0 transition-colors group-focus-within:text-blue-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search the web for new sources"
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder:text-white/30 px-4 text-lg"
            />
            <div className="hidden md:flex items-center gap-1 shrink-0 px-2 border-l border-white/5 mr-2">
              <button type="button" onClick={() => alert('Web option coming soon!')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg text-sm font-medium text-white/60 transition-colors">
                Web <ChevronDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => alert('Fast Research coming soon!')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg text-sm font-medium text-white/60 transition-colors">
                Fast Research <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!url || loading}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-full flex items-center justify-center transition-all mr-1"
            >
              <ArrowRight className="w-5 h-5 text-white/60" />
            </button>
          </form>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative w-full max-w-2xl aspect-[16/6] border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center group hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer mb-12 overflow-hidden bg-white/[0.02] backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
          />
          <p className="text-2xl text-white/50 font-medium group-hover:text-white mb-2 transition-colors">
            or drop your files
          </p>
          <p className="text-sm text-white/30 group-hover:text-white/50 transition-colors tracking-wide">
            pdf, images, docs, audio, <span className="underline decoration-white/20 underline-offset-4">and more</span>
          </p>
        </div>
      </div>

      {/* Action Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all font-medium text-sm"
        >
          <Upload className="w-5 h-5" />
          Upload files
        </button>
        <button
          onClick={() => { setView('web'); setError(null); }}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all font-medium text-sm"
        >
          <div className="flex -space-x-1">
            <LinkIcon className="w-4 h-4 translate-y-[-1px]" />
            <Youtube className="w-4 h-4 text-red-500" />
          </div>
          Websites
        </button>
        <button
          onClick={() => alert('Google Drive integration coming soon!')}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all font-medium text-sm cursor-pointer"
          title="Google Drive integration coming soon"
        >
          <Triangle className="w-5 h-5 rotate-180" />
          Drive
        </button>
        <button
          onClick={() => setView('text')}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all font-medium text-sm"
        >
          <ClipboardList className="w-5 h-5" />
          Copied text
        </button>
      </div>

      {error && (
        <p className="mt-8 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  );

  const renderTextView = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Paste Text</h3>
        <button onClick={() => setView('main')} className="text-sm text-white/40 hover:text-white underline">Back</button>
      </div>
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Paste your source text here..."
        className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
      />
      <div className="flex justify-end gap-3">
        <button
          onClick={handleTextSubmit}
          disabled={!textContent || loading}
          className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Text Source
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      variant="premium"
    >
      <div className="flex flex-col items-center">
        {view === 'main' && (
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Create Audio and Video Overviews from<br />
              <span className="text-gradient-premium">your notes</span>
            </h1>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            {view === 'main' && renderMainView()}
            {view === 'text' && renderTextView()}
            {view === 'web' && (
              <div className="w-full max-w-xl mx-auto space-y-6 text-center">
                <h3 className="text-xl font-semibold">Add Website or YouTube URL</h3>
                <div className="relative group text-left">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm"></div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="relative w-full bg-[#16161a] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 shadow-inner"
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setView('main')} className="px-6 py-2 rounded-full hover:bg-white/5 transition-colors">Cancel</button>
                  <button
                    onClick={handleWebSubmit}
                    disabled={!url || loading}
                    className="px-8 py-2 bg-white text-black font-semibold rounded-full hover:bg-white/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Add Link
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
}
