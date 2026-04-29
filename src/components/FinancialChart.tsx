import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, CartesianGrid } from 'recharts';
import { ArrowRight, X as CloseIcon } from 'lucide-react';
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
  iconColorClass: string;
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
  graphData, viewType, onViewTypeChange, isFree, gradientColor, colorClass, iconColorClass, accumulated, securedFV, totalForecast,
  totalDirectSavings, forecastYears, currentYear, onShowInfo,
  pendingAmount, isPendingOverdue, onTriggerInvest, onDismissReminder
}: Props) {
  const { t, formatCurrencyString: formatCurrency, formatCurrencyHtml } = useI18n();

  const maxVal = Math.max(...graphData.map(p => p.investedValue));
  // Calculate a clean step size and add one extra step for "one box higher" look
  const stepCount = 8; // Number of boxes
  const rawStep = maxVal / (stepCount - 1);
  const step = rawStep === 0 ? 1 : rawStep;
  const yMax = step * stepCount; // This adds one full step of air at the top
  const yTicks = Array.from({ length: stepCount + 1 }, (_, i) => step * i);
  
  const xMax = forecastYears;
  const xTicks = Array.from({ length: 10 }, (_, i) => (xMax / 9) * i);

  // Compact currency formatter for Y-axis ticks
  const formatCompact = (value: number): string => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
    // Smart decimals for small scales
    if (maxVal < 10 && value > 0) return value.toFixed(2);
    return Math.round(value).toString();
  };

  const rightSideValue = viewType === 'potential' ? totalForecast : securedFV;
  const leftValue = viewType === 'potential' ? totalDirectSavings : accumulated;

  // Show decimals if we are in secured view OR if the values are small (e.g. under 100€)
  const showDecimals = viewType === 'secured' || leftValue < 100 || rightSideValue < 100;

  const leftValueString = formatCurrencyHtml(leftValue, showDecimals ? 2 : 0);
  const rightValueString = formatCurrencyHtml(rightSideValue, showDecimals ? 2 : 0);

  const fontSizeClass = 'text-[clamp(1.75rem,6.5vw,4rem)]';

  return (
    <div className="w-full relative flex flex-col h-full">
      <div className="flex flex-col w-full mb-0 lg:mb-2 relative z-10">
        
        {/* Row 1: View Switcher Toggle - Shown in BOTH states */}
        <div className="flex justify-center mt-0 mb-2 lg:mt-6 lg:mb-6">
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
        <div className="flex items-center justify-between px-2 lg:px-4 mt-5 lg:mt-8 mb-0 lg:mb-1">
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
                  className={`font-sans tabular-nums ${fontSizeClass} font-light text-metallic tracking-tighter leading-none block whitespace-nowrap`}
                  dangerouslySetInnerHTML={{ __html: leftValueString }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Growth/Loss Arrow — Now bright and neon */}
          <div className={`shrink-0 px-2 lg:px-6 mt-0 ${iconColorClass} drop-shadow-[0_0_12px_currentColor]`}>
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

      </div>

      <div
        className="flex-1 min-h-[240px] lg:min-h-[320px] chart-container select-none relative mb-0 mt-0 z-0"
        style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}
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
                isPendingOverdue ? (isFree ? 'text-metallic-emerald' : 'text-metallic-rose') : 'text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 min-w-[max-content]">
                <div className={`w-1.5 h-1.5 rounded-full ${isPendingOverdue ? (isFree ? 'bg-metallic-emerald' : 'bg-metallic-rose') : 'bg-zinc-600'}`} />
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
            margin={{ top: 35, right: 30, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="strokeMetallicEmerald" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="80%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <linearGradient id="strokeMetallicRose" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="40%" stopColor="#ef4444" />
                <stop offset="80%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColor} stopOpacity={0.6} />
                <stop offset="30%" stopColor={gradientColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={gradientColor} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#52525b" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#18181b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <YAxis
              domain={[0, yMax]}
              ticks={yTicks}
              interval={0}
              tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'Outfit' }}
              axisLine={{ stroke: '#52525b', strokeWidth: 0.25, strokeOpacity: 0.2 }}
              tickLine={false}
              width={48}
              tickFormatter={formatCompact}
            />
            <XAxis
              dataKey="year"
              type="number"
              domain={[currentYear, currentYear + forecastYears]}
              ticks={xTicks.map(t => currentYear + t)}
              interval={0}
              allowDecimals={false}
              tickFormatter={(val) => Math.round(val).toString()}
              tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'Outfit' }}
              axisLine={{ stroke: '#52525b', strokeWidth: 0.25, strokeOpacity: 0.2 }}
              tickLine={false}
            />

            {/* 1. GROWTH AREA (Rendered first, goes to bottom) */}
            <Area 
              type="monotoneX" 
              dataKey="investedValue" 
              stroke={isFree ? "url(#strokeMetallicEmerald)" : "url(#strokeMetallicRose)"} 
              strokeWidth={1.5} 
              fillOpacity={1} 
              fill="url(#colorInvested)" 
              style={{ filter: isFree ? 'drop-shadow(0px 0px 8px rgba(16,185,129,0.5))' : 'drop-shadow(0px 0px 8px rgba(239,68,68,0.5))' }}
              isAnimationActive={false}
              dot={false}
              activeDot={false}
            />

            {/* 2. BASELINE AREA (Rendered on top, covers anything below its line) */}
            <Area 
              type="monotoneX" 
              dataKey="directCost" 
              stroke="#71717a" 
              strokeWidth={0.25} 
              fillOpacity={1} 
              fill="url(#colorDirect)" 
              style={{ filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,0.1))' }}
              isAnimationActive={false}
              dot={false}
              activeDot={false}
            />

            {/* 3. GRID ON TOP (For technical instrument look) */}
            <CartesianGrid 
              stroke="#52525b" 
              vertical={true} 
              horizontal={true} 
              strokeOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
