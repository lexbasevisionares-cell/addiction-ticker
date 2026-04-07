import { useState, useEffect, useMemo, memo } from 'react';
import { Menu, Share2 } from 'lucide-react';
import { calculateAccumulated, calculateSecuredFutureValue, calculateTotalForecast } from '../utils/finance';
import { t, formatCurrency } from '../utils/i18n';
import { UserSettings } from './Onboarding';
import TimerDisplay from './TimerDisplay';
import FinancialChart from './FinancialChart';
import ForecastSlider from './ForecastSlider';
import SideDrawer from './SideDrawer';
import InfoModal, { InfoType } from './InfoModal';
import ConfirmActionModal from './ConfirmActionModal';
import InvestConfirmBanner from './InvestConfirmBanner';

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
}

export default function Ticker({ settings, appState, onUpdateState, onEditSettings }: Props) {
  const [now, setNow] = useState(Date.now());
  const [stableNow, setStableNow] = useState(Date.now());
  const [forecastYears, setForecastYears] = useState(10);
  const [viewType, setViewType] = useState<'secured' | 'potential'>('secured');
  const [modalType, setModalType] = useState<'quit' | 'relapse' | 'reset' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<InfoType | null>(null);
  const [isInvestBannerOpen, setIsInvestBannerOpen] = useState(false);



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
    // Päivitetään luvut nopeammalla syklillä jotta "elävä" tuotto pyörii sulavasti (esim. 50ms = 20 fps)
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setStableNow(Date.now());
  }, [appState.startTime]);

  const isFree = appState.status === 'vapaa';
  const colorClass = isFree ? 'text-emerald-400' : 'text-red-400';
  const gradientColor = isFree ? '#34d399' : '#f87171';

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

  // Reaaliaikaiset mittarit ruutua varten, jotta luvut pyörivät "niin tarkasti kuin ikinä mahdollista"
  const elapsedDays = Math.max(0, elapsedMs) / (1000 * 60 * 60 * 24);
  const yearsToTargetExactLive = Math.max(0, (stableTargetDate - now) / (1000 * 60 * 60 * 24 * 365.25));
  const totalYearsLive = elapsedDays / 365.25 + yearsToTargetExactLive;

  const accumulated = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, elapsedDays);
  
  // Oikea salkun nykyarvo, joka sisältää jo kertyneet menneiden kuukausien/vuosien korot säästetylle summalle (real-time velocity)
  const currentPortfolioValueLive = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, elapsedDays / 365.25, settings.expectedReturn);
  const securedFV = calculateSecuredFutureValue(currentPortfolioValueLive, yearsToTargetExactLive, settings.expectedReturn);
  
  const totalForecast = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, totalYearsLive, settings.expectedReturn);
  const totalDirectSavings = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, totalYearsLive * 365.25);

  const lastTransferTime = appState.lastTransferTime || appState.startTime;
  const pendingDays = (now - lastTransferTime) / (1000 * 60 * 60 * 24);
  const pendingAmount = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, pendingDays);
  const isPendingOverdue = pendingDays >= 7;

  const handleMarkAsInvested = () => {
    onUpdateState({
      ...appState,
      lastTransferTime: Date.now(),
      lastDismissedAmount: 0
    });
  };

  const handleDismissReminder = () => {
    onUpdateState({
      ...appState,
      lastDismissedAmount: pendingAmount
    });
  };

  const isReminderVisible = pendingAmount > (appState.lastDismissedAmount || 0) + 0.001; // Tiny buffer

  const graphData = useMemo(() => {
    const data = [];
    const elapsedYears = stableElapsedDays / 365.25;
    const stableAccumulated = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, stableElapsedDays);
    const stablePortfolioValue = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, elapsedYears, settings.expectedReturn);

    if (forecastYears > 0) {
      for (let i = 0; i <= forecastYears; i++) {
        const year = currentYear + i;
        const yearsFromStart = elapsedYears + i;

        const directCost = viewType === 'potential' 
          ? calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, yearsFromStart * 365.25)
          : stableAccumulated;

        const investedValue = viewType === 'potential'
          ? calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, yearsFromStart, settings.expectedReturn)
          : calculateSecuredFutureValue(stablePortfolioValue, i, settings.expectedReturn);
        
        data.push({ year, directCost, investedValue });
      }
    } else {
      data.push({
        year: currentYear,
        directCost: stableAccumulated,
        investedValue: stablePortfolioValue
      });
    }
    return data;
  }, [currentYear, forecastYears, settings.dailyCost, settings.annualPriceIncrease, settings.expectedReturn, stableElapsedDays, viewType]);

  const handleConfirmAction = () => {
    if (modalType === 'quit') {
      onUpdateState({ status: 'vapaa', startTime: Date.now(), lastTransferTime: Date.now() });
    } else if (modalType === 'relapse') {
      onUpdateState({ status: 'riippuvainen', startTime: Date.now() });
    }
    setModalType(null);
  };

  const formatCurrencyTicker = (val: number) => formatCurrency(val, 'EUR');

  const handleShare = async () => {
    const url = 'https://addictionticker.netlify.app/';
    const formattedTotal = formatCurrencyTicker(totalForecast);
    const formattedCurrent = formatCurrencyTicker(accumulated);

    let text = '';
    if (isFree) {
      text = t.shareTextFree
        .replace('{A}', days.toString())
        .replace('{B}', formattedCurrent)
        .replace('{C}', settings.expectedReturn.toString())
        .replace('{D}', formatCurrencyTicker(securedFV))
        .replace(/{E}/g, forecastYears.toString())
        .replace('{F}', formattedTotal);
    } else {
      text = t.shareTextHooked
        .replace('{A}', forecastYears.toString())
        .replace('{B}', formattedTotal);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: t.tickerHeader,
          text: text,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert(t.linkCopied);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] font-sans flex flex-col text-white overflow-x-hidden overflow-y-auto relative">
      <div className="flex-1 w-full mx-auto relative z-10 flex flex-col justify-center min-h-[100dvh] lg:min-h-[auto] pt-10 pb-4 lg:py-16">
        <div className="absolute right-4 top-8 lg:fixed lg:right-10 lg:top-10 z-50">
          <button onClick={() => setIsMenuOpen(true)} className="text-zinc-600 hover:text-white transition-all p-4 lg:p-6 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/5 shadow-2xl" aria-label="Valikko">
            <Menu className="w-5 h-5 lg:w-8 lg:h-8" />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] xl:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-16 xl:gap-24 lg:items-center px-1 md:px-8 xl:px-12 lg:max-w-[1400px] 2xl:max-w-[1700px] mx-auto w-full">
          <div className="flex flex-col items-center justify-center w-full lg:order-1 mt-0 mb-0 lg:my-0 lg:h-full relative lg:space-y-12">
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

            <div className="hidden lg:flex w-full flex-col items-center gap-6 mt-12">
              <button
                onClick={handleShare}
                className="flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black hover:bg-zinc-200 text-base font-bold uppercase tracking-widest transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                <Share2 size={20} />
                {t.shareBtn}
              </button>

              {!isFree && (
                <button onClick={() => setModalType('quit')} className="text-base text-zinc-500 hover:text-emerald-400 uppercase tracking-[0.2em] transition-colors pb-1 border-b border-transparent hover:border-emerald-400/30">
                  {t.quitAddiction}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full lg:order-2 space-y-1 lg:space-y-12 mt-1 lg:mt-0">
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
              pendingAmount={(pendingAmount > 0.01 && isReminderVisible) ? formatCurrencyTicker(pendingAmount) : null}
              isPendingOverdue={isPendingOverdue}
              onTriggerInvest={() => setIsInvestBannerOpen(true)}
              onDismissReminder={handleDismissReminder}
            />

            <ForecastSlider
              forecastYears={forecastYears}
              onForecastChange={setForecastYears}
              gradientColor={gradientColor}
              isFree={isFree}
              colorClass={colorClass}
              formatCurrency={formatCurrencyTicker}
              t={t}
              onShowInfo={setInfoModal}
            />
          </div>

          <div className="lg:hidden mt-3 mb-2 w-full flex flex-col items-center gap-3 order-3">
            {!isFree && (
              <button
                onClick={() => setModalType('quit')}
                className="flex items-center justify-center w-full max-w-xs px-8 py-3.5 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_24px_rgba(239,68,68,0.4)]"
              >
                {t.quitAddiction}
              </button>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-8 py-3 mt-1 rounded-full bg-white hover:bg-zinc-200 active:scale-95 text-black text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Share2 size={13} />
              {t.shareBtn}
            </button>
          </div>
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
