import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { Info, ArrowRight, X as CloseIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { TranslationStrings } from '../utils/i18n';
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
  formatCurrency: (value: number) => string;
  t: TranslationStrings;
  onShowInfo: (type: InfoType) => void;
  pendingAmount: string | null;
  isPendingOverdue: boolean;
  onTriggerInvest: () => void;
  onDismissReminder: () => void;
}

export default function FinancialChart({
  graphData, viewType, onViewTypeChange, isFree, gradientColor, colorClass, accumulated, securedFV, totalForecast,
  totalDirectSavings, forecastYears, currentYear, formatCurrency, t, onShowInfo,
  pendingAmount, isPendingOverdue, onTriggerInvest, onDismissReminder
}: Props) {
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

  const rightSideValue = isFree 
    ? (hoveredData ? displayData.investedValue : (viewType === 'potential' ? totalForecast : securedFV))
    : displayData.investedValue;

  const leftValueString = formatCurrency(isFree ? (viewType === 'potential' ? totalDirectSavings : accumulated) : displayData.directCost);
  const rightValueString = formatCurrency(rightSideValue);

  const fontSizeClass = 'text-lg lg:text-2xl';

  return (
    <div className="w-full relative flex flex-col">
      <div className="flex flex-col w-full mb-0 lg:mb-2 relative z-10">
        
        {/* Row 1: View Switcher Toggle - Now at the top */}
        {isFree && (
          <div className="flex justify-center gap-16 lg:gap-24 mt-6 mb-6 lg:mt-10 lg:mb-12 transition-opacity duration-500">
            <button 
              onClick={() => onViewTypeChange('secured')}
              className={`text-xs lg:text-sm uppercase tracking-[0.4em] font-black transition-all relative py-2 ${
                viewType === 'secured' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {t.viewSecured}
              {viewType === 'secured' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full animate-in fade-in zoom-in duration-300" />
              )}
            </button>
            <button 
              onClick={() => onViewTypeChange('potential')}
              className={`text-xs lg:text-sm uppercase tracking-[0.4em] font-black transition-all relative py-2 ${
                viewType === 'potential' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {t.viewPotential.replace('{year}', (currentYear + forecastYears).toString())}
              {viewType === 'potential' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full animate-in fade-in zoom-in duration-300" />
              )}
            </button>
          </div>
        )}

        {/* Addiction title — shown above the figures when in hooked mode */}
        {!isFree && (
          <div className="text-center mb-3">
            <span className="text-xs lg:text-sm uppercase tracking-[0.4em] font-black text-red-400/80">
              {`${t.hookedFor} ${forecastYears} ${t.hookedYearsSuffix}`}
            </span>
          </div>
        )}

        {/* Row 2: Metric Details - Centered Headers + Arrow Flow */}
        <div className="flex items-center justify-between px-2 lg:px-4 mb-2 lg:mb-4">
          {/* Left Side: Saved/Cost */}
          <div className="flex flex-col items-center flex-1">
            <div 
              className="flex items-center gap-2 lg:gap-3 group cursor-pointer" 
              onClick={() => onShowInfo(isFree ? (viewType === 'potential' ? 'totalSaved' : 'savedNow') : 'directCost')}
            >
              <span className={`font-mono tabular-nums ${fontSizeClass} font-bold text-white tracking-tighter transition-all leading-none`}>
                {leftValueString}
              </span>
              <Info size={14} className="text-zinc-600 transition-colors group-hover:text-white" />
            </div>
          </div>

          {/* Center: Growth/Loss Arrow */}
          <div className={`shrink-0 px-1 lg:px-6 mt-0 ${colorClass} opacity-40`}>
            <ArrowRight size={18} className="lg:w-7 lg:h-7" />
          </div>

          {/* Right Side: Projected / Potential */}
          <div className="flex flex-col items-center flex-1">
            <div 
              className="flex items-center gap-2 lg:gap-3 group cursor-pointer" 
              onClick={() => onShowInfo(isFree ? (viewType === 'potential' ? 'potential' : 'valueInYear') : 'indirectLoss')}
            >
              <span className={`font-mono tabular-nums ${fontSizeClass} font-bold ${colorClass} tracking-tighter transition-all leading-none`}>
                {rightValueString}
              </span>
              <Info size={14} className={`${isFree ? 'text-zinc-600' : 'text-red-400/50'} transition-colors group-hover:text-current`} />
            </div>
          </div>
        </div>

        {/* Hovered DateIndicator */}
        <div className="text-center h-3 lg:h-4 mt-0 lg:mt-1">
          <span className={`text-[10px] uppercase tracking-[0.4em] font-black transition-all ${isFree ? 'text-emerald-400/30' : 'text-red-400/30'}`}>
            {hoveredData ? `${t.year} ${displayData.year}` : ''}
          </span>
        </div>
      </div>

      <div
        className="h-48 lg:h-[400px] w-full chart-container outline-none focus:outline-none select-none relative mb-4 -mt-4 lg:-mt-6 z-0"
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
            className="absolute bottom-14 left-6 lg:bottom-24 lg:left-12 z-20 pointer-events-auto flex items-start gap-2"
          >
            <button
              onClick={onTriggerInvest}
              className={`group flex flex-col items-start bg-black/40 backdrop-blur-md p-3 lg:p-4 rounded-2xl border border-white/5 hover:bg-black/60 transition-all duration-500 ${
                isPendingOverdue ? 'text-emerald-400 border-emerald-500/10' : 'text-zinc-400 border-white/5'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5 min-w-[max-content]">
                <div className={`w-1.5 h-1.5 rounded-full ${isPendingOverdue ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span className={`text-[10px] lg:text-[12px] uppercase tracking-[0.2em] font-black ${isPendingOverdue ? '' : 'opacity-80'}`}>
                  {t.pendingTransfer}: {pendingAmount}
                </span>
              </div>
              <span className="text-[8px] lg:text-[10px] uppercase tracking-[0.1em] font-black opacity-40 group-hover:opacity-100 transition-opacity border-b border-current/30 leading-none">
                {t.markAsInvested}
              </span>
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
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
              </linearGradient>
              {!isFree && (
                <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717a" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
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
                      <div className="text-[10px] lg:text-xs uppercase tracking-[0.4em] text-zinc-500 font-black mb-2">{t.year} {data.year}</div>
                      <div className={`font-serif tabular-nums text-2xl lg:text-3xl font-black ${isFree ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(data.investedValue)}
                      </div>
                      {!isFree && (
                        <div className="font-mono tabular-nums text-sm lg:text-base font-medium text-zinc-600 mt-2 opacity-60">
                          {formatCurrency(data.directCost)}
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
            <Area 
              type="monotone" 
              dataKey="investedValue" 
              stroke={gradientColor} 
              strokeWidth={1.2} 
              fillOpacity={1} 
              fill="url(#colorInvested)" 
              isAnimationActive={true}
              animationDuration={600}
              activeDot={false}
            />
            {!isFree && (
              <Area 
                type="monotone" 
                dataKey="directCost" 
                stroke="#71717a" 
                strokeWidth={1} 
                fillOpacity={1} 
                fill="url(#colorDirect)" 
                isAnimationActive={true}
                animationDuration={600}
                activeDot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
