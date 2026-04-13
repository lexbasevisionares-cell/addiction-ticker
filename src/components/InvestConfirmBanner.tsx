import { X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../context/I18nContext';
import SlideToConfirm from './SlideToConfirm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingAmount: string;
}

export default function InvestConfirmBanner({ isOpen, onClose, onConfirm, pendingAmount }: Props) {
  const { t } = useI18n();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white/[0.03] rounded-[3rem] p-10 lg:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/[0.05] backdrop-blur-3xl"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-all p-2"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 border border-emerald-500/20">
                <TrendingUp size={32} />
              </div>

              <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 tracking-tighter leading-tight">
                {t.confirmInvestTitle}
              </h3>

              <p className="text-zinc-400 text-sm lg:text-base leading-relaxed mb-12 font-medium uppercase tracking-[0.2em] opacity-80">
                {t.confirmInvestDesc.replace('{amount}', pendingAmount)}
              </p>

              <div className="w-full">
                <SlideToConfirm 
                  onConfirm={() => {
                    onConfirm();
                    onClose();
                  }} 
                  label={t.slideToConfirm}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
