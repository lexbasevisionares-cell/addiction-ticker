import { Settings as SettingsIcon, X, HelpCircle, Info, ShieldCheck, Scale, RotateCcw, Trash2, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../context/I18nContext';
import { Capacitor } from '@capacitor/core';
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEditSettings: () => void;
  onShowInfo: (type: 'logic' | 'about' | 'privacy' | 'disclaimer') => void;
  onTriggerAction: (type: 'quit' | 'relapse' | 'reset') => void;
  isFree?: boolean;
}

export default function SideDrawer({ isOpen, onClose, onEditSettings, onShowInfo, onTriggerAction, isFree }: Props) {
  const { t } = useI18n();
  const isWebBrowser = Capacitor.getPlatform() === 'web';
  const APP_STORE_URL = 'https://apps.apple.com/us/app/addiction-ticker/id6761534960';
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Deeper blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          />

          {/* Drawer - Cardless & Ethereal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.8 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] lg:w-[420px] bg-[#050505] z-50 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)] font-sans"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="flex-1 flex flex-col px-6 py-6 lg:p-14 overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 lg:mb-24 shrink-0">
                <span className="text-[10px] lg:text-xs font-medium text-zinc-400 uppercase tracking-[0.8em]">{t.menuTitle}</span>
                <button 
                  onClick={onClose} 
                  className="text-zinc-400 hover:text-white p-2 -mr-2 transition-all active:scale-95"
                  aria-label="Close"
                >
                  <X size={24} className="lg:w-8 lg:h-8" />
                </button>
              </div>

              {/* Menu Items - Typography Focus */}
              <div className="flex flex-col gap-2 lg:gap-4">
                {[
                  { icon: SettingsIcon, label: t.settingsTitle, action: onEditSettings },
                  { icon: HelpCircle, label: t.howItWorks, action: () => onShowInfo('logic') },
                  { icon: Info, label: t.aboutApp, action: () => onShowInfo('about') },
                  { icon: ShieldCheck, label: t.privacyTitle, action: () => onShowInfo('privacy') },
                  { icon: Scale, label: t.disclaimerTitle || 'Vastuuvapauslauseke', action: () => onShowInfo('disclaimer') }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { item.action(); }}
                    className="group flex items-center gap-5 lg:gap-8 py-3.5 lg:py-6 text-base lg:text-2xl font-medium text-white/80 hover:text-white transition-all transform hover:translate-x-1"
                  >
                    <item.icon size={20} className="lg:w-8 lg:h-8 text-zinc-600 group-hover:text-emerald-500 transition-colors shrink-0" />
                    <span className="tracking-tight">{item.label}</span>
                  </button>
                ))}
                {isWebBrowser && (
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="group flex items-center gap-5 lg:gap-8 py-3.5 lg:py-6 text-base lg:text-2xl font-medium text-white/80 hover:text-white transition-all transform hover:translate-x-1"
                  >
                    <Apple size={20} className="lg:w-8 lg:h-8 text-zinc-600 group-hover:text-emerald-500 transition-colors shrink-0" />
                    <span className="tracking-tight">{t.menuDownloadApp}</span>
                  </a>
                )}
              </div>

              <div className="h-px bg-white/5 my-4 lg:my-8 shrink-0" />

              {/* Destructive Actions */}
              <div className="flex flex-col gap-2 lg:gap-4">
                  <button
                    onClick={() => onTriggerAction(!isFree ? 'quit' : 'relapse')}
                    className="group flex items-center gap-5 lg:gap-8 py-3.5 lg:py-6 text-base lg:text-2xl font-medium text-white/80 hover:text-white transition-all transform hover:translate-x-1"
                  >
                    <RotateCcw size={20} className="lg:w-8 lg:h-8 text-zinc-600 group-hover:text-emerald-500 transition-colors shrink-0" />
                    <span className="tracking-tight">{!isFree ? t.quitAddiction : t.resetCounter}</span>
                  </button>
                  <button
                    onClick={() => onTriggerAction('reset')}
                    className="group flex items-center gap-5 lg:gap-8 py-3.5 lg:py-6 text-base lg:text-2xl font-medium text-white/80 hover:text-red-400 transition-all transform hover:translate-x-1"
                  >
                    <Trash2 size={20} className="lg:w-8 lg:h-8 text-zinc-600 group-hover:text-red-500 transition-colors shrink-0" />
                    <span className="tracking-tight text-red-500/80 group-hover:text-red-400 transition-colors">{t.resetAllData}</span>
                  </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 pb-4 lg:pt-10 shrink-0">
                <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-[0.4em]">
                  Addiction Ticker v1.1.1
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
