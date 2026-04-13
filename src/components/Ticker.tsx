import { useState, useEffect, useLayoutEffect, useMemo, memo } from 'react';
import { Menu, Share2, Apple } from 'lucide-react';
import { calculateAccumulated, calculateSecuredFutureValue, calculateTotalForecast } from '../utils/finance';
import { useI18n } from '../context/I18nContext';
import { UserSettings } from './Onboarding';
import TimerDisplay from './TimerDisplay';
import FinancialChart, { GraphDataPoint } from './FinancialChart';
import ForecastSlider from './ForecastSlider';
import SideDrawer from './SideDrawer';
import InfoModal, { InfoType } from './InfoModal';
import ConfirmActionModal from './ConfirmActionModal';
import InvestConfirmBanner from './InvestConfirmBanner';
import { playCentDrop, startTickLoop, stopTickLoop, initAudio } from '../utils/audio';
import { useRef } from 'react';

export interface AppState {
  status: 'vapaa' | 'riippuvainen';
  startTime: number;
  lastTransferTime?: number;
  lastDismissedAmount?: number;
}

interface Props {
  settings: UserSettings;
  appState: AppState;
  onUpdateState: (state: AppState) => void;
  onEditSettings: () => void;
  onResetAll?: () => void;
}

export default function Ticker({ settings, appState, onUpdateState, onEditSettings, onResetAll }: Props) {
  const { t, formatCurrencyString: fmtCurStr } = useI18n();
  // Detect if running in a browser (vs. native Capacitor app)
  const isWebBrowser = !('Capacitor' in window);
  const APP_STORE_URL = 'https://apps.apple.com/us/app/addiction-ticker/id6761534960';
  const [now, setNow] = useState(Date.now());
  const [stableNow, setStableNow] = useState(Date.now());
  const [forecastYears, setForecastYears] = useState(10);
  const [viewType, setViewType] = useState<'secured' | 'potential'>('secured');
  const [modalType, setModalType] = useState<'quit' | 'relapse' | 'reset' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<InfoType | null>(null);
  const [isInvestBannerOpen, setIsInvestBannerOpen] = useState(false);
  const lastCentRef = useRef<number>(-1);
  const lastSecondRef = useRef<number>(-1);

  useEffect(() => {
    const tick = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      setStableNow(prev => {
        if (currentTime - prev > 60000) return currentTime;
        return prev;
      });
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  const isFree = appState.status === 'vapaa';
  // OLED Glow: High-saturation neon variants
  const colorClass = isFree ? 'text-emerald-400' : 'text-rose-500';
  const gradientColor = isFree ? '#10b981' : '#f43f5e';
  const maxYears = settings.maxForecastYears ?? 75;

  useEffect(() => {
    if (forecastYears > maxYears) {
      setForecastYears(maxYears);
    }
  }, [maxYears]);

  const elapsedMs = now - appState.startTime;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const stableElapsedMs = Math.max(0, stableNow - appState.startTime);
  const stableElapsedDays = stableElapsedMs / (1000 * 60 * 60 * 24);

  const currentYear = new Date().getFullYear();
  const stableTargetDate = new Date(currentYear + forecastYears, 0, 1).getTime();

  const elapsedDays = Math.max(0, elapsedMs) / (1000 * 60 * 60 * 24);
  const yearsToTargetExactLive = Math.max(0, (stableTargetDate - now) / (1000 * 60 * 60 * 24 * 365.25));
  const totalYearsLive = elapsedDays / 365.25 + yearsToTargetExactLive;

  const accumulated = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, elapsedDays);
  const currentPortfolioValueLive = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, elapsedDays / 365.25, settings.expectedReturn);
  const securedFV = calculateSecuredFutureValue(currentPortfolioValueLive, yearsToTargetExactLive, settings.expectedReturn);
  const totalForecast = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, totalYearsLive, settings.expectedReturn);
  const totalDirectSavings = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, totalYearsLive * 365.25);

  // Start/stop the cinematic clock loop based on soundscapeEnabled setting
  useEffect(() => {
    if (settings.soundscapeEnabled) {
      initAudio();
      // Small delay to give initAudio time to resume the AudioContext
      const t = setTimeout(() => startTickLoop(), 300);
      return () => { clearTimeout(t); stopTickLoop(); };
    } else {
      stopTickLoop();
    }
  }, [settings.soundscapeEnabled]);

  // Audio: useLayoutEffect fires AFTER React updates the DOM but BEFORE the browser paints.
  // This means the coin drop triggers at the exact same visual frame as the number change.
  useLayoutEffect(() => {
    if (!settings.soundscapeEnabled) return;

    // Use Math.round(*100) to match exactly how Intl.NumberFormat rounds to 2 decimal places
    const currentCents = Math.round(accumulated * 100);

    if (lastCentRef.current !== -1 && currentCents > lastCentRef.current) {
      playCentDrop(isFree);
    }

    lastSecondRef.current = totalSeconds;
    lastCentRef.current = currentCents;
  }, [totalSeconds, accumulated, isFree, settings.soundscapeEnabled]);

  useEffect(() => {
    setStableNow(Date.now());
  }, [appState.startTime]);

  const lastTransferTime = appState.lastTransferTime || appState.startTime;
  const pendingDays = (now - lastTransferTime) / (1000 * 60 * 60 * 24);
  const pendingAmount = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, pendingDays);
  const isPendingOverdue = pendingDays >= 7;

  // Graph data — build yearly data points from now to forecast target year
  const graphData: GraphDataPoint[] = useMemo(() => {
    const points: GraphDataPoint[] = [];
    const totalSteps = Math.max(forecastYears * 2, 30);
    const totalYears = forecastYears;

    for (let i = 0; i <= totalSteps; i++) {
      const yearFraction = (i / totalSteps) * totalYears;
      const yearLabel = currentYear + Math.round(yearFraction);
      const directCost = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, yearFraction * 365.25);
      const investedValue = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, yearFraction, settings.expectedReturn);
      points.push({ year: yearLabel, directCost, investedValue });
    }
    return points;
  }, [forecastYears, settings.dailyCost, settings.annualPriceIncrease, settings.expectedReturn, currentYear]);

  const handleMarkAsInvested = () => {
    onUpdateState({ ...appState, lastTransferTime: Date.now(), lastDismissedAmount: 0 });
  };

  const handleDismissReminder = () => {
    onUpdateState({ ...appState, lastDismissedAmount: pendingAmount });
  };

  const isReminderVisible = pendingAmount > (appState.lastDismissedAmount || 0) + 0.001;

  const handleConfirmAction = () => {
    if (modalType === 'quit') {
      onUpdateState({ status: 'vapaa', startTime: Date.now(), lastTransferTime: Date.now() });
    } else if (modalType === 'relapse') {
      onUpdateState({ status: 'riippuvainen', startTime: Date.now() });
    } else if (modalType === 'reset') {
      onResetAll?.();
    }
    setModalType(null);
  };

  const formatCurrencyTicker = (val: number, fractionDigits: number = 2) => fmtCurStr(val, fractionDigits);

  const handleShare = async () => {
    const url = 'https://addictionticker.netlify.app/';
    const formattedTotal = formatCurrencyTicker(totalForecast);
    const formattedCurrent = formatCurrencyTicker(accumulated);

    let text = '';
    if (isFree) {
      text = t.shareTextFree
        .replace('{B}', formattedCurrent)
        .replace('{D}', formatCurrencyTicker(securedFV))
        .replace(/{E}/g, forecastYears.toString());
    } else {
      const forecastDirectCosts = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, forecastYears * 365.25);
      text = t.shareTextHooked
        .replace('{A}', forecastYears.toString())
        .replace('{G}', formatCurrencyTicker(forecastDirectCosts));
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: t.tickerHeader, text, url });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert(t.linkCopied);
    }
  };

  return (
    <div className="h-full bg-[#050505] font-sans flex flex-col text-white overflow-y-auto overflow-x-hidden relative">
      {/* FIXED TOP BAR: PERFECTLY ALIGNED GRID */}
      <div className="w-full px-6 pt-[clamp(8px,1dvh,16px)] pb-2 relative z-50 flex flex-col items-center">
        <div className="w-full relative flex items-center justify-center h-12">
          {/* Title centered */}
          <div className="text-[12px] md:text-[13px] font-semibold text-white/90 uppercase tracking-[0.6em] pointer-events-none">
            {t.tickerHeader}
          </div>
          
          {/* Menu Button right-aligned but sharing horizontal center axis */}
          <div className="absolute right-0 flex items-center h-full">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-zinc-400 hover:text-white transition-all p-2.5 md:p-3 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl rounded-full border border-white/10 shadow-2xl"
              aria-label="Valikko"
            >
              <Menu className="w-5 h-5 mx-0.5" />
            </button>
          </div>
        </div>

        {/* Invisible progress bar placeholder to match Onboarding height exactly */}
        <div className="w-full max-w-lg px-8 flex gap-1.5 opacity-0 mt-3 pb-0.5 pointer-events-none">
          <div className="h-0.5 flex-1 bg-white/5 rounded-full" />
        </div>
      </div>

      <div className="flex-1 w-full mx-auto relative z-10 flex flex-col h-full overflow-hidden">
        
        {/* Elastic Spacer 1: Top margin */}
        <div className="flex-[0.5] min-h-[clamp(8px,1dvh,24px)] shrink-0" />

        {/* Content Section 1: Timer */}
        <div className="flex-none flex flex-col items-center w-full px-4 relative shrink-0">
          <TimerDisplay
            isFree={isFree}
            days={days}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            colorClass={colorClass}
            startTime={appState.startTime}
            onShowInfo={setInfoModal}
          />
        </div>

        {/* Elastic Spacer 2: Space between Timer and Chart */}
        <div className="flex-[1] min-h-[clamp(16px,2dvh,32px)] shrink-0" />

        {/* Content Section 2: Chart with toggle + metrics. flex-auto respects content height */}
        <div className="flex-auto flex flex-col w-full overflow-visible min-h-min relative z-0 shrink-0">
          <FinancialChart
            graphData={graphData}
            viewType={viewType}
            onViewTypeChange={setViewType}
            isFree={isFree}
            gradientColor={gradientColor}
            colorClass={colorClass}
            accumulated={accumulated}
            securedFV={securedFV}
            totalForecast={totalForecast}
            totalDirectSavings={totalDirectSavings}
            forecastYears={forecastYears}
            currentYear={currentYear}
            onShowInfo={setInfoModal}
            pendingAmount={(pendingAmount >= (settings.investReminderThreshold ?? 0.01) && isReminderVisible) ? formatCurrencyTicker(pendingAmount) : null}
            isPendingOverdue={true}
            onTriggerInvest={() => setIsInvestBannerOpen(true)}
            onDismissReminder={handleDismissReminder}
          />
          
          {/* Sandwich Forecast Control: Baseline Label -> Slider -> Result Label */}
          <div className="flex-none flex flex-col items-center w-full px-5 pt-[clamp(8px,2dvh,24px)] pb-[clamp(12px,2dvh,24px)]">
            
            {/* 1. Baseline Label (Gray) — visibility toggled to preserve exact layout height */}
            <div 
              className={`flex items-center gap-2 mb-1 group cursor-pointer transition-opacity duration-200 ${viewType === 'potential' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => viewType === 'potential' && setInfoModal(isFree ? 'totalSaved' : 'directCost')}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-zinc-500" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-zinc-400 transition-colors group-hover:text-white">
                {isFree 
                  ? t.sliderBaseFree.replace('{year}', (currentYear + forecastYears).toString())
                  : t.sliderBaseHooked.replace('{year}', (currentYear + forecastYears).toString())}
              </span>
            </div>

            {/* 2. Slider (The Interaction Tool) */}
            <div className="w-full py-[clamp(8px,1.5dvh,16px)] mb-[clamp(8px,1dvh,12px)]">
              <ForecastSlider
                forecastYears={forecastYears}
                maxYears={maxYears}
                onForecastChange={setForecastYears}
                gradientColor={gradientColor}
              />
            </div>

            {/* 3. Result Label (Värillinen) */}
            <div 
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => setInfoModal(isFree ? (viewType === 'potential' ? 'potential' : 'valueInYear') : (viewType === 'potential' ? 'indirectLoss' : 'lostInvestment'))}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isFree ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'}`} />
              <span className={`text-[10px] uppercase tracking-[0.1em] font-medium ${colorClass} transition-opacity group-hover:opacity-100 opacity-90`}>
                {viewType === 'secured' 
                  ? (isFree 
                      ? t.sliderResultSecuredFree.replace('{year}', (currentYear + forecastYears).toString())
                      : t.sliderResultSecuredHooked.replace('{year}', (currentYear + forecastYears).toString()))
                  : (isFree 
                      ? t.sliderResultPotentialFree.replace('{year}', (currentYear + forecastYears).toString())
                      : t.sliderResultPotentialHooked.replace('{year}', (currentYear + forecastYears).toString()))}
              </span>
            </div>
          </div>
        </div>

        {/* Elastic Spacer 3: Space between Slider and Share button */}
        <div className="flex-[1] min-h-[clamp(8px,2dvh,24px)] shrink-0" />

        {/* Content Section 3: Action Buttons — Share + optional App Store */}
        <div className="flex-none w-full pb-[clamp(16px,3dvh,32px)] flex justify-center items-center gap-6 shrink-0">
          <button
            onClick={handleShare}
            className="group flex items-center justify-center gap-2.5 text-zinc-500 hover:text-white transition-colors active:scale-95 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.4em] py-3 px-6 drop-shadow-sm"
          >
            <Share2 size={13} className="stroke-[2.5]" />
            <span>{isFree ? t.shareAccomplishment : t.shareSituation}</span>
          </button>
          {isWebBrowser && (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2.5 text-zinc-500 hover:text-white transition-colors active:scale-95 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.4em] py-3 px-6 drop-shadow-sm"
            >
              <Apple size={13} className="stroke-[2.5]" />
              <span>{t.downloadApp}</span>
            </a>
          )}
        </div>
      </div>

      {modalType && (
        <ConfirmActionModal
          type={modalType}
          onConfirm={handleConfirmAction}
          onCancel={() => setModalType(null)}
          settings={settings}
        />
      )}

      <SideDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onEditSettings={onEditSettings}
        onShowInfo={setInfoModal}
        onTriggerAction={(type) => {
          setModalType(type);
          setIsMenuOpen(false);
        }}
        isFree={isFree}
      />

      <InfoModal
        type={infoModal}
        onClose={() => setInfoModal(null)}
        isFree={isFree}
      />

      <InvestConfirmBanner
        isOpen={isInvestBannerOpen}
        onClose={() => setIsInvestBannerOpen(false)}
        onConfirm={handleMarkAsInvested}
        pendingAmount={formatCurrencyTicker(pendingAmount)}
      />
    </div>
  );
}
