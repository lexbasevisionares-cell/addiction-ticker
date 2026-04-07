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

export default function MetricsDashboard({
  isFree, colorClass, accumulated, securedFV, totalDirectSavings, totalForecast,
  forecastYears, currentYear, formatCurrency, t, onShowInfo,
  pendingAmount, isPendingOverdue, onTriggerInvest, onDismissReminder,
  children
}: Props & { children: React.ReactNode }) {

  const yrs = forecastYears.toString();

  return (
    <div className="w-full flex flex-col gap-2 px-3">

      {/* ═══ PARI 1: Säästöt / Kulut ═══ */}
      <div className="w-full rounded-[24px] px-5 py-4 lg:px-6 lg:py-5 bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.025] hover:border-white/[0.08] transition-all duration-300">

        {/* Primääri: Tähän mennessä — reaaliaikainen, ei slider-riippuvainen */}
        <div
          onClick={() => onShowInfo(isFree ? 'savedNow' : 'lostNow')}
          className="cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs lg:text-sm uppercase tracking-[0.08em] font-bold leading-tight text-zinc-400 group-hover:text-zinc-200 transition-colors">
              {isFree ? t.dashSaved : t.dashLost}
            </span>
            <Info size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
          </div>
          <span className={`font-mono tabular-nums font-black tracking-tight block text-4xl lg:text-5xl ${colorClass} transition-colors`}>
            {formatCurrency(accumulated, 3)}
          </span>
        </div>

        {/* Sijoitussiirtomuistutus (upotettu pari 1:een) */}
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

        {/* Sekundääri: Tulevaisuuden säästö/kulu — slider-riippuvainen */}
        <div
          onClick={() => onShowInfo(isFree ? 'totalSaved' : 'directCost')}
          className="cursor-pointer group mt-4 pt-4 border-t border-white/[0.04]"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
              {(isFree ? t.dashPureSavings : t.dashPureCosts).replace('{years}', yrs)}
            </span>
            <Info size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
          </div>
          <span className="font-mono tabular-nums font-semibold tracking-tight block text-lg text-zinc-400 group-hover:text-zinc-200 transition-colors">
            {formatCurrency(totalDirectSavings, 2)}
          </span>
        </div>
      </div>

      {/* ═══ PARI 2: Sijoitukset ═══ */}
      <div className="w-full rounded-[24px] px-5 py-4 lg:px-6 lg:py-5 bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.025] hover:border-white/[0.08] transition-all duration-300">

        {/* Primääri: Kasvu sijoitettuna — tikkaa reaaliajassa + slider-riippuvainen */}
        <div
          onClick={() => onShowInfo(isFree ? 'valueInYear' : 'lostInvestment')}
          className="cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs lg:text-sm uppercase tracking-[0.08em] font-bold leading-tight text-zinc-400 group-hover:text-zinc-200 transition-colors">
              {(isFree ? t.dashInvested : t.dashLostInvested).replace('{years}', yrs)}
            </span>
            <Info size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
          </div>
          <span className={`font-mono tabular-nums font-black tracking-tight block text-4xl lg:text-5xl ${colorClass} transition-colors`}>
            {formatCurrency(securedFV, 3)}
          </span>
        </div>

        {/* Sekundääri: Salkun kokonaisarvo — slider-riippuvainen */}
        <div
          onClick={() => onShowInfo(isFree ? 'potential' : 'indirectLoss')}
          className="cursor-pointer group mt-4 pt-4 border-t border-white/[0.04]"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
              {(isFree ? t.dashTotalWealth : t.dashLostWealth).replace('{years}', yrs)}
            </span>
            <Info size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
          </div>
          <span className="font-mono tabular-nums font-semibold tracking-tight block text-lg text-zinc-400 group-hover:text-zinc-200 transition-colors">
            {formatCurrency(totalForecast, 2)}
          </span>
        </div>
      </div>

      {/* ═══ SLIDER — alhaalla, vaikuttaa 3/4 luvusta ═══ */}
      <div className="my-1 lg:my-3">
        {children}
      </div>

    </div>
  );
}
