import { Settings as SettingsIcon, X, HelpCircle, Info, ShieldCheck, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TranslationStrings } from '../utils/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEditSettings: () => void;
  onShowInfo: (type: 'logic' | 'about' | 'privacy' | 'disclaimer') => void;
  t: TranslationStrings;
}

export default function SideDrawer({ isOpen, onClose, onEditSettings, onShowInfo, t }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-64 bg-zinc-900 border-l border-white/10 z-50 p-6 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t.settingsTitle}</span>
              <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 -mr-2">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onClose(); onEditSettings(); }}
                className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors text-left"
              >
                <SettingsIcon size={18} className="text-zinc-400" />
                {t.settingsTitle}
              </button>
              <button
                onClick={() => { onClose(); onShowInfo('logic'); }}
                className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors text-left"
              >
                <HelpCircle size={18} className="text-zinc-400" />
                {t.howItWorks}
              </button>
              <button
                onClick={() => { onClose(); onShowInfo('about'); }}
                className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors text-left"
              >
                <Info size={18} className="text-zinc-400" />
                {t.aboutApp}
              </button>
              <button
                onClick={() => { onClose(); onShowInfo('privacy'); }}
                className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors text-left"
              >
                <ShieldCheck size={18} className="text-zinc-400" />
                {t.privacyTitle}
              </button>
              <button
                onClick={() => { onClose(); onShowInfo('disclaimer'); }}
                className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-colors text-left"
              >
                <Scale size={18} className="text-zinc-400" />
                {t.disclaimerTitle || 'Vastuuvapauslauseke'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
