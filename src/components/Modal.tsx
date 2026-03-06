import React, { Fragment } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'premium';
}

export function Modal({ isOpen, onClose, title, children, variant = 'default' }: ModalProps) {
  const isPremium = variant === 'premium';

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn(
              "fixed inset-0 z-50 backdrop-blur-sm",
              isPremium ? "bg-black/80" : "bg-black/50"
            )}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={cn(
                "rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[95vh]",
                isPremium
                  ? "bg-premium border border-white/10 w-full max-w-4xl text-white"
                  : "bg-white w-full max-w-lg text-gray-900"
              )}
            >
              {!isPremium && (
                <div className="flex items-center justify-between p-6 border-b border-gray-100 uppercase tracking-wider">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              {isPremium && (
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all z-10"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              <div className={cn("overflow-y-auto", isPremium ? "p-4 md:p-12" : "p-6")}>
                {children}
              </div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
