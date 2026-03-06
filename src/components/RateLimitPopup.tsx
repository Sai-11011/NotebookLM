import React from 'react';
import { Modal } from './Modal';
import { motion } from 'motion/react';
import { AlertCircle, Clock } from 'lucide-react';

interface RateLimitPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RateLimitPopup({ isOpen, onClose }: RateLimitPopupProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" variant="premium">
            <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto py-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                    <AlertCircle className="w-8 h-8" />
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Rate Limit Reached</h2>
                    <p className="text-white/60 leading-relaxed text-sm">
                        You've reached the free tier usage limit for the Gemini AI model. This helps us ensure fair access for everyone.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full flex items-start gap-3 text-left">
                    <Clock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-white font-medium mb-1">When can I ask again?</p>
                        <p className="text-white/50">Your limit resets shortly (usually within a minute for RPM limits, or tomorrow for daily limits).</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all font-semibold border border-white/10"
                >
                    Got it
                </motion.button>
            </div>
        </Modal>
    );
}
