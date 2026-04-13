import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../context/I18nContext';
export type InfoType = 'logic' | 'about' | 'privacy' | 'savedNow' | 'totalSaved' | 'directCost' | 'valueInYear' | 'indirectLoss' | 'potential' | 'disclaimer' | 'hookedTimer' | 'lostNow' | 'lostInvestment' | 'qDailyCost' | 'qAnnualPriceIncrease' | 'qExpectedReturn' | 'qInvestReminderThreshold' | 'qNotificationLevel' | 'qMaxForecastYears';
interface Props {
  type: InfoType | null;
  onClose: () => void;
  isFree: boolean;
}

export default function InfoModal({ type, onClose, isFree }: Props) {
  const { t } = useI18n();
  const getMetricContent = () => {
    switch (type) {
      case 'savedNow':
        return { title: t.savedNow, description: t.infoSavedNowDesc, color: 'text-emerald-500' };
      case 'totalSaved':
        return { title: t.totalSaved, description: t.infoTotalSavedDesc, color: 'text-emerald-500' };
      case 'directCost':
        return { title: t.directCost, description: t.infoDirectCostDesc, color: 'text-red-500' };
      case 'valueInYear':
        return { title: t.valueInYear.replace(' {year}', ''), description: t.infoValueInYearDesc, color: 'text-emerald-500' };
      case 'indirectLoss':
        return { title: t.indirectLoss, description: t.infoIndirectLossDesc, color: 'text-red-500' };
      case 'potential':
        return { title: t.potentialInYears.split(' {')[0], description: t.infoPotentialDesc, color: isFree ? 'text-emerald-500' : 'text-red-500' };
      case 'lostNow':
        return { title: t.lostNow, description: t.infoLostNowDesc, color: 'text-red-500' };
      case 'lostInvestment':
        return { title: t.lostInvestment, description: t.infoLostInvestmentDesc, color: 'text-red-500' };
      case 'qDailyCost':
        return { title: (t as any).modalDailyCostTitle, description: (t as any).modalDailyCostDesc, color: 'text-zinc-300' };
      case 'qAnnualPriceIncrease':
        return { title: (t as any).modalAnnualIncreaseTitle, description: (t as any).modalAnnualIncreaseDesc, color: 'text-zinc-300' };
      case 'qExpectedReturn':
        return { title: (t as any).modalExpectedReturnTitle, description: (t as any).modalExpectedReturnDesc, color: 'text-zinc-300' };
      case 'qInvestReminderThreshold':
        return { title: (t as any).modalInvestReminderTitle, description: (t as any).modalInvestReminderDesc, color: 'text-zinc-300' };
      case 'qNotificationLevel':
        return { title: (t as any).modalMotivatorTitle, description: (t as any).modalMotivatorDesc, color: 'text-zinc-300' };
      case 'qMaxForecastYears':
        return { title: (t as any).modalMaxForecastYearsTitle, description: (t as any).modalMaxForecastYearsDesc, color: 'text-zinc-300' };
      default:
        return null;
    }
  };

  const metric = getMetricContent();

  return (
    <AnimatePresence>
      {type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* Modal - Ethereal typography focus */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(20px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl bg-white/[0.03] rounded-[3rem] p-8 lg:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[85dvh] backdrop-blur-3xl no-scrollbar border border-white/[0.05]"
          >
            <button
              onClick={onClose}
              className="absolute top-10 right-10 text-zinc-400 hover:text-white transition-all active:scale-90 p-2"
              aria-label="Close"
            >
              <X size={32} strokeWidth={3} />
            </button>

            {/* Decorative line - Subtle and neutral */}
            <div className="w-12 h-px bg-white/20 rounded-full mb-12" />

            {metric ? (
              <div className="space-y-5">
                <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 tracking-tighter leading-tight break-words">{metric.title}</h3>
                <div className="text-base lg:text-xl text-zinc-300 leading-relaxed font-normal">
                  <p>{metric.description}</p>
                </div>
              </div>
            ) : type === 'hookedTimer' ? (
              <div className="space-y-5">
                <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 tracking-tighter leading-tight break-words">
                  {isFree ? t.infoFreeTimerTitle : t.infoHookedTimerTitle}
                </h3>
                <div className="space-y-6 text-base lg:text-xl text-zinc-300 leading-relaxed font-normal">
                  <p>{isFree ? t.infoFreeTimerP1 : t.infoHookedTimerP1}</p>
                  <p>{isFree ? t.infoFreeTimerP2 : t.infoHookedTimerP2}</p>
                  <p className="text-white font-medium">{isFree ? t.infoFreeTimerP3 : t.infoHookedTimerP3}</p>
                </div>
              </div>
            ) : type === 'logic' ? (
              <div className="space-y-8">
                <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 tracking-tighter leading-tight break-words">{t.infoLogicTitle}</h3>
                <div className="space-y-8">
                  <p className="text-base lg:text-xl text-zinc-500 leading-relaxed font-normal">{t.infoLogicGeneral}</p>
                  
                  <div className="space-y-10">
                    {(isFree ? [
                      { label: t.dashSaved, desc: t.infoLogicFreeDesc1 },
                      { label: t.dashPureSavings.replace(' {years} vuodessa', ''), desc: t.infoLogicFreeDesc2 },
                      { label: t.dashInvested.replace(' {years} vuodessa', ''), desc: t.infoLogicFreeDesc3 },
                      { label: t.dashTotalWealth.replace(' {years} vuoden kuluttua', ''), desc: t.infoLogicFreeDesc4 }
                    ] : [
                      { label: t.dashLost, desc: t.infoLogicHookedDesc1 },
                      { label: t.dashPureCosts.replace(' {years} vuodessa', ''), desc: t.infoLogicHookedDesc2 },
                      { label: t.dashLostInvested.replace(' {years} vuodessa', ''), desc: t.infoLogicHookedDesc3 },
                      { label: t.dashLostWealth.replace(' {years} vuodessa', ''), desc: t.infoLogicHookedDesc4 }
                    ]).map((item, idx) => (
                      <div key={idx} className="space-y-3">
                         <h4 className="text-xl lg:text-2xl font-light tracking-tight text-white">
                           {item.label}
                         </h4>
                         <p className="text-base lg:text-xl text-zinc-400 leading-relaxed font-normal">
                           {item.desc}
                         </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              ) : type === 'disclaimer' ? (
              <div className="space-y-5">
                <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 tracking-tighter leading-tight break-words">{t.disclaimerTitle}</h3>
                <div className="space-y-6 text-base lg:text-xl text-zinc-300 leading-relaxed font-normal">
                  <p>{t.disclaimerP1}</p>
                  <p>{t.disclaimerP2}</p>
                  <p>{t.disclaimerP3}</p>
                </div>
              </div>
              ) : type === 'privacy' ? (
              <div className="space-y-5">
                <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 tracking-tighter leading-tight break-words">{t.privacyTitle}</h3>
                <div className="space-y-6 text-base lg:text-xl text-zinc-300 leading-relaxed font-normal">
                  <p>{t.privacyDesc}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 tracking-tighter leading-tight break-words">{t.infoAboutTitle}</h3>
                <div className="space-y-6 text-base lg:text-xl text-zinc-300 leading-relaxed font-normal">
                  <p>
                    <span className="text-white font-medium">Addiction Ticker</span> {t.infoAboutP1}
                  </p>
                  <p>{t.infoAboutP2}</p>
                  <p>{t.infoAboutP3}</p>
                </div>
              </div>
            ) }
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
