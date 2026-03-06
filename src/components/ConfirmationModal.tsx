import React from 'react';
import { Modal } from './Modal';
import { motion } from 'motion/react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'info';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger'
}: ConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" variant="premium">
            <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-2",
                    variant === 'danger' ? "bg-red-500/20 text-red-400" : "bg-indigo-500/20 text-indigo-400"
                )}>
                    {variant === 'danger' ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
                    <p className="text-white/60 leading-relaxed italic">
                        "{message}"
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-medium border border-white/5"
                    >
                        {cancelLabel}
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={cn(
                            "flex-1 px-6 py-3 rounded-xl transition-all font-bold shadow-lg",
                            variant === 'danger'
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                                : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
                        )}
                    >
                        {confirmLabel}
                    </motion.button>
                </div>
            </div>
        </Modal>
    );
}
