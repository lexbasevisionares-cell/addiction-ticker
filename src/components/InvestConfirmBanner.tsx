import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import SlideToConfirm from './SlideToConfirm';
import { TranslationStrings } from '../utils/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingAmount: string;
  t: TranslationStrings;
}

export default function InvestConfirmBanner({ isOpen, onClose, onConfirm, pendingAmount, t }: Props) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onConfirm();
      onClose();
      setShowSuccess(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />

          {/* Banner Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[110] p-4 lg:p-10 pointer-events-none"
          >
            <div className="max-w-2xl mx-auto w-full bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] p-8 lg:p-12 pointer-events-auto relative overflow-hidden">
              
              {/* Success Overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center z-50 text-black text-center px-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      <CheckCircle2 size={64} strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="text-2xl font-serif font-black mt-6 tracking-tight">
                      {t.investSuccess}
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col">
                <div className="w-12 h-1 bg-emerald-500/30 rounded-full mb-8" />

                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-4 tracking-tight leading-tight">
                  {t.confirmInvestTitle}
                </h2>
                
                <p className="text-zinc-400 text-sm lg:text-base leading-relaxed mb-10 opacity-90">
                  {t.confirmInvestDesc.replace('{amount}', pendingAmount)}
                </p>

                <div className="w-full">
                  <SlideToConfirm 
                    onConfirm={handleConfirm} 
                    label={t.markAsInvested} 
                    color="emerald" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
