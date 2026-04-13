import { Info } from 'lucide-react';
import type { InfoType } from './InfoModal';
import { useI18n } from '../context/I18nContext';

interface Props {
  isFree: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  colorClass: string;
  startTime: number;
  onShowInfo?: (type: InfoType) => void;
}

export default function TimerDisplay({ isFree, days, hours, minutes, seconds, colorClass, onShowInfo }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center w-full relative">
      {/* Status text - Now clickable for info instead of having an icon */}
      <div 
        className={`flex items-center gap-2 mb-[clamp(10px,3dvh,30px)] ${onShowInfo ? 'cursor-pointer group' : ''}`}
        onClick={() => onShowInfo?.('hookedTimer')}
      >
        <div className={`w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 rounded-full ${isFree ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'} animate-pulse`} />
        <div className="text-[13px] lg:text-xl font-medium text-zinc-300 uppercase tracking-[0.4em] transition-colors group-hover:text-white">
          {isFree ? t.freeFor : t.hookedStatus}
        </div>
      </div>

      {/* Timer - Ultra-clean fixed-width layout for perfect symmetry */}
      <div className="flex items-baseline justify-between w-full max-w-[95vw] lg:max-w-4xl mx-auto font-sans px-2">
        {/* Days */}
        <div className="flex-1 flex flex-col items-center min-w-0">
          <span className="text-[clamp(2.25rem,10.5vw,8rem)] font-light text-white leading-none tabular-nums tracking-tighter">{days}</span>
          <span className="text-[clamp(8px,1.5dvh,12px)] text-zinc-400 uppercase font-medium tracking-[0.4em] mt-[clamp(8px,2dvh,20px)] whitespace-nowrap">{t.days}</span>
        </div>

        {/* Separator */}
        <span className="text-[clamp(1.5rem,6vw,5rem)] text-white font-light opacity-30 select-none pb-[0.8em] lg:pb-[0.6em]">:</span>

        {/* Hours */}
        <div className="flex-1 flex flex-col items-center min-w-0">
          <span className="text-[clamp(2.25rem,10.5vw,8rem)] font-light text-white leading-none tabular-nums tracking-tighter">{hours.toString().padStart(2, '0')}</span>
          <span className="text-[clamp(8px,1.5dvh,12px)] text-zinc-400 uppercase font-medium tracking-[0.4em] mt-[clamp(8px,2dvh,20px)] whitespace-nowrap">{t.hours}</span>
        </div>

        {/* Separator */}
        <span className="text-[clamp(1.5rem,6vw,5rem)] text-white font-light opacity-30 select-none pb-[0.8em] lg:pb-[0.6em]">:</span>

        {/* Minutes */}
        <div className="flex-1 flex flex-col items-center min-w-0">
          <span className="text-[clamp(2.25rem,10.5vw,8rem)] font-light text-white leading-none tabular-nums tracking-tighter">{minutes.toString().padStart(2, '0')}</span>
          <span className="text-[clamp(8px,1.5dvh,12px)] text-zinc-400 uppercase font-medium tracking-[0.4em] mt-[clamp(8px,2dvh,20px)] whitespace-nowrap">{t.mins}</span>
        </div>

        {/* Separator */}
        <span className="text-[clamp(1.5rem,6vw,5rem)] text-white font-light opacity-30 select-none pb-[0.8em] lg:pb-[0.6em]">:</span>

        {/* Seconds */}
        <div className="flex-1 flex flex-col items-center min-w-0">
          <span className={`text-[clamp(2.25rem,10.5vw,8rem)] font-light leading-none tabular-nums tracking-tighter ${colorClass}`}>{seconds.toString().padStart(2, '0')}</span>
          <span className={`text-[clamp(8px,1.5dvh,12px)] uppercase font-medium tracking-[0.4em] mt-[clamp(8px,2dvh,20px)] ${colorClass} opacity-100 drop-shadow-[0_0_8px_currentColor] whitespace-nowrap`}>{t.secs}</span>
        </div>
      </div>
    </div>
  );
}
