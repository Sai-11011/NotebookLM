import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TextInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => Promise<void>;
    title: string;
    placeholder?: string;
    initialValue?: string;
    submitLabel?: string;
}

export function TextInputModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    placeholder = '',
    initialValue = '',
    submitLabel = 'Submit'
}: TextInputModalProps) {
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim() || loading) return;

        setLoading(true);
        try {
            await onSubmit(value.trim());
            onClose();
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" variant="premium">
            <div className="flex flex-col space-y-6 max-w-md mx-auto">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">{title}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm"></div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={placeholder}
                            className="relative w-full bg-[#16161a] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500/50 shadow-inner"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2 rounded-full hover:bg-white/5 transition-colors text-white/70"
                        >
                            Cancel
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={!value.trim() || loading}
                            className="px-8 py-2 bg-indigo-500 text-white font-semibold rounded-full hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitLabel}
                        </motion.button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
