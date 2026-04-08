import React from 'react';
import { X as CloseIcon } from 'lucide-react';
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

export default function MetricsDashboard({
  isFree, colorClass, accumulated, securedFV, totalDirectSavings, totalForecast,
  forecastYears, currentYear, formatCurrency, t, onShowInfo,
  pendingAmount, isPendingOverdue, onTriggerInvest, onDismissReminder,
  children
}: Props & { children: React.ReactNode }) {

  const yrs = forecastYears.toString();

  return (
    <div className="w-full flex flex-col items-center gap-7 px-4">

      {/* ═══ METRIIKKA 1: Käteissäästö/kulu ═══ */}
      <div
        onClick={() => onShowInfo(isFree ? 'savedNow' : 'lostNow')}
        className="cursor-pointer text-center w-full group"
      >
        {/* Otsikko: ultra-pieni, väljä */}
        <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-600 mb-2.5 group-hover:text-zinc-400 transition-colors duration-300">
          {isFree ? t.dashSaved : t.dashLost}
        </div>

        {/* Pääluku */}
        <span className={`font-sans tabular-nums font-light tracking-tight block text-[2.6rem] leading-none ${colorClass} transition-colors`}>
          {formatCurrency(accumulated, 3)}
        </span>

        {/* Sijoitusmuistutus — suoraan luvun alla */}
        <AnimatePresence>
          {isFree && pendingAmount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-2 mt-1.5 overflow-hidden"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onTriggerInvest(); }}
                className={`flex items-center gap-1.5 transition-all duration-300 ${
                  isPendingOverdue ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-300'
                }`}
              >
                <div className={`w-1 h-1 rounded-full flex-shrink-0 ${isPendingOverdue ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
                <span className="text-[8px] uppercase tracking-[0.1em] font-medium">
                  {t.pendingTransfer}: <span className="text-white/50 font-sans">{pendingAmount}</span>
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

        {/* Sekundääriluku: yksi himmeä rivi */}
        <div
          onClick={(e) => { e.stopPropagation(); onShowInfo(isFree ? 'totalSaved' : 'directCost'); }}
          className="mt-2.5 text-[10px] text-zinc-700 font-mono cursor-pointer hover:text-zinc-500 transition-colors duration-300 tracking-wide"
        >
          {(isFree ? t.dashPureSavings : t.dashPureCosts).replace('{years}', yrs)}
          {' '}
          <span className="text-zinc-500">{formatCurrency(totalDirectSavings, 2)}</span>
        </div>
      </div>

      {/* Hienovarainen erotin */}
      <div className="w-10 h-px bg-white/[0.05]" />

      {/* ═══ METRIIKKA 2: Sijoitusarvo ═══ */}
      <div
        onClick={() => onShowInfo(isFree ? 'valueInYear' : 'lostInvestment')}
        className="cursor-pointer text-center w-full group"
      >
        {/* Otsikko: ultra-pieni, väljä */}
        <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-600 mb-2.5 group-hover:text-zinc-400 transition-colors duration-300">
          {(isFree ? t.dashInvested : t.dashLostInvested).replace('{years}', yrs)}
        </div>

        {/* Pääluku */}
        <span className={`font-sans tabular-nums font-light tracking-tight block text-[2.6rem] leading-none ${colorClass} transition-colors`}>
          {formatCurrency(securedFV, 3)}
        </span>

        {/* Sekundääriluku: yksi himmeä rivi */}
        <div
          onClick={(e) => { e.stopPropagation(); onShowInfo(isFree ? 'potential' : 'indirectLoss'); }}
          className="mt-2.5 text-[10px] text-zinc-700 font-mono cursor-pointer hover:text-zinc-500 transition-colors duration-300 tracking-wide"
        >
          {(isFree ? t.dashTotalWealth : t.dashLostWealth).replace('{years}', yrs)}
          {' '}
          <span className="text-zinc-500">{formatCurrency(totalForecast, 2)}</span>
        </div>
      </div>

      {/* ═══ SLIDER — häivytetty, toimii yhä ═══ */}
      <div className="w-full pt-1">
        {children}
      </div>

    </div>
  );
}
