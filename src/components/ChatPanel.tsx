import React, { useState, useRef, useEffect } from 'react';
import { useNotebook } from '@/context/NotebookContext';
import { Send, Sparkles, Bot, User, X, Trash2, AlertCircle, Search, Globe, FileText, PenLine, List, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { notebookService } from '@/services/mockApi';
import { ConfirmationModal } from './ConfirmationModal';
import { RateLimitPopup } from './RateLimitPopup';
import type { ToolCall } from '@/types';

// Map tool names to icons, labels, and colors for the agent step cards
const TOOL_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  search_sources: {
    icon: <Search className="w-4 h-4" />,
    label: 'Searching sources',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  },
  list_sources: {
    icon: <List className="w-4 h-4" />,
    label: 'Listing sources',
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30',
  },
  create_note: {
    icon: <PenLine className="w-4 h-4" />,
    label: 'Creating note',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
  },
  fetch_url_as_source: {
    icon: <Globe className="w-4 h-4" />,
    label: 'Fetching URL',
    color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30',
  },
  search_web_for_info: {
    icon: <Globe className="w-4 h-4" />,
    label: 'Searching the web',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
  },
};

function AgentStepCard({ call, index }: { call: ToolCall; index: number }) {
  const meta = TOOL_META[call.tool] || {
    icon: <Zap className="w-4 h-4" />,
    label: call.tool,
    color: 'from-gray-500/20 to-gray-500/10 border-gray-500/30',
  };

  const argSummary = Object.entries(call.args)
    .filter(([k]) => k !== 'notebook_id')
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm bg-gradient-to-r',
        meta.color
      )}
    >
      <div className="mt-0.5 text-white/70 shrink-0">{meta.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
          {meta.label}
        </p>
        {argSummary && (
          <p className="text-[11px] text-white/50 truncate mt-0.5">{argSummary}</p>
        )}
        {call.result_preview && (
          <p className="text-[11px] text-white/40 truncate mt-1 italic">
            → {call.result_preview.slice(0, 120)}
          </p>
        )}
      </div>
      <div className="shrink-0 mt-0.5">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  const steps = [
    'Analyzing your request...',
    'Searching for information...',
    'Processing results...',
    'Generating response...',
  ];
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex gap-4 max-w-3xl mx-auto"
    >
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="bg-[#16161a]/90 backdrop-blur-xl border border-white/10 shadow-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-[24px] rounded-tl-sm p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <p className="text-[13px] text-indigo-400/80 font-medium tracking-wide">
            {steps[stepIndex]}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ChatPanel() {
  const { notebook, setNotebook, refreshNotebook, selectedSourceIds, toggleSourceSelection } = useNotebook();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isRateLimitOpen, setIsRateLimitOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notebook?.messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !notebook || isTyping) return;

    const userContent = input.trim();
    setInput('');
    setError(null);
    setIsTyping(true);

    // Optimistic: add user message immediately to UI
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user' as const,
      content: userContent,
      timestamp: new Date().toISOString(),
    };
    setNotebook({
      ...notebook,
      messages: [...notebook.messages, tempUserMsg],
    });

    try {
      // Call the real Flask API — this saves both user msg and model response
      await notebookService.sendMessage(notebook.id, userContent);

      // Refresh notebook to get accurate saved state from backend
      await refreshNotebook();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);

      // If it's a 429 rate limit error, show the beautiful popup
      if (errMsg.includes('429') || errMsg.toLowerCase().includes('rate limit') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        setIsRateLimitOpen(true);
      } else {
        setError(`Failed to get a response: ${errMsg}`);
      }

      // Revert optimistic update on error
      setNotebook(notebook);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (!notebook) return;
    try {
      await notebookService.clearChat(notebook.id);
      setNotebook({ ...notebook, messages: [] });
    } catch (err) {
      setError('Failed to clear chat');
    }
  };

  const SUGGESTED_QUESTIONS = [
    "Summarize the key points",
    "What are the main arguments?",
    "Create a timeline of events",
    "Explain the technical terms",
  ];

  if (!notebook) return null;

  const selectedSources = notebook.sources.filter(s => selectedSourceIds.includes(s.id));

  return (
    <div className="flex flex-col h-full bg-premium relative">
      <div className="absolute top-4 right-4 z-10">
        {notebook.messages.length > 0 && (
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6" ref={scrollRef}>
        {notebook.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.15)] border border-white/5">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <p className="text-xl font-medium text-white/90 tracking-tight">Start the conversation</p>
              <p className="text-sm max-w-md text-center text-white/50 leading-relaxed">
                Ask questions about your sources, request summaries, or share a URL for the agent to fetch and analyze.
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={i}
                  onClick={() => {
                    setInput(q);
                    // Use setTimeout to ensure state updates before clicking
                    setTimeout(() => {
                      const btn = document.getElementById('send-button');
                      if (btn) btn.click();
                    }, 0);
                  }}
                  className="p-4 text-left text-sm text-white/70 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all shadow-sm group relative overflow-hidden"
                >
                  <span className="group-hover:text-indigo-300 transition-colors uppercase text-[10px] font-bold tracking-widest block mb-1 opacity-50">Suggestion</span>
                  <span className="group-hover:text-white transition-colors block">{q}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          notebook.messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "flex gap-4 max-w-3xl mx-auto",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-white/10" : "bg-indigo-500/20"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white/60" /> : <Bot className="w-5 h-5 text-indigo-400" />}
              </div>

              <div className={cn(
                "rounded-[24px] max-w-[80%] shadow-lg",
                msg.role === 'user'
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm shadow-indigo-500/20 p-5"
                  : "bg-[#16161a]/90 backdrop-blur-xl border border-white/10 text-white/90 rounded-tl-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
              )}>
                {/* Agent Tool Call Steps (only for model messages) */}
                {msg.role === 'model' && msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="p-4 pb-2 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                        Agent Actions ({msg.toolCalls.length})
                      </span>
                    </div>
                    {msg.toolCalls.map((call, i) => (
                      <AgentStepCard key={i} call={call} index={i} />
                    ))}
                  </div>
                )}

                {/* Message Content */}
                <div className={cn(
                  "markdown-body text-[15px] leading-relaxed",
                  msg.role === 'model' ? "p-5 pt-3" : ""
                )}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {isTyping && <TypingIndicator />}

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-premium/80 backdrop-blur-xl border-t border-white/5 relative z-20">
        <div className="max-w-3xl mx-auto relative group">
          {/* Selected Sources Chips */}
          {selectedSources.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-2">
              {selectedSources.map(source => (
                <span key={source.id} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-medium rounded-full border border-indigo-500/30 backdrop-blur-md">
                  {source.name}
                  <button
                    onClick={() => toggleSourceSelection(source.id)}
                    className="hover:bg-indigo-500/30 hover:text-white rounded-full p-0.5 transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative flex items-center">
            {/* Glowing ring wrapper */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[28px] opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm"></div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={selectedSources.length > 0 ? `Ask about ${selectedSources.length} selected sources...` : "Ask a question, or paste a URL for the agent to analyze..."}
              className="relative w-full pl-6 pr-14 py-4 bg-[#16161a] border border-white/10 rounded-[28px] focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner text-white placeholder:text-white/30 text-[15px]"
              disabled={isTyping}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="send-button"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2.5 p-2.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-400 disabled:opacity-30 transition-all cursor-pointer shadow-lg shadow-indigo-500/30"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-white/40">
            NotebookLM Clone may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearChat}
        title="Clear Chat History"
        message="Are you sure you want to clear this entire conversation? The AI will lose context of previous messages."
        confirmLabel="Clear History"
        variant="danger"
      />

      <RateLimitPopup
        isOpen={isRateLimitOpen}
        onClose={() => setIsRateLimitOpen(false)}
      />
    </div>
  );
}
