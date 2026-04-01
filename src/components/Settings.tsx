import { useState, useEffect } from 'react';
import { ArrowLeft, Save, ChevronRight } from 'lucide-react';
import { UserSettings } from './Onboarding';
import { AppState } from './Ticker';
import WheelPicker from './WheelPicker';
import ConfirmActionModal from './ConfirmActionModal';
import { TRANSLATIONS, getCurrencySymbol, Language, Currency, TimeFormat } from '../utils/i18n';

interface Props {
  initialSettings: UserSettings;
  appState: AppState;
  onSave: (settings: UserSettings) => void;
  onUpdateState: (state: AppState) => void;
  onCancel: () => void;
  onResetAll: () => void;
}

interface SettingConfig {
  id: string;
  label: string;
  desc: string;
  min: number;
  max: number;
  decimals: 1 | 2;
  unit: string;
}

export default function Settings({ initialSettings, appState, onSave, onUpdateState, onCancel, onResetAll }: Props) {
  const [dailyCost, setDailyCost] = useState(initialSettings.dailyCost);
  const [annualPriceIncrease, setAnnualPriceIncrease] = useState(initialSettings.annualPriceIncrease);
  const [expectedReturn, setExpectedReturn] = useState(
    initialSettings.expectedReturn !== undefined ? initialSettings.expectedReturn : 7.0
  );
  const [language, setLanguage] = useState<Language>(initialSettings.language || 'en');
  const [currency, setCurrency] = useState<Currency>(initialSettings.currency || 'EUR');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(initialSettings.timeFormat || '24h');
  const [notificationLevel, setNotificationLevel] = useState<number>(initialSettings.notificationLevel !== undefined ? initialSettings.notificationLevel : 3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'quit' | 'relapse' | 'reset' | null>(null);

  const [startTimeString, setStartTimeString] = useState(() => {
    const d = new Date(appState.startTime);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const t = TRANSLATIONS[language];
  const currencySymbol = getCurrencySymbol(currency);

  const SLIDER_CONFIGS: Record<string, SettingConfig> = {
    dailyCost: { id: 'dailyCost', label: t.dailyCostLabel, desc: t.qDailyCost, min: 0, max: 100, decimals: 2, unit: currencySymbol },
    annualPriceIncrease: { id: 'annualPriceIncrease', label: t.annualIncreaseLabel, desc: t.annualIncreaseDesc, min: 0, max: 20, decimals: 1, unit: '%' },
    expectedReturn: { id: 'expectedReturn', label: t.expectedReturnLabel, desc: t.expectedReturnDesc, min: 0, max: 20, decimals: 1, unit: '%' },
    notificationLevel: { id: 'notificationLevel', label: t.motivatorLevel || 'Intensity', desc: t.motivatorDesc || '', min: 0, max: 3, decimals: 1, unit: '' },
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (lang === 'fi') {
      setCurrency('EUR');
      setTimeFormat('24h');
    }
  };

  const handleSave = () => {
    onSave({ ...initialSettings, dailyCost, annualPriceIncrease, expectedReturn, language, currency, timeFormat, notificationLevel });

    if (appState.status !== 'riippuvainen') {
      const newTime = new Date(startTimeString).getTime();
      if (!isNaN(newTime) && newTime !== appState.startTime) {
        onUpdateState({ ...appState, startTime: newTime });
      }
    }
  };

  useEffect(() => {
    if (editingId === null) {
      handleSave();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, dailyCost, annualPriceIncrease, expectedReturn, language, currency, timeFormat, notificationLevel, startTimeString]);

  const handleConfirmAction = () => {
    if (modalType === 'quit') {
      onUpdateState({ status: 'vapaa', startTime: Date.now(), lastTransferTime: Date.now(), lastDismissedAmount: 0 });
    } else if (modalType === 'relapse') {
      onUpdateState({ status: 'riippuvainen', startTime: Date.now(), lastTransferTime: Date.now(), lastDismissedAmount: 0 });
    } else if (modalType === 'reset') {
      onResetAll();
    }
    setModalType(null);
  };

  const isHooked = appState.status === 'riippuvainen';
  const colorClass = isHooked ? 'text-red-400' : 'text-emerald-400';
  const borderFocusClass = isHooked ? 'focus:border-red-500/10' : 'focus:border-emerald-500/10';
  const dropShadowClass = isHooked ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  const hoverColorClass = isHooked ? 'group-hover:text-red-300' : 'group-hover:text-emerald-300';

  // ── Unified Picker Drill-down ──────────────────────────────────────────────
  if (editingId) {
    const config = SLIDER_CONFIGS[editingId];
    
    // ── Handle Selection Pickers (Language, Currency, Time Format) ────────────
    if (['language', 'currency', 'timeFormat'].includes(editingId)) {
      const options = editingId === 'language' 
        ? [{ id: 'en', label: 'English', sub: 'USA' }, { id: 'fi', label: 'Suomi', sub: 'FIN' }]
        : editingId === 'currency'
        ? [{ id: 'USD', label: 'US Dollar', sub: '$' }, { id: 'EUR', label: 'Euro', sub: '€' }, { id: 'GBP', label: 'Pound Sterling', sub: '£' }]
        : [{ id: '12h', label: '12-hour', sub: 'AM/PM' }, { id: '24h', label: '24-hour', sub: '00-24' }];

      const currentValue = 
        editingId === 'language' ? language :
        editingId === 'currency' ? currency :
        timeFormat;

      const onSelect = (id: any) => {
        if (editingId === 'language') handleLanguageChange(id);
        if (editingId === 'currency') setCurrency(id);
        if (editingId === 'timeFormat') setTimeFormat(id);
        setEditingId(null);
      };

      return (
        <div className="h-[100dvh] bg-[#050505] text-white flex flex-col max-w-4xl mx-auto relative overflow-hidden pt-20">
          <header className="flex items-center justify-between px-8 py-4 sticky top-0 z-20">
            <button onClick={() => setEditingId(null)} className="p-3 -ml-4 text-zinc-600 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <ArrowLeft size={28} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] opacity-50">Select</span>
            </div>
            <div className="w-10" />
          </header>

          <div className="flex-1 flex flex-col px-8 gap-4 justify-center">
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`w-full flex items-center justify-between p-6 rounded-[20px] transition-all duration-300 border ${
                  currentValue === opt.id 
                    ? 'bg-white/[0.04] border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                    : 'bg-transparent border-white/[0.03] hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex flex-col items-start translate-y-[-2px]">
                  <span className={`text-xl tracking-tight transition-colors ${currentValue === opt.id ? 'font-medium text-white/95 text-glow-white' : 'font-normal text-zinc-500'}`}>{opt.label}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-[0.2em] mt-1 transition-opacity ${currentValue === opt.id ? 'opacity-60 text-white' : 'opacity-40 text-zinc-500'}`}>{opt.sub}</span>
                </div>
                {currentValue === opt.id && <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ── Handle Wheel Picker (Costs/Investing) ────────────────────────────────
    if (config) {
      const currentValue =
        editingId === 'dailyCost' ? dailyCost :
        editingId === 'annualPriceIncrease' ? annualPriceIncrease :
        editingId === 'expectedReturn' ? expectedReturn :
        notificationLevel;

      const setValue = (val: number) => {
        if (editingId === 'dailyCost') setDailyCost(val);
        if (editingId === 'annualPriceIncrease') setAnnualPriceIncrease(val);
        if (editingId === 'expectedReturn') setExpectedReturn(val);
        if (editingId === 'notificationLevel') setNotificationLevel(val);
      };

      return (
        <div className="h-[100dvh] bg-[#050505] text-white flex flex-col max-w-4xl mx-auto relative overflow-hidden touch-action-none pt-20">
          <header className="flex items-center justify-between px-8 py-4 sticky top-0 z-20">
            <button onClick={() => setEditingId(null)} className="p-3 -ml-4 text-zinc-600 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <ArrowLeft size={28} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] opacity-50">Addiction Ticker</span>
            </div>
            <div className="w-10" />
          </header>

          <div className="text-center px-8 pt-10 pb-4">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight leading-[1.1]">{config.label}</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed font-medium">{config.desc}</p>
          </div>

          <div className="flex-1 flex items-center justify-center pb-28">
            <WheelPicker
              value={currentValue}
              min={config.min}
              max={config.max}
              decimals={config.decimals}
              suffix={config.unit}
              locale={language === 'fi' ? 'fi-FI' : 'en-US'}
              onChange={setValue}
            />
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-8 z-30 max-w-4xl mx-auto">
            <button
              onClick={() => setEditingId(null)}
              className="w-full py-6 rounded-full font-black text-black bg-white hover:bg-zinc-200 transition-all duration-300 uppercase tracking-[0.4em] text-[11px] shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
            >
              {t.done}
            </button>
          </div>
        </div>
      );
    }
  }

  // ── Helper components ────────────────────────────────────────────────────
  const SettingRow = ({ label, displayValue, id, colorClassStr, glowClassStr }: { label: string; desc?: string; displayValue: string; id: string; colorClassStr?: string; glowClassStr?: string }) => (
    <button
      onClick={() => setEditingId(id)}
      className="w-full flex items-center justify-between py-4 lg:py-5 border-b border-white/[0.03] transition-all hover:bg-white/[0.01] group last:border-b-0"
    >
      <div className="flex items-center text-left flex-1 pr-4">
        <span className="text-white/80 font-normal text-base lg:text-lg group-hover:text-white transition-colors tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 justify-end">
        <span className="font-mono tabular-nums text-white/70 font-normal text-base lg:text-lg tracking-tighter text-right">
          {displayValue}
        </span>
        <ChevronRight size={18} className={`text-zinc-800 ${hoverColorClass} transition-colors mr-[-4px]`} />
      </div>
    </button>
  );

  // ── Main settings list ───────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] bg-[#050505] text-white flex flex-col max-w-4xl mx-auto relative overflow-hidden pt-8">
      <header className="flex items-center justify-between px-8 py-6 md:py-8 z-20">
        <button onClick={onCancel} className="p-3 -ml-4 text-zinc-600 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <ArrowLeft size={28} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em]">Addiction Ticker</span>
          <h1 className="text-lg md:text-2xl font-light text-white/80 mt-1 tracking-[0.15em] uppercase">{t.settingsTitle}</h1>
        </div>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-12 no-scrollbar">
        <div className="flex flex-col">

          {/* ── 1. KEY FINANCIAL VARIABLES (most important — first) ── */}
          <div className="flex flex-col">
            <SettingRow 
              id="dailyCost"
              label={SLIDER_CONFIGS.dailyCost.label}
              desc={SLIDER_CONFIGS.dailyCost.desc}
              displayValue={`${new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { minimumFractionDigits: 2 }).format(dailyCost)} ${currencySymbol}`}
            />
            <SettingRow 
              id="annualPriceIncrease"
              label={SLIDER_CONFIGS.annualPriceIncrease.label}
              desc={SLIDER_CONFIGS.annualPriceIncrease.desc}
              displayValue={`${annualPriceIncrease.toFixed(1)}%`}
            />
            <SettingRow 
              id="expectedReturn"
              label={SLIDER_CONFIGS.expectedReturn.label}
              desc={SLIDER_CONFIGS.expectedReturn.desc}
              displayValue={`${expectedReturn.toFixed(1)}%`}
            />
          </div>

          {/* ── Thin divider ── */}
          <div className="border-t border-white/[0.04] my-4" />

          {/* ── MOTIVATION & NOTIFICATIONS ── */}
          <div className="flex flex-col">
            <div className="flex flex-col py-2 px-4 -mx-4">
              <span className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">{t.motivatorTitle}</span>
            </div>
            <SettingRow 
              id="notificationLevel"
              label={SLIDER_CONFIGS.notificationLevel.label}
              desc={SLIDER_CONFIGS.notificationLevel.desc}
              displayValue={notificationLevel === 3 ? t.motivatorLevel3 : notificationLevel === 2 ? t.motivatorLevel2 : notificationLevel === 1 ? t.motivatorLevel1 : t.motivatorLevel0}
              colorClassStr="text-white"
              glowClassStr="text-glow-white"
            />
          </div>

          {/* ── Thin divider ── */}
          <div className="border-t border-white/[0.04] my-4" />

          {/* ── 2. PREFERENCES (language, currency, time format) ── */}
          <div className="flex flex-col">
            <SettingRow 
              id="language"
              label={t.languageLabel}
              desc={language === 'fi' ? 'Valitse kieli sovellukselle.' : 'Select the language for the ticker.'}
              displayValue={language === 'fi' ? 'FI' : 'EN'}
              colorClassStr="text-white"
              glowClassStr="text-glow-white"
            />
            <SettingRow 
              id="currency"
              label={t.currencyLabel}
              desc={language === 'fi' ? 'Käytettävä valuutta.' : 'Currency used for tracking.'}
              displayValue={getCurrencySymbol(currency)}
              colorClassStr="text-white"
              glowClassStr="text-glow-white"
            />
            <SettingRow 
              id="timeFormat"
              label={t.timeFormatLabel}
              desc={language === 'fi' ? 'Ajan esitystapa.' : 'Format for the timer display.'}
              displayValue={timeFormat.toUpperCase()}
              colorClassStr="text-white"
              glowClassStr="text-glow-white"
            />
          </div>

          {/* ── 3. START TIME (only if free) ── */}
          {!isHooked && (
            <>
              <div className="border-t border-white/[0.04] my-4" />
              <div className="flex flex-col px-4 -mx-4 py-4 lg:py-5 border-b border-white/[0.03] transition-all hover:bg-white/[0.01] rounded-[16px]">
                <label className="text-white/90 font-medium text-base lg:text-lg mb-2 tracking-tight">{t.currentPeriodStart}</label>
                <input
                  type="datetime-local"
                  value={startTimeString}
                  onChange={(e) => setStartTimeString(e.target.value)}
                  className="bg-transparent p-0 text-white/90 font-mono text-lg lg:text-xl font-medium focus:outline-none focus:ring-0 tracking-tighter w-full cursor-pointer appearance-none [-webkit-appearance:none]"
                />
                <p className="text-zinc-500 text-[10px] leading-relaxed mt-3 font-normal opacity-80">{t.editStartTimeHint}</p>
              </div>
            </>
          )}

          {/* ── 4. STATUS MANAGEMENT (destructive actions — last) ── */}
          <div className="border-t border-white/[0.04] my-4" />
          <div className="flex flex-col">
            <button
              onClick={() => setModalType(isHooked ? 'quit' : 'relapse')}
              className={`w-full flex items-center justify-between py-5 lg:py-6 transition-all hover:bg-white/[0.02] group border-b border-white/[0.06]`}
            >
              <div className="flex items-center text-left flex-1 pr-4">
                <span className={`font-normal text-base lg:text-lg transition-colors ${isHooked ? 'text-white/70 group-hover:text-emerald-400' : 'text-white/70 group-hover:text-red-400'}`}>
                  {isHooked ? t.quitAddiction : t.resetCounter}
                </span>
              </div>
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors mr-[-4px]" />
            </button>

            <button
              onClick={() => setModalType('reset')}
              className="w-full flex items-center justify-between py-5 lg:py-6 transition-all hover:bg-red-500/[0.03] group border-b border-white/[0.06]"
            >
              <div className="flex items-center text-left flex-1 pr-4">
                <span className="font-normal text-base lg:text-lg text-white/70 group-hover:text-red-400 transition-colors">
                  {t.resetAllData}
                </span>
              </div>
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-red-400 transition-colors mr-[-4px]" />
            </button>
          </div>

        </div>
      </div>

      {modalType && (
        <ConfirmActionModal
          type={modalType}
          onConfirm={handleConfirmAction}
          onCancel={() => setModalType(null)}
          settings={initialSettings}
        />
      )}

    </div>
  );
}
