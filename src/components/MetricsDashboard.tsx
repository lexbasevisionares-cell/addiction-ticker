import React from 'react';
import { Info, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TranslationStrings } from '../utils/i18n';
import type { InfoType } from './InfoModal';

interface Props {
  isFree: boolean;
  colorClass: string;
  accumulated: number;
  securedFV: number;
  totalDirectSavings: number;
  totalForecast: number;
  forecastYears: number;
  currentYear: number;
  formatCurrency: (value: number, fractionDigits?: number) => string;
  t: TranslationStrings;
  onShowInfo: (type: InfoType) => void;
  pendingAmount: string | null;
  isPendingOverdue: boolean;
  onTriggerInvest: () => void;
  onDismissReminder: () => void;
}

// MetricCard — ulkopuolella renderöintifunktiota
function MetricCard({ 
  label, value, infoType, isActive = false, colorClass, formatCurrency, onShowInfo, children 
}: { 
  label: string; 
  value: number; 
  infoType: InfoType; 
  isActive?: boolean; 
  colorClass: string; 
  formatCurrency: (v: number, fractionDigits?: number) => string; 
  onShowInfo: (type: InfoType) => void;
  children?: React.ReactNode;
}) {
  return (
    <div 
      onClick={() => onShowInfo(infoType)}
      className="w-full cursor-pointer group rounded-2xl px-4 py-3 lg:px-5 lg:py-4 transition-all bg-white/[0.02] hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`text-xs lg:text-sm uppercase tracking-[0.06em] font-bold leading-tight ${
          isActive ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-300'
        } transition-colors`}>
          {label}
        </span>
        <Info size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
      </div>
      <span className={`font-mono tabular-nums font-black tracking-tight block text-4xl lg:text-5xl ${
        isActive 
          ? colorClass 
          : 'text-zinc-300 group-hover:text-white'
      } transition-colors`}>
        {formatCurrency(value, 2)}
      </span>
      {children}
    </div>
  );
}

function ClockMetricCard({ 
  label, value, infoType, colorClass, onShowInfo, children 
}: { 
  label: string; 
  value: number; 
  infoType: InfoType; 
  colorClass: string; 
  onShowInfo: (type: InfoType) => void;
  children?: React.ReactNode;
}) {
  const valueStr = value.toFixed(4);
  const [euroParts, decParts] = valueStr.split('.');
  const euros = euroParts;
  const cents = decParts ? decParts.substring(0, 2) : '00';
  const parts = decParts ? decParts.substring(2, 4) : '00';

  return (
    <div 
      onClick={() => onShowInfo(infoType)}
      className="w-full cursor-pointer group rounded-2xl px-2 py-4 lg:py-6 transition-all bg-white/[0.02] hover:bg-white/[0.04] flex flex-col items-center relative"
    >
      <div className="flex items-center gap-1.5 mb-3 lg:mb-5 opacity-80 group-hover:opacity-100 transition-opacity">
        <div className={`w-1.5 h-1.5 rounded-full ${colorClass} animate-pulse`} />
        <span className={`text-xs lg:text-sm uppercase tracking-[0.06em] font-bold leading-tight ${colorClass}`}>
          {label}
        </span>
        <Info size={14} className={`${colorClass} opacity-60`} />
      </div>

      <div className="flex items-baseline justify-center gap-3 md:gap-5 lg:gap-6 font-serif tracking-tighter">
        <div className="flex flex-col items-center">
          <span className={`text-4xl md:text-5xl lg:text-6xl font-black ${colorClass} leading-none tabular-nums`}>{euros}</span>
          <span className="text-[9px] md:text-xs lg:text-sm uppercase tracking-[0.2em] font-medium text-zinc-500 mt-2">Euroa</span>
        </div>
        <span className="text-xl md:text-2xl lg:text-3xl text-zinc-600 font-light -mt-4">:</span>
        <div className="flex flex-col items-center">
          <span className={`text-4xl md:text-5xl lg:text-6xl font-black ${colorClass} leading-none tabular-nums`}>{cents}</span>
          <span className="text-[9px] md:text-xs lg:text-sm uppercase tracking-[0.2em] font-medium text-zinc-500 mt-2">Senttiä</span>
        </div>
        <span className="text-xl md:text-2xl lg:text-3xl text-zinc-600 font-light -mt-4">:</span>
        <div className="flex flex-col items-center">
          <span className={`text-4xl md:text-5xl lg:text-6xl font-black ${colorClass} leading-none tabular-nums w-[2ch] mx-auto text-center`}>{parts}</span>
          <span className="text-[9px] md:text-xs lg:text-sm uppercase tracking-[0.2em] font-medium text-zinc-500 mt-2">Osaa</span>
        </div>
      </div>
      
      {children && <div className="mt-3 w-full flex justify-center">{children}</div>}
    </div>
  );
}

export default function MetricsDashboard({
  isFree, colorClass, accumulated, securedFV, totalDirectSavings, totalForecast,
  forecastYears, currentYear, formatCurrency, t, onShowInfo,
  pendingAmount, isPendingOverdue, onTriggerInvest, onDismissReminder,
  children
}: Props & { children: React.ReactNode }) {

  const yrs = forecastYears.toString();

  return (
    <div className="w-full flex flex-col gap-2 px-3">

      {/* JO SAAVUTETTU — Kortit 1 & 2 (Aktiiviset) */}
      <ClockMetricCard 
        label={isFree ? t.dashSaved : t.dashLost}
        value={accumulated}
        infoType={isFree ? 'savedNow' : 'lostNow'}
        colorClass={colorClass}
        onShowInfo={onShowInfo}
      >
        {/* Sijoitussiirtomuistutus upotettu korttiin 1 */}
        <AnimatePresence>
          {isFree && pendingAmount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mt-1.5 overflow-hidden"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onTriggerInvest(); }}
                className={`group/invest flex items-center gap-1.5 transition-all duration-300 ${
                  isPendingOverdue ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <div className={`w-1 h-1 rounded-full ${isPendingOverdue ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-[8px] uppercase tracking-[0.1em] font-bold pointer-events-none">
                  {t.pendingTransfer}: <span className="text-white/70 font-mono">{pendingAmount}</span>
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDismissReminder(); }}
                className="p-1 text-zinc-700 hover:text-white transition-all"
              >
                <CloseIcon size={9} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ClockMetricCard>

      <MetricCard 
        label={(isFree ? t.dashInvested : t.dashLostInvested).replace('{years}', yrs)}
        value={securedFV}
        infoType={isFree ? 'valueInYear' : 'lostInvestment'}
        isActive={true}
        colorClass={colorClass}
        formatCurrency={formatCurrency}
        onShowInfo={onShowInfo}
      />

      {/* SLIDER */}
      <div className="my-1 lg:my-3">
        {children}
      </div>

      {/* TÄTÄ MENOA SAAVUTETTAVA — Kortit 3 & 4 (Kuolleet) */}
      <MetricCard 
        label={(isFree ? t.dashPureSavings : t.dashPureCosts).replace('{years}', yrs)}
        value={totalDirectSavings}
        infoType={isFree ? 'totalSaved' : 'directCost'}
        isActive={false}
        colorClass={colorClass}
        formatCurrency={formatCurrency}
        onShowInfo={onShowInfo}
      />
      
      <MetricCard 
        label={(isFree ? t.dashTotalWealth : t.dashLostWealth).replace('{years}', yrs)}
        value={totalForecast}
        infoType={isFree ? 'potential' : 'indirectLoss'}
        isActive={false}
        colorClass={colorClass}
        formatCurrency={formatCurrency}
        onShowInfo={onShowInfo}
      />

    </div>
  );
}
