import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { Info, ArrowRight, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function FinancialChart({
  graphData, viewType, onViewTypeChange, isFree, gradientColor, colorClass, accumulated, securedFV, totalForecast,
  totalDirectSavings, forecastYears, currentYear, onShowInfo,
  pendingAmount, isPendingOverdue, onTriggerInvest, onDismissReminder
}: Props) {
  const { t, formatCurrencyString: formatCurrency } = useI18n();
  const [hoveredData, setHoveredData] = useState<GraphDataPoint | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInteraction = () => {
    setIsInteracting(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      setHoveredData(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const displayData = hoveredData || graphData[graphData.length - 1];

  if (!displayData) return null;

  const rightSideValue = hoveredData 
    ? displayData.investedValue 
    : (viewType === 'potential' ? totalForecast : securedFV);

  const leftValue = hoveredData 
    ? displayData.directCost 
    : (viewType === 'potential' ? totalDirectSavings : accumulated);

  const showDecimals = viewType === 'secured';

  const leftValueString = formatCurrency(leftValue, showDecimals ? 2 : 0);
  const rightValueString = formatCurrency(rightSideValue, showDecimals ? 2 : 0);

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
                  className={`font-sans tabular-nums ${fontSizeClass} font-light text-white tracking-tighter leading-none block`}
                >
                  {leftValueString}
                </motion.span>
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
                  className={`font-sans tabular-nums ${fontSizeClass} font-light ${colorClass} tracking-tighter leading-none block`}
                >
                  {rightValueString}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Hovered DateIndicator */}
        <div className="text-center h-3 lg:h-4 mt-0 lg:mt-1">
          <span className={`text-[10px] uppercase tracking-[0.6em] font-medium transition-all ${isFree ? 'text-emerald-400/50' : 'text-rose-400/50'}`}>
            {hoveredData ? `${t.year} ${displayData.year}` : ''}
          </span>
        </div>
      </div>

      <div
        className="flex-1 min-h-[140px] chart-container outline-none focus:outline-none select-none relative mb-[clamp(10px,2dvh,40px)] -mt-[clamp(10px,3dvh,40px)] z-0"
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
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
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(e: any) => {
              handleInteraction();
              if (e.activePayload && e.activePayload.length > 0) {
                setHoveredData(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => { setIsInteracting(false); setHoveredData(null); }}
          >
            <defs>

              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColor} stopOpacity={0.65} />
                <stop offset="100%" stopColor={gradientColor} stopOpacity={0.05} />
              </linearGradient>
              {viewType === 'potential' && (
                <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#71717a" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#71717a" stopOpacity={0.05} />
                </linearGradient>
              )}
            </defs>
            <YAxis domain={['auto', 'auto']} hide />
            <XAxis dataKey="year" hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-black/90 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] pointer-events-none">
                      <div className="text-[10px] lg:text-xs uppercase tracking-[0.4em] text-zinc-500 font-medium mb-2">{t.year} {data.year}</div>
                      <div className={`font-sans tabular-nums text-4xl lg:text-5xl 2xl:text-6xl font-light ${colorClass} tracking-tighter`}>
                        {formatCurrency(data.investedValue, showDecimals ? 2 : 0)}
                      </div>
                      {viewType === 'potential' && (
                        <div className="font-sans tabular-nums text-sm lg:text-base font-medium text-zinc-400 mt-2">
                          {formatCurrency(data.directCost, showDecimals ? 2 : 0)}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
              isAnimationActive={false}
            />
            {/* Order: 1. Baseline (Harmaa) underneath */}
            {viewType === 'potential' && (
              <Area 
                type="monotone" 
                dataKey="directCost" 
                stroke="#52525b" 
                strokeWidth={0.5} 
                fillOpacity={1} 
                fill="url(#colorDirect)" 
                isAnimationActive={true}
                animationDuration={600}
                activeDot={false}
              />
            )}
            {/* 2. Growth/Potential (Neon) on top */}
            <Area 
              type="monotone" 
              dataKey="investedValue" 
              stroke={gradientColor} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorInvested)" 
              style={{ filter: `drop-shadow(0px -4px 8px ${gradientColor}80)` }}
              isAnimationActive={true}
              animationDuration={600}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
