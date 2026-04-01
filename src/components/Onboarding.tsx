import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import WheelPicker from './WheelPicker';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingStatusScreen from './OnboardingStatusScreen';
import { Language, Currency, TimeFormat, TRANSLATIONS, getCurrencySymbol } from '../utils/i18n';

export interface UserSettings {
  dailyCost: number;
  annualPriceIncrease: number;
  expectedReturn: number;
  language: Language;
  currency: Currency;
  timeFormat: TimeFormat;
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

  const [configLang, setConfigLang] = useState<Language | null>(initialSettings?.language || null);
  const [configCurrency, setConfigCurrency] = useState<Currency>(initialSettings?.currency || 'EUR');
  const [configTime, setConfigTime] = useState<TimeFormat>(initialSettings?.timeFormat || '24h');

  const [statusType, setStatusType] = useState<'now' | 'past' | 'hooked' | null>(null);
  const [pastDate, setPastDate] = useState(getLocalDatetimeString());
  const [bgNumbers, setBgNumbers] = useState<string[]>([]);

  useEffect(() => {
    setBgNumbers(Array.from({ length: 150 }).map(() => Math.random().toString().slice(2)));
  }, []);

  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    if (initialSettings) {
      return {
        dailyCost: initialSettings.dailyCost,
        annualPriceIncrease: initialSettings.annualPriceIncrease,
        expectedReturn: initialSettings.expectedReturn,
      };
    }
    return { dailyCost: 7.00, annualPriceIncrease: 5.0, expectedReturn: 7.0, notificationLevel: 3 };
  });

  const screens: { type: string; data: any }[] = [];
  if (!initialSettings) {
    screens.push({ type: 'language', data: null });
    if (configLang === 'en') {
      screens.push({ type: 'currency', data: null });
      screens.push({ type: 'timeFormat', data: null });
    }
  }

  const activeQuestions = [
    { id: 'dailyCost', labelKey: 'qDailyCost', suffix: getCurrencySymbol(configCurrency), min: 0, max: 100, decimals: 2 },
    { id: 'annualPriceIncrease', labelKey: 'qAnnualIncrease', suffix: '%', min: 0, max: 20, decimals: 1 },
    { id: 'expectedReturn', labelKey: 'qExpectedReturn', suffix: '%', min: 0, max: 20, decimals: 1 },
  ];
  activeQuestions.forEach(q => screens.push({ type: 'question', data: q }));

  if (!initialSettings) {
    // Moved to the end: "What is your situation right now?"
    screens.push({ type: 'status', data: null });
    
    // Inject past-date screen if "I have already quit" is selected
    if (statusType === 'past') {
      screens.push({ type: 'past-date', data: null });
    }
  }

  const currentScreen = screens[step];
  const t = TRANSLATIONS[configLang || 'en'];

  const handleNext = () => {
    if (currentScreen.type === 'language' && !configLang) return;
    if (currentScreen.type === 'status' && !statusType) return;

    if (step < screens.length - 1) {
      setStep(s => s + 1);
    } else {
      const status: InitialStatus | undefined = (!initialSettings && statusType)
        ? { type: statusType, startTime: statusType === 'past' ? new Date(pastDate).getTime() : Date.now() }
        : undefined;

      onSave({
        dailyCost: answers.dailyCost,
        annualPriceIncrease: answers.annualPriceIncrease,
        expectedReturn: answers.expectedReturn,
        language: configLang || 'en',
        currency: configCurrency,
        timeFormat: configTime,
        notificationLevel: (answers as any).notificationLevel !== undefined ? (answers as any).notificationLevel : 3
      }, status);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    handleLanguageChange(lang);
  };

  const handleLanguageChange = (lang: Language) => {
    setConfigLang(lang);
    if (lang === 'fi') {
      setConfigCurrency('EUR');
      setConfigTime('24h');
    } else {
      setConfigCurrency('USD');
      setConfigTime('12h');
    }
  };

  const getScreenTitle = (): string => {
    if (currentScreen.type === 'language') return TRANSLATIONS['en'].selectLanguage;
    if (currentScreen.type === 'currency') return t.selectCurrency;
    if (currentScreen.type === 'timeFormat') return t.selectTimeFormat;
    if (currentScreen.type === 'status') return t.statusTitle;
    if (currentScreen.type === 'past-date') return t.statusPastTitle;
    if (currentScreen.type === 'question') return (t as any)[currentScreen.data!.labelKey];
    return '';
  };

  const isNextDisabled =
    (currentScreen.type === 'language' && !configLang) ||
    (currentScreen.type === 'status' && !statusType);

  // BORDERLESS STYLING
  const containerClass = 'flex flex-col gap-4 items-center justify-center w-full relative transition-all duration-500';
  
  const optionClass = (selected: boolean, dimmed: boolean) =>
    `w-full max-w-sm p-4 md:p-6 rounded-3xl transition-all duration-300 relative flex flex-col items-center justify-center space-y-4
     ${selected 
       ? 'bg-white text-black scale-[1.02] z-10' 
       : 'bg-transparent border border-white/10 text-white/50 hover:bg-white/[0.02] hover:text-white/80 z-0'}
     ${dimmed && !selected ? 'filter blur-[1px]' : ''}`;

  const renderScreenContent = () => {
    if (currentScreen.type === 'language') {
      return (
        <div className={containerClass}>
          {(['en', 'fi'] as Language[]).map(lang => (
            <button key={lang} onClick={() => handleLanguageSelect(lang)}
              className={optionClass(configLang === lang, !!configLang)}>
              <span className="text-4xl lg:text-5xl relative z-10 mb-2">{lang === 'en' ? '🇺🇸' : '🇫🇮'}</span>
              <span className={`font-sans text-lg lg:text-xl font-medium tracking-tight relative z-10 ${configLang === lang ? 'text-black' : 'text-white/90'}`}>{lang === 'en' ? 'English' : 'Suomi'}</span>
            </button>
          ))}
        </div>
      );
    }

    if (currentScreen.type === 'currency') {
      return (
        <div className={containerClass}>
          <div className="flex flex-col gap-4 w-full items-center">
            {(['USD', 'EUR', 'GBP'] as Currency[]).map(c => (
              <button key={c} onClick={() => setConfigCurrency(c)}
                className={optionClass(configCurrency === c, true)}>
                <span className={`text-3xl font-mono font-medium relative z-10 ${configCurrency === c ? 'text-black' : 'text-white/90'}`}>{getCurrencySymbol(c)}</span>
                <span className={`font-medium uppercase tracking-[0.2em] text-[10px] relative z-10 ${configCurrency === c ? 'text-black/60' : 'text-zinc-500'}`}>{c}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentScreen.type === 'timeFormat') {
      return (
        <div className={containerClass}>
          {(['24h', '12h'] as TimeFormat[]).map(fmt => (
            <button key={fmt} onClick={() => setConfigTime(fmt)}
              className={optionClass(configTime === fmt, true)}>
              <span className={`text-3xl font-mono font-medium tracking-tighter relative z-10 ${configTime === fmt ? 'text-black' : 'text-white/90'}`}>{fmt === '24h' ? '14:30' : '2:30 PM'}</span>
              <span className={`font-medium uppercase tracking-[0.2em] text-[10px] relative z-10 ${configTime === fmt ? 'text-black/60' : 'text-zinc-500'}`}>{fmt === '24h' ? '24-hour' : '12-hour'}</span>
            </button>
          ))}
        </div>
      );
    }

    if (currentScreen.type === 'status') {
      return (
        <OnboardingStatusScreen
          statusType={statusType}
          onStatusChange={setStatusType}
          t={t}
          borderless={true}
        />
      );
    }

    if (currentScreen.type === 'past-date') {
      return (
        <div className="flex flex-col items-center justify-center w-full relative px-4">
          <div className="w-full max-w-sm space-y-4">
            <label className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] block text-center mb-6">
              {t.statusPastDesc}
            </label>
            <input
              type="datetime-local"
              value={pastDate}
              onChange={(e) => setPastDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white/90 font-mono text-2xl focus:outline-none focus:border-white/30 backdrop-blur-md transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] appearance-none [-webkit-appearance:none] text-center"
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
            locale={configLang === 'fi' ? 'fi-FI' : 'en-US'}
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

  return (
    <div className="h-[100dvh] bg-[#050505] text-white flex flex-col font-sans overflow-hidden touch-action-none relative">
      
      {/* Top Segmented Progress Bar */}
      <div className="absolute top-8 md:top-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 flex gap-1 z-50 pointer-events-none">
        {screens.map((_, i) => (
           <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
             <div className={`h-full transition-all duration-500 ease-out ${i <= step ? 'bg-white w-full' : 'bg-transparent w-0'}`} />
           </div>
        ))}
      </div>

      {/* Branding Header */}
      <div className="absolute top-16 md:top-20 w-full flex justify-center pointer-events-none z-40">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.8em]">Addiction Ticker</span>
      </div>

      {/* Floating Background Texture (Matrix-like) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015] flex flex-wrap content-start font-mono text-[10px] break-all leading-none">
        {bgNumbers.map((num, i) => (
          <span key={i} className="p-0.5">{num}</span>
        ))}
      </div>

      <div className="w-full max-w-4xl lg:max-w-7xl mx-auto flex-1 flex flex-col relative z-10 px-6">
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, filter: 'blur(15px)' }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} 
              className="absolute inset-0 flex flex-col items-center justify-start pt-[15dvh]"
            >
              <div className="w-full flex flex-col items-center justify-center gap-2 md:gap-4 max-w-lg">
                <h1 className={`font-sans font-black tracking-tight text-white leading-[1.1] text-center text-balance px-4 ${
                  currentScreen.type === 'question' 
                    ? 'text-[22px] md:text-3xl lg:text-4xl' 
                    : 'text-3xl md:text-4xl lg:text-5xl'
                }`}>
                  {getScreenTitle()}
                </h1>

                <div className="w-full flex justify-center">
                  {renderScreenContent()}
                </div>

                {/* Centralized Navigation Button */}
                <div className="w-full flex justify-center items-center gap-2 md:gap-4 mt-4 md:mt-8 px-4">
                  {step > 0 && (
                    <button
                      onClick={() => setStep(s => s - 1)}
                      className="flex items-center justify-center p-4 md:p-6 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all active:scale-[0.95] border border-white/5 shrink-0"
                      aria-label={t.back || 'Back'}
                    >
                      <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className={`relative flex items-center justify-center font-black py-4 md:py-6 px-10 rounded-full overflow-hidden transition-[transform,opacity] text-[9px] md:text-xs tracking-[0.3em] uppercase group flex-1 ${
                      step > 0 ? 'max-w-[220px]' : 'max-w-[280px]'
                    } ${
                      isNextDisabled 
                        ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                        : 'bg-white text-black hover:scale-[1.05] active:scale-[0.95] shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                    }`}
                  >
                    <span className="relative z-10">
                      {step === screens.length - 1 ? t.done : (currentScreen.type === 'language' ? TRANSLATIONS['en'].next : t.next)}
                    </span>
                    {!isNextDisabled && (
                      <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
