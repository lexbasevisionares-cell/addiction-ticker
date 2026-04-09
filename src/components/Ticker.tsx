import { useState, useEffect, useLayoutEffect, useMemo, memo } from 'react';
import { Menu, Share2 } from 'lucide-react';
import { calculateAccumulated, calculateSecuredFutureValue, calculateTotalForecast } from '../utils/finance';
import { t, formatCurrency } from '../utils/i18n';
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

  const formatCurrencyTicker = (val: number, fractionDigits: number = 2) => formatCurrency(val, 'EUR', fractionDigits);

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
    <div className="h-full bg-[#050505] font-sans flex flex-col text-white overflow-hidden relative">
      {/* FIXED TOP BAR: Title (Brand) -> Progress Placeholder (Anchor matched) */}
      <div className="w-full flex flex-col items-center justify-center px-6 pt-[clamp(32px,5.5vh,48px)] pb-2 relative z-50 text-center">
        <div className="text-[11px] font-semibold text-white uppercase tracking-[0.6em] mb-5">
          {t.tickerHeader}
        </div>
        
        {/* Invisible progress bar placeholder to match Onboarding height exactly */}
        <div className="w-full max-w-lg px-8 flex gap-1.5 opacity-0 pb-0.5 pointer-events-none">
          <div className="h-0.5 flex-1 bg-white/5 rounded-full" />
        </div>

        <div className="absolute right-4 top-[clamp(32px,5.5vh,48px)] z-50">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-zinc-400 hover:text-white transition-all p-3 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl rounded-full border border-white/10 shadow-2xl"
            aria-label="Valikko"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full mx-auto relative z-10 flex flex-col h-full overflow-hidden justify-between mt-[-1vh]">
        {/* Spacer to push content down - more breathing room created by higher header */}
        <div className="flex-[0.06] min-h-[8px]" />

        {/* Content Section: Timer */}
        <div className="flex flex-col items-center w-full pb-0 px-4 relative">
          <TimerDisplay
            isFree={isFree}
            days={days}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            colorClass={colorClass}
            t={t}
            startTime={appState.startTime}
            onShowInfo={setInfoModal}
          />
        </div>

        {/* Middle section: Chart with toggle + metrics */}
        <div className="flex-1 flex flex-col w-full overflow-hidden min-h-0">
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
            formatCurrency={formatCurrencyTicker}
            t={t}
            onShowInfo={setInfoModal}
            pendingAmount={(pendingAmount >= (settings.investReminderThreshold ?? 0.01) && isReminderVisible) ? formatCurrencyTicker(pendingAmount) : null}
            isPendingOverdue={true}
            onTriggerInvest={() => setIsInvestBannerOpen(true)}
            onDismissReminder={handleDismissReminder}
          />
          
          {/* Sandwich Forecast Control: Baseline Label -> Slider -> Result Label */}
          <div className="flex flex-col items-center w-full px-5 pt-2 pb-2 lg:pt-4 lg:pb-4">
            
            {/* 1. Baseline Label (Gray) — visibility toggled to preserve exact layout height */}
            <div 
              className={`flex items-center gap-2 mb-1 group cursor-pointer transition-opacity duration-200 ${viewType === 'potential' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => viewType === 'potential' && setInfoModal(isFree ? 'totalSaved' : 'directCost')}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-zinc-500" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-zinc-400 transition-colors group-hover:text-white">
                {isFree 
                  ? `Tätä menoa puhdas käteissäästö vuonna ${currentYear + forecastYears}` 
                  : `Tätä menoa suorat kulut yhteensä vuonna ${currentYear + forecastYears}`}
              </span>
            </div>

            {/* 2. Slider (The Interaction Tool) */}
            <div className="w-full py-[clamp(4px,1dvh,12px)] mb-[clamp(4px,1dvh,8px)]">
              <ForecastSlider
                forecastYears={forecastYears}
                maxYears={maxYears}
                onForecastChange={setForecastYears}
                gradientColor={gradientColor}
                isFree={isFree}
                colorClass={colorClass}
                formatCurrency={formatCurrencyTicker}
                t={t}
                onShowInfo={setInfoModal}
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
                      ? `Jo säästetyn pääoman arvo vuonna ${currentYear + forecastYears}`
                      : `Jo käytetyn rahan menetetty arvo vuonna ${currentYear + forecastYears}`)
                  : (isFree 
                      ? `Tätä menoa sijoitussalkun arvo vuonna ${currentYear + forecastYears}` 
                      : `Tätä menoa menetetty varallisuus vuonna ${currentYear + forecastYears}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom section: Stealth Share Link */}
        <div className="w-full pb-[clamp(16px,4dvh,32px)] flex justify-center mt-[clamp(8px,2dvh,24px)]">
          <button
            onClick={handleShare}
            className="group flex items-center justify-center gap-2.5 text-zinc-400 hover:text-white transition-colors active:scale-95 text-[10px] font-semibold uppercase tracking-[0.4em] py-2 px-4 drop-shadow-sm"
          >
            <Share2 size={13} className="stroke-[2.5]" />
            <span>{isFree ? t.shareAccomplishment : t.shareSituation}</span>
          </button>
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
        t={t}
      />

      <InfoModal
        type={infoModal}
        onClose={() => setInfoModal(null)}
        isFree={isFree}
        t={t}
      />

      <InvestConfirmBanner
        isOpen={isInvestBannerOpen}
        onClose={() => setIsInvestBannerOpen(false)}
        onConfirm={handleMarkAsInvested}
        pendingAmount={formatCurrencyTicker(pendingAmount)}
        t={t}
      />
    </div>
  );
}
