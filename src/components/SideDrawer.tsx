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
            className="fixed top-0 right-0 bottom-0 w-64 lg:w-[400px] xl:w-[480px] bg-zinc-900 border-l border-white/10 z-50 flex flex-col shadow-2xl"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="flex-1 flex flex-col p-6 lg:p-12">
              <div className="flex justify-between items-center mb-10 lg:mb-16">
                <span className="text-xs lg:text-sm font-bold text-zinc-400 uppercase tracking-[0.25em]">{t.menuTitle}</span>
                <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 -mr-2 transition-transform hover:scale-110">
                  <X size={24} className="lg:w-8 lg:h-8" />
                </button>
              </div>

              <div className="flex flex-col gap-1 lg:gap-4">
                <button
                  onClick={() => { onEditSettings(); }}
                  className="group flex items-center gap-4 lg:gap-6 text-sm lg:text-xl xl:text-2xl font-medium text-zinc-200 hover:text-white hover:bg-white/5 p-3.5 lg:p-5 rounded-2xl transition-all text-left"
                >
                  <SettingsIcon size={20} className="lg:w-8 lg:h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  {t.settingsTitle}
                </button>
                <button
                  onClick={() => { onShowInfo('logic'); }}
                  className="group flex items-center gap-4 lg:gap-6 text-sm lg:text-xl xl:text-2xl font-medium text-zinc-200 hover:text-white hover:bg-white/5 p-3.5 lg:p-5 rounded-2xl transition-all text-left"
                >
                  <HelpCircle size={20} className="lg:w-8 lg:h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  {t.howItWorks}
                </button>
                <button
                  onClick={() => { onShowInfo('about'); }}
                  className="group flex items-center gap-4 lg:gap-6 text-sm lg:text-xl xl:text-2xl font-medium text-zinc-200 hover:text-white hover:bg-white/5 p-3.5 lg:p-5 rounded-2xl transition-all text-left"
                >
                  <Info size={20} className="lg:w-8 lg:h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  {t.aboutApp}
                </button>
                <button
                  onClick={() => { onShowInfo('privacy'); }}
                  className="group flex items-center gap-4 lg:gap-6 text-sm lg:text-xl xl:text-2xl font-medium text-zinc-200 hover:text-white hover:bg-white/5 p-3.5 lg:p-5 rounded-2xl transition-all text-left"
                >
                  <ShieldCheck size={20} className="lg:w-8 lg:h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  {t.privacyTitle}
                </button>
                <button
                  onClick={() => { onShowInfo('disclaimer'); }}
                  className="group flex items-center gap-4 lg:gap-6 text-sm lg:text-xl xl:text-2xl font-medium text-zinc-200 hover:text-white hover:bg-white/5 p-3.5 lg:p-5 rounded-2xl transition-all text-left"
                >
                  <Scale size={20} className="lg:w-8 lg:h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  {t.disclaimerTitle || 'Vastuuvapauslauseke'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
