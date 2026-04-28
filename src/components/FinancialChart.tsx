import { useState, useRef, useEffect, useCallback } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { Info, ArrowRight, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useI18n } from '../context/I18nContext';
import type { InfoType } from './InfoModal';

export interface GraphDataPoint {
  year: number;
  directCost: number;
  investedValue: number;
}

interface Props {
  graphData: GraphDataPoint[];
  viewType: 'secured' | 'potential';
  onViewTypeChange: (type: 'secured' | 'potential') => void;
  isFree: boolean;
  gradientColor: string;
  colorClass: string;
  accumulated: number;
  securedFV: number;
  totalForecast: number;
  totalDirectSavings: number;
  forecastYears: number;
  currentYear: number;
  onShowInfo: (type: InfoType) => void;
  pendingAmount: string | null;
  isPendingOverdue: boolean;
  onTriggerInvest: () => void;
  onDismissReminder: () => void;
}

const CustomTooltip = ({ active, payload, setHoveredData, handleInteraction }: any) => {
  useEffect(() => {
    if (active) {
      handleInteraction();
      if (payload && payload.length > 0) {
        setHoveredData(payload[0].payload);
      }
    }
  }, [active, payload, setHoveredData, handleInteraction]);
  return null;
};

export default function FinancialChart({
  graphData, viewType, onViewTypeChange, isFree, gradientColor, colorClass, accumulated, securedFV, totalForecast,
  totalDirectSavings, forecastYears, currentYear, onShowInfo,
  pendingAmount, isPendingOverdue, onTriggerInvest, onDismissReminder
}: Props) {
  const { t, formatCurrencyString: formatCurrency, formatCurrencyHtml } = useI18n();
  const [hoveredData, setHoveredData] = useState<GraphDataPoint | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInteraction = useCallback(() => {
    setIsInteracting(prev => {
      if (!prev && Capacitor.isNativePlatform()) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
      return true;
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      setHoveredData(null);
    }, 3000);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Brief delay so the last touched point stays visible momentarily
    timeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      setHoveredData(null);
    }, 600);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const displayData = hoveredData || graphData[graphData.length - 1];

  // Compact currency formatter for Y-axis ticks
  const formatCompact = (value: number): string => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
    return Math.round(value).toString();
  };

  if (!displayData) return null;

  const rightSideValue = hoveredData 
    ? displayData.investedValue 
    : (viewType === 'potential' ? totalForecast : securedFV);

  const leftValue = hoveredData 
    ? displayData.directCost 
    : (viewType === 'potential' ? totalDirectSavings : accumulated);

  const showDecimals = viewType === 'secured';

  const leftValueString = formatCurrencyHtml(leftValue, showDecimals ? 2 : 0);
  const rightValueString = formatCurrencyHtml(rightSideValue, showDecimals ? 2 : 0);

  const fontSizeClass = 'text-[clamp(1.75rem,6.5vw,4rem)]';

  return (
    <div className="w-full relative flex flex-col h-full">
      <div className="flex flex-col w-full mb-0 lg:mb-2 relative z-10">
        
        {/* Row 1: View Switcher Toggle - Shown in BOTH states */}
        <div className="flex justify-center mt-6 mb-5 lg:mt-10 lg:mb-10">
          <div className="inline-flex items-center p-1 bg-white/[0.02] backdrop-blur-2xl rounded-full border border-white/[0.05] relative shadow-2xl">
            <button 
              onClick={() => onViewTypeChange('secured')}
              className={`relative px-4 py-1.5 text-[11px] md:text-[12px] lg:text-[13px] uppercase tracking-[0.4em] font-medium transition-colors duration-300 ${
                viewType === 'secured' ? (isFree ? 'text-emerald-400' : 'text-red-400') : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {viewType === 'secured' && (
                <motion.div
                  layoutId="viewSwitcherPill"
                  className="absolute inset-0 bg-zinc-800/80 rounded-full z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{isFree ? t.viewSecured : t.viewLostAlready}</span>
            </button>
            
            <button 
              onClick={() => onViewTypeChange('potential')}
              className={`relative px-4 py-1.5 text-[11px] md:text-[12px] lg:text-[13px] uppercase tracking-[0.4em] font-medium transition-colors duration-300 ${
                viewType === 'potential' ? (isFree ? 'text-emerald-400' : 'text-red-400') : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {viewType === 'potential' && (
                <motion.div
                  layoutId="viewSwitcherPill"
                  className="absolute inset-0 bg-zinc-800/80 rounded-full z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{t.viewPotential.replace('{year}', (currentYear + forecastYears).toString())}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Metric Details - Centered Headers + Arrow Flow */}
        <div className="flex items-center justify-between px-2 lg:px-4 mb-1 lg:mb-2">
          {/* Left Side: Saved/Cost */}
          <div className="flex flex-col items-center flex-1">
            <div 
              className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => onShowInfo(isFree ? (viewType === 'potential' ? 'totalSaved' : 'savedNow') : (viewType === 'potential' ? 'directCost' : 'lostNow'))}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span 
                  key={viewType}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-sans tabular-nums ${fontSizeClass} font-light text-white tracking-tighter leading-none block whitespace-nowrap`}
                  dangerouslySetInnerHTML={{ __html: leftValueString }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Growth/Loss Arrow — Now bright and neon */}
          <div className={`shrink-0 px-2 lg:px-6 mt-0 ${colorClass} drop-shadow-[0_0_12px_currentColor]`}>
            <ArrowRight className="w-[clamp(24px,6vw,40px)] h-[clamp(24px,6vw,40px)] opacity-80" strokeWidth={2.5} />
          </div>

          {/* Right Side: Projected / Potential */}
          <div className="flex flex-col items-center flex-1">
            <div 
              className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => onShowInfo(isFree ? (viewType === 'potential' ? 'potential' : 'valueInYear') : (viewType === 'potential' ? 'indirectLoss' : 'lostInvestment'))}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span 
                  key={viewType}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-sans tabular-nums ${fontSizeClass} font-light ${colorClass} tracking-tighter leading-none block whitespace-nowrap`}
                  dangerouslySetInnerHTML={{ __html: rightValueString }}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Hovered DateIndicator */}
        <div className="text-center h-3 lg:h-4 mt-0 lg:mt-1">
          <span className={`text-[10px] uppercase tracking-[0.6em] font-medium transition-all ${isFree ? 'text-emerald-400/50' : 'text-rose-400/50'}`}>
            {hoveredData ? `${t.year} ${Math.round(displayData.year)}` : ''}
          </span>
        </div>
      </div>

      <div
        className={`flex-1 min-h-[140px] chart-container ${isInteracting ? 'interacting' : ''} outline-none focus:outline-none select-none relative mb-[clamp(10px,2dvh,40px)] mt-2 lg:mt-6 z-0`}
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleInteraction}
        onMouseMove={handleInteraction}
        onClick={handleInteraction}
        onMouseLeave={() => {
          setIsInteracting(false);
          setHoveredData(null);
        }}
      >
        {/* Real-time Reminder Overlay — Positioned in the empty chart area (bottom-left) */}
        {isFree && viewType === 'secured' && pendingAmount && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-14 left-6 lg:bottom-24 lg:left-12 z-20 pointer-events-auto flex items-center gap-2"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTriggerInvest();
              }}
              className={`group flex items-center bg-white/[0.03] backdrop-blur-3xl px-5 py-3.5 lg:px-6 lg:py-4 rounded-full border border-white/[0.05] hover:bg-white/[0.08] transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] ${
                isPendingOverdue ? (isFree ? 'text-emerald-400' : 'text-rose-500') : 'text-zinc-500'
              }`}
            >
              <div className="flex items-center gap-2 min-w-[max-content]">
                <div className={`w-1.5 h-1.5 rounded-full ${isPendingOverdue ? (isFree ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]') : 'bg-zinc-600'}`} />
                <span className={`text-[10px] lg:text-[12px] uppercase tracking-[0.2em] font-medium transition-opacity group-hover:opacity-100 ${isPendingOverdue ? '' : 'opacity-80'}`}>
                  {t.pendingTransfer}: {pendingAmount}
                </span>
              </div>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismissReminder();
              }}
              className="p-2 rounded-full bg-black/20 hover:bg-black/60 border border-white/5 text-zinc-600 hover:text-white transition-all backdrop-blur-md active:scale-90"
              aria-label="Dismiss reminder"
            >
              <CloseIcon size={14} />
            </button>
          </motion.div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={graphData}
            margin={{ top: 5, right: 8, left: 0, bottom: 0 }}
            onMouseLeave={handleTouchEnd}
            onTouchEnd={handleTouchEnd}
          >
            <defs>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColor} stopOpacity={0.65} />
                <stop offset="100%" stopColor={gradientColor} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#71717a" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#71717a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <YAxis
              domain={[0, 'dataMax']}
              tick={{ fill: '#3f3f46', fontSize: 9, fontFamily: 'Outfit' }}
              axisLine={false}
              tickLine={false}
              width={46}
              tickCount={4}
              tickFormatter={formatCompact}
            />
            <XAxis
              dataKey="year"
              type="number"
              domain={['dataMin', 'dataMax']}
              allowDecimals={false}
              tickFormatter={(val) => Math.round(val).toString()}
              tick={{ fill: '#3f3f46', fontSize: 9, fontFamily: 'Outfit' }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <Tooltip
              content={<CustomTooltip setHoveredData={setHoveredData} handleInteraction={handleInteraction} />}
              cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1, strokeDasharray: '4 3' }}
              isAnimationActive={false}
            />
            {/* 1. Baseline (Harmaa) — always visible */}
            <Area 
              type="monotoneX" 
              dataKey="directCost" 
              stroke="#52525b" 
              strokeWidth={1} 
              fillOpacity={1} 
              fill="url(#colorDirect)" 
              isAnimationActive={false}
              activeDot={{ r: 5, fill: '#71717a', stroke: '#050505', strokeWidth: 2 }}
            />
            {/* 2. Growth/Potential (Neon) on top */}
            <Area 
              type="monotoneX" 
              dataKey="investedValue" 
              stroke={gradientColor} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorInvested)" 
              style={{ filter: `drop-shadow(0px -4px 8px ${gradientColor}80)` }}
              isAnimationActive={false}
              activeDot={{ r: 6, fill: gradientColor, stroke: '#050505', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
