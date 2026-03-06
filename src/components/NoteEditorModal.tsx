import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Note } from '@/types';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  initialNote?: Note;
}

const COLORS = [
  'bg-white/5',
  'bg-red-500/10',
  'bg-orange-500/10',
  'bg-yellow-500/10',
  'bg-green-500/10',
  'bg-blue-500/10',
  'bg-purple-500/10',
  'bg-pink-500/10',
];

export function NoteEditorModal({ isOpen, onClose, onSave, initialNote }: NoteEditorModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialNote?.title || '');
      setContent(initialNote?.content || '');
      setColor(initialNote?.color || COLORS[0]);
    }
  }, [isOpen, initialNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content, color });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialNote ? "Edit Note" : "New Note"} variant="premium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full px-4 py-2 text-lg font-semibold bg-white/5 text-white border-none rounded-lg focus:ring-0 focus:bg-white/10 placeholder:text-white/40 transition-colors"
            required
          />
        </div>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your note..."
            className="w-full px-4 py-2 min-h-[200px] border-none rounded-lg focus:ring-0 resize-none bg-white/5 text-white/90 placeholder:text-white/40 focus:bg-white/10 leading-relaxed transition-colors"
            required
          />
        </div>

        <div className="flex items-center gap-2 py-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border border-white/20 ${c} ${color === c ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1a1a1e]' : ''
                }`}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            Save Note
          </button>
        </div>
      </form>
    </Modal>
  );
}
