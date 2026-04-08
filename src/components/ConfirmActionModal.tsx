import { motion, AnimatePresence } from 'motion/react';
import { t } from '../utils/i18n';
import { UserSettings } from './Onboarding';

interface Props {
  type: 'quit' | 'relapse' | 'reset';
  onConfirm: () => void;
  onCancel: () => void;
  settings: UserSettings;
}

export default function ConfirmActionModal({ type, onConfirm, onCancel }: Props) {
  const isDestructive = type === 'reset' || type === 'relapse';
  
  const content = {
    quit: {
      title: t.confirmQuit,
      desc: t.confirmQuitDesc,
      action: t.quitAddiction,
      color: 'emerald'
    },
    relapse: {
      title: t.confirmRelapse,
      desc: t.confirmRelapseDesc,
      action: t.resetCounter,
      color: 'red'
    },
    reset: {
      title: t.resetAllData,
      desc: t.resetAllDataDesc,
      action: t.resetAllData,
      color: 'red'
    }
  }[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 100, filter: 'blur(20px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 100, filter: 'blur(20px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg bg-zinc-950/50 rounded-[3rem] p-10 lg:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 backdrop-blur-3xl overflow-hidden"
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-1 rounded-full mb-10 ${isDestructive ? 'bg-red-500/40' : 'bg-emerald-500/40'}`} />
            
            <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 tracking-tighter leading-tight">
              {content.title}
            </h3>
            
            <p className="text-zinc-200 text-sm lg:text-base leading-relaxed mb-12 max-w-[280px] font-medium uppercase tracking-[0.4em] opacity-80">
              {content.desc}
            </p>

            <div className="flex flex-col w-full gap-4">
              <button
                onClick={onConfirm}
                className={`w-full py-6 rounded-full font-semibold uppercase tracking-[0.6em] text-[10px] transition-all active:scale-95 shadow-lg ${
                  isDestructive 
                    ? 'bg-red-600 text-white shadow-red-900/40' 
                    : 'bg-white text-black shadow-white/20'
                }`}
              >
                {content.action}
              </button>
              
              <button
                onClick={onCancel}
                className="w-full py-6 rounded-full font-semibold uppercase tracking-[0.6em] text-[10px] text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                {t.back}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
