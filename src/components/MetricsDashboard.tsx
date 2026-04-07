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
  formatCurrency: (value: number) => string;
  t: TranslationStrings;
  onShowInfo: (type: InfoType) => void;
  pendingAmount: string | null;
  isPendingOverdue: boolean;
  onTriggerInvest: () => void;
  onDismissReminder: () => void;
}

// MetricCard — ulkopuolella renderöintifunktiota
function MetricCard({ 
  label, value, infoType, isHighlight = false, colorClass, formatCurrency, onShowInfo, children 
}: { 
  label: string; 
  value: number; 
  infoType: InfoType; 
  isHighlight?: boolean; 
  colorClass: string; 
  formatCurrency: (v: number) => string; 
  onShowInfo: (type: InfoType) => void;
  children?: React.ReactNode;
}) {
  return (
    <div 
      onClick={() => onShowInfo(infoType)}
      className={`w-full cursor-pointer group rounded-2xl px-4 py-3 lg:px-5 lg:py-4 transition-all ${
        isHighlight 
          ? 'bg-white/[0.04]' 
          : 'bg-white/[0.02] hover:bg-white/[0.03]'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`text-[11px] lg:text-[13px] uppercase tracking-[0.06em] font-bold leading-tight ${
          isHighlight ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'
        } transition-colors`}>
          {label}
        </span>
        <Info size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
      </div>
      <span className={`font-mono tabular-nums font-black tracking-tight block ${
        isHighlight 
          ? `text-4xl lg:text-5xl ${colorClass}` 
          : 'text-3xl lg:text-4xl text-zinc-200 group-hover:text-white'
      } transition-colors`}>
        {formatCurrency(value)}
      </span>
      {children}
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

      {/* JO SAAVUTETTU — Kortit 1 & 2 */}
      <MetricCard 
        label={isFree ? t.dashSaved : t.dashLost}
        value={accumulated}
        infoType={isFree ? 'savedNow' : 'lostNow'}
        colorClass={colorClass}
        formatCurrency={formatCurrency}
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
      </MetricCard>

      <MetricCard 
        label={(isFree ? t.dashInvested : t.dashLostInvested).replace('{years}', yrs)}
        value={securedFV}
        infoType={isFree ? 'valueInYear' : 'lostInvestment'}
        colorClass={colorClass}
        formatCurrency={formatCurrency}
        onShowInfo={onShowInfo}
      />

      {/* SLIDER */}
      <div className="my-1 lg:my-3">
        {children}
      </div>

      {/* TÄTÄ MENOA SAAVUTETTAVA — Kortit 3 & 4 */}
      <MetricCard 
        label={(isFree ? t.dashPureSavings : t.dashPureCosts).replace('{years}', yrs)}
        value={totalDirectSavings}
        infoType={isFree ? 'totalSaved' : 'directCost'}
        colorClass={colorClass}
        formatCurrency={formatCurrency}
        onShowInfo={onShowInfo}
      />
      
      <MetricCard 
        label={(isFree ? t.dashTotalWealth : t.dashLostWealth).replace('{years}', yrs)}
        value={totalForecast}
        infoType={isFree ? 'potential' : 'indirectLoss'}
        isHighlight={true}
        colorClass={colorClass}
        formatCurrency={formatCurrency}
        onShowInfo={onShowInfo}
      />

    </div>
  );
}
