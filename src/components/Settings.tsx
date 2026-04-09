import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Info } from 'lucide-react';
import { UserSettings } from './Onboarding';
import { AppState } from './Ticker';
import WheelPicker, { SingleTextWheelPicker } from './WheelPicker';
import InfoModal, { InfoType } from './InfoModal';
import { t, getCurrencySymbol } from '../utils/i18n';

interface Props {
  initialSettings: UserSettings;
  appState: AppState;
  onSave: (settings: UserSettings) => void;
  onUpdateState: (state: AppState) => void;
  onCancel: () => void;
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

export default function Settings({ initialSettings, appState, onSave, onUpdateState, onCancel }: Props) {
  const [dailyCost, setDailyCost] = useState(initialSettings.dailyCost);
  const [annualPriceIncrease, setAnnualPriceIncrease] = useState(initialSettings.annualPriceIncrease);
  const [expectedReturn, setExpectedReturn] = useState(
    initialSettings.expectedReturn !== undefined ? initialSettings.expectedReturn : 7.0
  );
  const [investReminderThreshold, setInvestReminderThreshold] = useState(
    initialSettings.investReminderThreshold !== undefined ? initialSettings.investReminderThreshold : 0.01
  );
  const [notificationLevel, setNotificationLevel] = useState<number>(initialSettings.notificationLevel !== undefined ? initialSettings.notificationLevel : 3);
  const [maxForecastYears, setMaxForecastYears] = useState<number>(initialSettings.maxForecastYears !== undefined ? initialSettings.maxForecastYears : 75);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const [startTimeString, setStartTimeString] = useState(() => {
    const d = new Date(appState.startTime);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const currencySymbol = getCurrencySymbol('EUR');

  const SLIDER_CONFIGS: Record<string, SettingConfig> = {
    dailyCost: { id: 'dailyCost', label: t.dailyCostLabel, desc: t.qDailyCost, min: 0, max: 100, decimals: 2, unit: currencySymbol },
    annualPriceIncrease: { id: 'annualPriceIncrease', label: t.annualIncreaseLabel, desc: t.annualIncreaseDesc, min: 0, max: 20, decimals: 1, unit: '%' },
    expectedReturn: { id: 'expectedReturn', label: t.expectedReturnLabel, desc: t.expectedReturnDesc, min: 0, max: 20, decimals: 1, unit: '%' },
    investReminderThreshold: { id: 'investReminderThreshold', label: t.investReminderTitle, desc: t.investReminderDesc, min: 0, max: 500, decimals: 2, unit: currencySymbol },
    maxForecastYears: { id: 'maxForecastYears', label: (t as any).maxForecastYearsLabel, desc: (t as any).maxForecastYearsDesc, min: 10, max: 100, decimals: 0, unit: 'v' },
    notificationLevel: { id: 'notificationLevel', label: t.motivatorLevel || 'Intensity', desc: t.motivatorDesc || '', min: 0, max: 3, decimals: 1, unit: '' },
  };

  const handleSave = () => {
    onSave({ ...initialSettings, dailyCost, annualPriceIncrease, expectedReturn, investReminderThreshold, notificationLevel, maxForecastYears });
    if (appState.status !== 'riippuvainen') {
      const newTime = new Date(startTimeString).getTime();
      if (!isNaN(newTime) && newTime !== appState.startTime) {
        onUpdateState({ ...appState, startTime: newTime });
      }
    }
  };

  useEffect(() => {
    if (editingId === null) handleSave();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, dailyCost, annualPriceIncrease, expectedReturn, investReminderThreshold, notificationLevel, maxForecastYears, startTimeString]);

  const isHooked = appState.status === 'riippuvainen';

  if (editingId) {
    const config = SLIDER_CONFIGS[editingId];
    if (config) {
      const currentValue =
        editingId === 'dailyCost' ? dailyCost :
        editingId === 'annualPriceIncrease' ? annualPriceIncrease :
        editingId === 'expectedReturn' ? expectedReturn :
        editingId === 'investReminderThreshold' ? investReminderThreshold :
        editingId === 'maxForecastYears' ? maxForecastYears :
        notificationLevel;

      const setValue = (val: number) => {
        if (editingId === 'dailyCost') setDailyCost(val);
        if (editingId === 'annualPriceIncrease') setAnnualPriceIncrease(val);
        if (editingId === 'expectedReturn') setExpectedReturn(val);
        if (editingId === 'investReminderThreshold') setInvestReminderThreshold(val);
        if (editingId === 'maxForecastYears') setMaxForecastYears(val);
        if (editingId === 'notificationLevel') setNotificationLevel(val);
      };

      return (
        <div className="h-full bg-[#050505] text-white flex flex-col max-w-4xl mx-auto relative overflow-hidden touch-action-none pt-6 lg:pt-12 font-sans">
          <header className="flex items-center justify-between px-8 py-4 shrink-0 z-20">
            <button onClick={() => setEditingId(null)} className="p-4 -ml-4 text-zinc-400 hover:text-white transition-all active:scale-95">
              <ArrowLeft size={32} strokeWidth={3} />
            </button>
            <span className="text-[11px] font-semibold text-white uppercase tracking-[0.6em]">Addiction Ticker</span>
            <div className="w-12" />
          </header>

          <div className="text-center px-8 py-4 shrink-0 flex items-center justify-center gap-4">
            <h2 className="text-4xl lg:text-5xl font-light text-white tracking-tighter leading-tight relative">
              {config.label}
              <button
                onClick={() => setShowInfo(true)}
                className="absolute -right-10 lg:-right-14 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-all active:scale-90 p-2"
                aria-label="Info"
              >
                <Info size={24} strokeWidth={2} />
              </button>
            </h2>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0 w-full z-10">
            {editingId === 'notificationLevel' ? (
              <SingleTextWheelPicker
                value={notificationLevel}
                options={[
                  { value: 0, label: t.motivatorLevel0 || 'Off' },
                  { value: 1, label: t.motivatorLevel1 || 'Milestones' },
                  { value: 2, label: t.motivatorLevel2 || 'Balanced' },
                  { value: 3, label: t.motivatorLevel3 || 'Intensive' }
                ]}
                onChange={setValue}
              />
            ) : (
              <WheelPicker
                value={currentValue}
                min={config.min}
                max={config.max}
                decimals={config.decimals}
                suffix={config.unit}
                locale="fi-FI"
                onChange={setValue}
              />
            )}
          </div>

          <div className="shrink-0 w-full px-8 pb-10 md:pb-16 pt-4 flex justify-center z-30">
            <button
              onClick={() => setEditingId(null)}
              className="w-full max-w-[320px] py-5 md:py-7 rounded-full font-semibold text-black bg-white hover:scale-[1.03] transition-all active:scale-95 uppercase tracking-[0.6em] text-[10px] md:text-xs shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
            >
              {t.done}
            </button>
          </div>
          <InfoModal
            type={showInfo ? `q${editingId.charAt(0).toUpperCase() + editingId.slice(1)}` as InfoType : null}
            onClose={() => setShowInfo(false)}
            isFree={!isHooked}
            t={t}
          />
        </div>
      );
    }
  }

  const SettingRow = ({ label, displayValue, id }: { label: string; displayValue: string; id: string }) => (
    <button
      onClick={() => setEditingId(id)}
      className="w-full flex items-center justify-between py-4 lg:py-5 transition-all hover:bg-white/[0.02] group"
    >
      <div className="flex items-center text-left flex-1">
        <span className="text-zinc-200 group-hover:text-emerald-400 font-medium text-base lg:text-xl transition-all tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-4 shrink-0 justify-end">
        <span className="font-sans tabular-nums text-white group-hover:text-emerald-400 font-light text-base lg:text-xl tracking-tighter text-right transition-all">
          {displayValue}
        </span>
        <ChevronRight size={16} className="text-zinc-700 group-hover:text-emerald-500 transition-colors mr-[-4px]" />
      </div>
    </button>
  );

  return (
    <div className="h-full bg-[#050505] text-white flex flex-col max-w-4xl mx-auto relative overflow-hidden pt-10 font-sans">
      <header className="flex items-center justify-between px-8 py-6 z-20">
        <button onClick={onCancel} className="p-4 -ml-4 text-zinc-400 hover:text-white transition-all active:scale-95">
          <ArrowLeft size={32} strokeWidth={3} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-semibold text-white uppercase tracking-[0.6em]">Addiction Ticker</span>
          <h1 className="text-xs font-medium text-white mt-4 tracking-[0.4em] uppercase">{t.settingsTitle}</h1>
        </div>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto px-8 md:px-14 pb-10 no-scrollbar">
        <div className="flex flex-col pt-4">

          {/* SECTION 1: BASIC SETTINGS */}
          <div className="flex flex-col">
            <span className="text-zinc-600 font-medium uppercase tracking-[0.4em] text-[10px] mb-2">{t.basicSettings}</span>
            <SettingRow id="dailyCost" label={t.dailyCostLabel} displayValue={`${new Intl.NumberFormat('fi-FI', { minimumFractionDigits: 2 }).format(dailyCost)} ${currencySymbol}`} />
            <SettingRow id="annualPriceIncrease" label={t.annualIncreaseLabel} displayValue={`${annualPriceIncrease.toFixed(1)}%`} />
            <SettingRow id="expectedReturn" label={t.expectedReturnLabel} displayValue={`${expectedReturn.toFixed(1)}%`} />
            
            {!isHooked && (
              <div className="w-full flex items-center justify-between py-4 lg:py-5 border-t border-white/5">
                 <span className="text-zinc-200 font-medium text-base lg:text-xl tracking-tight">{t.startTime}</span>
                 <input
                   type="datetime-local"
                   value={startTimeString}
                   onChange={(e) => setStartTimeString(e.target.value)}
                   className="bg-transparent p-0 text-white font-sans tabular-nums text-base lg:text-xl font-light focus:outline-none tracking-tighter cursor-pointer appearance-none text-right"
                 />
              </div>
            )}
          </div>

          <div className="h-px w-full bg-white/5 my-8" />

          {/* SECTION 2: OTHER SETTINGS */}
          <div className="flex flex-col">
            <span className="text-zinc-600 font-medium uppercase tracking-[0.4em] text-[10px] mb-2">{t.otherSettings}</span>
            <SettingRow id="investReminderThreshold" label={t.investReminderTitle} displayValue={`${new Intl.NumberFormat('fi-FI', { minimumFractionDigits: 2 }).format(investReminderThreshold)} ${currencySymbol}`} />
            <SettingRow id="maxForecastYears" label={(t as any).maxForecastYearsLabel} displayValue={`${maxForecastYears} v`} />
            <SettingRow 
              id="notificationLevel" 
              label={SLIDER_CONFIGS.notificationLevel.label} 
              displayValue={notificationLevel === 3 ? t.motivatorLevel3 : notificationLevel === 2 ? t.motivatorLevel2 : notificationLevel === 1 ? t.motivatorLevel1 : t.motivatorLevel0} 
            />
          </div>

          </div>
        </div>
      </div>
    );
}
