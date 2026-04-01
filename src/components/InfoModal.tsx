import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TranslationStrings } from '../utils/i18n';

export type InfoType = 'logic' | 'about' | 'privacy' | 'savedNow' | 'totalSaved' | 'directCost' | 'valueInYear' | 'indirectLoss' | 'potential' | 'disclaimer';

interface Props {
  type: InfoType | null;
  onClose: () => void;
  isFree: boolean;
  t: TranslationStrings;
}

export default function InfoModal({ type, onClose, isFree, t }: Props) {
  const getMetricContent = () => {
    switch (type) {
      case 'savedNow':
        return { title: t.savedNow, description: t.infoSavedNowDesc, color: 'text-emerald-400' };
      case 'totalSaved':
        return { title: t.totalSaved, description: t.infoTotalSavedDesc, color: 'text-emerald-400' };
      case 'directCost':
        return { title: t.directCost, description: t.infoDirectCostDesc, color: 'text-red-400' };
      case 'valueInYear':
        return { title: t.valueInYear.replace(' {year}', ''), description: t.infoValueInYearDesc, color: 'text-emerald-400' };
      case 'indirectLoss':
        return { title: t.indirectLoss, description: t.infoIndirectLossDesc, color: 'text-red-400' };
      case 'potential':
        return { title: t.potentialInYears.split(' {')[0], description: t.infoPotentialDesc, color: isFree ? 'text-emerald-400' : 'text-red-400' };
      default:
        return null;
    }
  };

  const metric = getMetricContent();

  return (
    <AnimatePresence>
      {type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(20px)' }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg bg-white/5 border border-white/10 rounded-[3rem] p-10 lg:p-14 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90dvh] backdrop-blur-3xl no-scrollbar"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors p-2"
            >
              <X size={28} />
            </button>

            <div className={`w-16 h-1 rounded-full mb-12 ${metric ? (metric.color === 'text-emerald-400' ? 'bg-emerald-400/20' : 'bg-red-400/20') : 'bg-white/10'}`} />

            {metric ? (
              <div className="space-y-4">
                <h3 className={`text-3xl lg:text-4xl font-sans font-light ${metric.color} mb-8 tracking-tight`}>{metric.title}</h3>
                <div className="space-y-6 text-base lg:text-lg text-zinc-300 leading-relaxed font-sans font-normal">
                  <p>{metric.description}</p>
                </div>
              </div>
            ) : type === 'logic' ? (
              <div className="space-y-4">
                <h3 className="text-3xl lg:text-4xl font-sans font-light text-white/90 mb-8 tracking-tight">{t.infoLogicTitle}</h3>
                <div className="space-y-6 text-base lg:text-lg text-zinc-500 leading-relaxed font-sans font-normal">
                  {isFree ? (
                    <>
                      <p>
                        {t.infoLogicFreeP1}<span className="text-white/80 font-medium">{t.infoLogicFreeP1_1}</span>{t.infoLogicFreeP1_2}<span className="text-white/80 font-medium">{t.infoLogicFreeP1_3}</span>{t.infoLogicFreeP1_4}
                      </p>
                      <p>
                        {t.infoLogicFreeP2}
                      </p>
                      <div className="pt-4 space-y-4">
                        <p className="flex flex-col">
                          <strong className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-1">{t.savedNow}</strong>
                          <span className="opacity-80 text-sm leading-normal">{t.infoLogicFreeP3}</span>
                        </p>
                        <p className="flex flex-col">
                          <strong className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-1">{t.valueInYear.split(' {')[0]}</strong>
                          <span className="opacity-80 text-sm leading-normal">{t.infoLogicFreeP4}</span>
                        </p>
                        <p className="flex flex-col">
                          <strong className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-1">{t.potentialInYears.split(' {')[0]}</strong>
                          <span className="opacity-80 text-sm leading-normal">{t.infoLogicFreeP5}</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        {t.infoLogicHookedP1}
                      </p>
                      <p>
                        {t.infoLogicHookedP2}<span className="text-white/80 font-medium">{t.infoLogicHookedP2_1}</span>{t.infoLogicHookedP2_2}
                      </p>
                      <div className="pt-4 space-y-4">
                        <p className="flex flex-col">
                          <strong className="text-red-400 font-bold uppercase tracking-widest text-[10px] mb-1">{t.directCost}</strong>
                          <span className="opacity-80 text-sm leading-normal">{t.infoLogicHookedP3}</span>
                        </p>
                        <p className="flex flex-col">
                          <strong className="text-red-400 font-bold uppercase tracking-widest text-[10px] mb-1">{t.indirectLoss}</strong>
                          <span className="opacity-80 text-sm leading-normal">{t.infoLogicHookedP4}<span className="text-white/80 font-medium">{t.infoLogicHookedP4_1}</span>{t.infoLogicHookedP4_2}</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              ) : type === 'disclaimer' ? (
              <div className="space-y-4">
                <h3 className="text-3xl lg:text-4xl font-sans font-light text-white/90 mb-8 tracking-tight">{t.disclaimerTitle}</h3>
                <div className="space-y-6 text-base lg:text-lg text-zinc-500 leading-relaxed font-sans font-normal">
                  <p>{t.disclaimerP1}</p>
                  <p>{t.disclaimerP2}</p>
                  <p>{t.disclaimerP3}</p>
                </div>
              </div>
              ) : type === 'privacy' ? (
              <div className="space-y-4">
                <h3 className="text-3xl lg:text-4xl font-sans font-light text-white/90 mb-8 tracking-tight">{t.privacyTitle}</h3>
                <div className="space-y-6 text-base lg:text-lg text-zinc-500 leading-relaxed font-sans font-normal">
                  <p>
                    {t.privacyDesc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-3xl lg:text-4xl font-sans font-light text-white/90 mb-8 tracking-tight">{t.infoAboutTitle}</h3>
                <div className="space-y-6 text-base lg:text-lg text-zinc-500 leading-relaxed font-sans font-normal">
                  <p>
                    <span className="text-white/80 font-medium">Addiction Ticker</span> {t.infoAboutP1}
                  </p>
                  <p>
                    {t.infoAboutP2}
                  </p>
                  <p>
                    {t.infoAboutP3}
                  </p>
                </div>
              </div>
            ) }
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
