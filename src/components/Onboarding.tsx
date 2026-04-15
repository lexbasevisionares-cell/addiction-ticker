import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Info } from 'lucide-react';
import WheelPicker from './WheelPicker';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingStatusScreen from './OnboardingStatusScreen';
import InfoModal, { InfoType } from './InfoModal';
import { getCurrencySymbol, Language, Currency } from '../utils/i18n';
import { useI18n } from '../context/I18nContext';

export interface UserSettings {
  language?: Language;
  currency?: Currency;
  dailyCost: number;
  annualPriceIncrease: number;
  expectedReturn: number;
  investReminderThreshold?: number;
  maxForecastYears?: number;
  soundscapeEnabled?: boolean;
  notificationLevel: number;
}

export type InitialStatus = {
  type: 'now' | 'past' | 'hooked';
  startTime: number;
}

interface Props {
  onSave: (settings: UserSettings, status?: InitialStatus) => void;
  initialSettings?: UserSettings | null;
}

const getLocalDatetimeString = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export default function Onboarding({ onSave, initialSettings }: Props) {
  const [showWelcome, setShowWelcome] = useState(!initialSettings);
  const [step, setStep] = useState(0);

  const [statusType, setStatusType] = useState<'now' | 'past' | 'hooked' | null>(null);
  const [pastDate, setPastDate] = useState(getLocalDatetimeString());
  const [bgNumbers, setBgNumbers] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  const { t, language, currency, setLanguage, setCurrency } = useI18n();

  useEffect(() => {
    setBgNumbers(Array.from({ length: 150 }).map(() => Math.random().toString().slice(2)));
  }, []);

  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    if (initialSettings) {
      return {
        dailyCost: initialSettings.dailyCost,
        annualPriceIncrease: initialSettings.annualPriceIncrease,
        expectedReturn: initialSettings.expectedReturn,
        investReminderThreshold: initialSettings.investReminderThreshold,
        maxForecastYears: initialSettings.maxForecastYears,
        soundscapeEnabled: initialSettings.soundscapeEnabled,
      };
    }
    return { dailyCost: 7.00, annualPriceIncrease: 5.0, expectedReturn: 7.0, investReminderThreshold: 0.01, notificationLevel: 3, maxForecastYears: 75, soundscapeEnabled: false };
  });

  const screens: { type: string; data: any }[] = [];

  if (!initialSettings) {
    screens.push({ type: 'preferences', data: null });
  }

  const activeQuestions = [
    { id: 'dailyCost', labelKey: 'dailyCostLabel', suffix: getCurrencySymbol(currency), min: 0, max: 100, decimals: 2 },
    { id: 'annualPriceIncrease', labelKey: 'annualIncreaseLabel', suffix: '%', min: 0, max: 20, decimals: 1 },
    { id: 'expectedReturn', labelKey: 'expectedReturnLabel', suffix: '%', min: 0, max: 20, decimals: 1 },
  ];
  activeQuestions.forEach(q => screens.push({ type: 'question', data: q }));

  if (!initialSettings) {
    screens.push({ type: 'status', data: null });

    if (statusType === 'past') {
      screens.push({ type: 'past-date', data: null });
    }
  }

  const currentScreen = screens[step];

  const handleNext = () => {
    if (currentScreen.type === 'status' && !statusType) return;

    if (step < screens.length - 1) {
      setStep(s => s + 1);
    } else {
      const status: InitialStatus | undefined = (!initialSettings && statusType)
        ? { type: statusType, startTime: statusType === 'past' ? new Date(pastDate).getTime() : Date.now() }
        : undefined;

      onSave({
        language,
        currency,
        dailyCost: answers.dailyCost,
        annualPriceIncrease: answers.annualPriceIncrease,
        expectedReturn: answers.expectedReturn,
        notificationLevel: (answers as any).notificationLevel !== undefined ? (answers as any).notificationLevel : 3,
        maxForecastYears: (answers as any).maxForecastYears,
        soundscapeEnabled: (answers as any).soundscapeEnabled !== undefined ? (answers as any).soundscapeEnabled : false
      }, status);
    }
  };

  const getScreenTitle = (): string => {
    if (currentScreen.type === 'preferences') return t.preferences;
    if (currentScreen.type === 'status') return t.statusTitle;
    if (currentScreen.type === 'past-date') return t.statusPastTitle;
    if (currentScreen.type === 'question') return (t as any)[currentScreen.data!.labelKey];
    return '';
  };

  const isNextDisabled = currentScreen.type === 'status' && !statusType;

  const renderScreenContent = () => {
    if (currentScreen.type === 'preferences') {
      return (
        <div className="flex flex-col items-center justify-center w-full relative px-4 mt-6">
          <div className="w-full max-w-sm space-y-4">
            <div className="w-full flex items-center justify-between py-6 lg:py-8 border-b border-white/20">
              <span className="text-zinc-200 font-medium text-base lg:text-xl tracking-tight">{t.languageLabel}</span>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-white font-sans text-base lg:text-xl focus:outline-none appearance-none cursor-pointer text-right min-w-[100px]"
              >
                <option value="en" className="bg-zinc-900 text-white">English</option>
                <option value="es" className="bg-zinc-900 text-white">Español</option>
                <option value="fr" className="bg-zinc-900 text-white">Français</option>
                <option value="de" className="bg-zinc-900 text-white">Deutsch</option>
                <option value="it" className="bg-zinc-900 text-white">Italiano</option>
                <option value="pt" className="bg-zinc-900 text-white">Português</option>
                <option value="fi" className="bg-zinc-900 text-white">Suomi</option>
              </select>
            </div>
            <div className="w-full flex items-center justify-between py-6 lg:py-8 border-b border-white/20">
              <span className="text-zinc-200 font-medium text-base lg:text-xl tracking-tight">{t.currencyLabel}</span>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-white font-sans text-base lg:text-xl focus:outline-none appearance-none cursor-pointer text-right min-w-[100px]"
              >
                <option value="EUR" className="bg-zinc-900 text-white">€ EUR</option>
                <option value="USD" className="bg-zinc-900 text-white">$ USD</option>
                <option value="GBP" className="bg-zinc-900 text-white">£ GBP</option>
                <option value="BRL" className="bg-zinc-900 text-white">R$ BRL</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (currentScreen.type === 'status') {
      return (
        <OnboardingStatusScreen
          statusType={statusType}
          onStatusChange={setStatusType}
          borderless={true}
        />
      );
    }

    if (currentScreen.type === 'past-date') {
      return (
        <div className="flex flex-col items-center justify-center w-full relative px-4">
          <div className="w-full max-w-sm space-y-4">
            <label className="text-zinc-600 text-[10px] uppercase tracking-[0.6em] block text-center mb-8 font-semibold">
              {t.statusPastDesc}
            </label>
            <input
              type="datetime-local"
              value={pastDate}
              onChange={(e) => setPastDate(e.target.value)}
              className="w-full bg-white/[0.02] rounded-3xl p-8 text-white font-sans tabular-nums text-3xl focus:outline-none focus:bg-white/[0.04] backdrop-blur-3xl transition-all text-center appearance-none"
            />
          </div>
        </div>
      );
    }

    if (currentScreen.type === 'question') {
      return (
        <div className="flex flex-col items-center justify-center w-full relative">
          <WheelPicker
            value={answers[currentScreen.data!.id]}
            min={currentScreen.data!.min}
            max={currentScreen.data!.max}
            decimals={currentScreen.data!.decimals}
            suffix={currentScreen.data!.suffix}
            locale={language === 'fi' ? 'fi-FI' : 'en-US'}
            onChange={(val) => setAnswers(prev => ({ ...prev, [currentScreen.data!.id]: val }))}
          />
        </div>
      );
    }

    return null;
  };

  if (showWelcome) {
    return <OnboardingWelcome onStart={() => setShowWelcome(false)} />;
  }

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else setShowWelcome(true);
  };

  return (
    <div className="h-full bg-[#050505] text-white flex flex-col font-sans overflow-hidden relative">
      
      {/* Background numbers - more subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.01] flex flex-wrap content-start font-sans tabular-nums text-[9px] break-all leading-none">
        {bgNumbers.map((num, i) => (
          <span key={i} className="p-0.5">{num}</span>
        ))}
      </div>

      {/* FIXED TOP BAR: PERFECTLY ALIGNED GRID TO MATCH TICKER */}
      <div className="w-full px-6 pt-[clamp(8px,1dvh,16px)] pb-4 relative z-20 flex flex-col items-center">
        <div className="w-full relative flex items-center justify-center h-12">
          {/* Title centered */}
          <div className="text-[12px] md:text-[13px] font-semibold text-white/90 uppercase tracking-[0.6em] pointer-events-none">
            Addiction Ticker
          </div>
        </div>
        
        {/* Progress Bar (Visible in Onboarding) */}
        <div className="w-full max-w-lg px-8 flex gap-1.5 mt-3 pointer-events-none">
          {screens.map((_, i) => (
             <div key={i} className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-700 ease-in-out ${i <= step ? 'bg-white/60 w-full' : 'bg-transparent w-0'}`} />
             </div>
          ))}
        </div>
      </div>

      {/* Middle Section: Question Content - Optical Centering applied via mt-[-4vh] */}
      <div className={`flex-1 flex flex-col items-center justify-center min-h-0 px-8 z-10 ${currentScreen.type === 'question' ? 'mt-[2vh]' : 'mt-[-4vh]'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -30, filter: 'blur(15px)' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} 
            className="w-full flex flex-col items-center justify-center max-w-xl"
          >
            <div className={`flex flex-col items-center justify-center gap-3 px-4 ${currentScreen.type === 'preferences' ? 'mb-10' : 'mb-6'}`}>
              <div className="flex items-center justify-center gap-5">
                <h1 className={`font-sans font-light tracking-tighter text-white leading-[1.1] text-center text-balance ${
                  currentScreen.type === 'question' 
                    ? 'text-3xl md:text-4xl lg:text-5xl' 
                    : 'text-4xl md:text-5xl lg:text-7xl'
                }`}>
                  {getScreenTitle()}
                </h1>
                {currentScreen.type === 'question' && (
                  <button
                    onClick={() => setShowInfo(true)}
                    className="text-zinc-500 hover:text-white transition-all active:scale-90 p-1 shrink-0"
                    aria-label="Info"
                  >
                    <Info size={28} strokeWidth={2} />
                  </button>
                )}
              </div>
              {currentScreen.type === 'preferences' && (
                <p className="text-zinc-500 text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-semibold text-center">
                  {t.preferencesSubtitle}
                </p>
              )}
            </div>

            <div className="w-full">
              {renderScreenContent()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section: Navigation */}
      <div className="shrink-0 w-full flex flex-col items-center px-8 pb-10 md:pb-16 pt-4 z-50">
        <div className="flex justify-center items-center gap-3 w-full max-w-sm">
          <button
            onClick={handleBack}
            className="flex items-center justify-center p-5 md:p-6 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white/30 hover:text-white transition-all active:scale-[0.9] shrink-0 backdrop-blur-xl"
            aria-label={t.back || 'Back'}
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`relative flex items-center justify-center font-semibold py-5 md:py-6 px-10 rounded-full overflow-hidden transition-[transform,opacity] text-[10px] md:text-xs tracking-[0.6em] uppercase group flex-1 ${
              isNextDisabled 
                ? 'bg-white/5 text-white/10' 
                : 'bg-white text-black hover:scale-[1.03] active:scale-[0.98] shadow-[0_20px_40px_rgba(0,0,0,0.2)]'
            }`}
          >
            <span className="relative z-10">
              {step === screens.length - 1 ? t.done : t.next}
            </span>
            {!isNextDisabled && (
              <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            )}
          </button>
        </div>
        
        {/* Invisible placeholder matching the "Numerosi paljastavat..." text to prevent vertical shifting between screens */}
        <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] mt-5 md:mt-7 text-center opacity-0 pointer-events-none select-none" aria-hidden="true">
           Placeholder
        </p>
      </div>

      <InfoModal
        type={showInfo && currentScreen.type === 'question' ? `q${currentScreen.data.id.charAt(0).toUpperCase() + currentScreen.data.id.slice(1)}` as InfoType : null}
        onClose={() => setShowInfo(false)}
        isFree={true}
      />
    </div>
  );
}
