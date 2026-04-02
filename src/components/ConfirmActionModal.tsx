import { X } from 'lucide-react';
import { motion } from 'motion/react';
import SlideToConfirm from './SlideToConfirm';
import { UserSettings } from './Onboarding';
import { t } from '../utils/i18n';

interface Props {
  type: 'quit' | 'relapse' | 'reset';
  onConfirm: () => void;
  onCancel: () => void;
  settings: UserSettings;
}

export default function ConfirmActionModal({ type, onConfirm, onCancel, settings }: Props) {
  const isQuit = type === 'quit';
  const isReset = type === 'reset';


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* High-End Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
      />

      {/* Borderless Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(20px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(20px)' }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-[3rem] p-10 lg:p-14 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl"
      >
        <button
          onClick={onCancel}
          className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors p-2"
        >
          <X size={28} />
        </button>

        <div className={`w-16 h-1 rounded-full mb-12 ${isQuit ? 'bg-emerald-500/50' : 'bg-red-500/50'}`} />

        <h2 className="text-3xl lg:text-5xl font-serif font-light text-white/90 mb-4 tracking-tight">
          {isReset ? t.resetAllData : (isQuit ? t.confirmQuit : t.confirmRelapse)}
        </h2>
        <p className="text-zinc-500 text-base lg:text-lg leading-relaxed mb-16 opacity-80 italic font-serif">
          {isReset 
            ? t.resetAllDataDesc
            : (isQuit ? t.confirmQuitDesc : t.confirmRelapseDesc)
          }
        </p>

        {/* Minimalist Slider */}
        <div className="w-full">
          <SlideToConfirm 
            onConfirm={onConfirm} 
            label={isReset ? t.resetCounter : (isQuit ? t.slideToConfirm : t.confirmRelapse)} 
            color={isQuit ? 'emerald' : 'red'} 
          />
        </div>
      </motion.div>
    </div>
  );
}
