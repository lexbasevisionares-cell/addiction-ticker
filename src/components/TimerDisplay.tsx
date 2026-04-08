import { Info } from 'lucide-react';
import { t } from '../utils/i18n';
import type { InfoType } from './InfoModal';

interface Props {
  isFree: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  colorClass: string;
  t: typeof t;
  startTime: number;
  onShowInfo?: (type: InfoType) => void;
}

export default function TimerDisplay({ isFree, days, hours, minutes, seconds, colorClass, t, onShowInfo }: Props) {
  return (
    <div className="flex flex-col items-center w-full relative">
      {/* Status text - Now clickable for info instead of having an icon */}
      <div 
        className={`flex items-center gap-2 mb-5 lg:mb-6 ${onShowInfo ? 'cursor-pointer group' : ''}`}
        onClick={() => onShowInfo?.('hookedTimer')}
      >
        <div className={`w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 rounded-full ${isFree ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'} animate-pulse`} />
        <div className="text-[13px] lg:text-xl font-medium text-zinc-400 uppercase tracking-[0.4em] transition-colors group-hover:text-white">
          {isFree ? t.freeFor : t.hookedStatus}
        </div>
      </div>

      {/* Timer - Ultra-clean Sans-Serif design */}
      <div className="flex items-baseline justify-center gap-1 md:gap-3 lg:gap-4 font-sans tracking-tighter">
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl lg:text-9xl font-light text-white leading-none tabular-nums tracking-tighter">{days}</span>
          <span className="text-[8px] md:text-sm lg:text-base text-zinc-600 uppercase font-medium tracking-[0.5em] mt-3 lg:mt-5">{t.days}</span>
        </div>
        <span className="text-xl lg:text-7xl text-white font-light -mt-2 lg:-mt-8">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl lg:text-9xl font-light text-white leading-none tabular-nums tracking-tighter">{hours.toString().padStart(2, '0')}</span>
          <span className="text-[8px] md:text-sm lg:text-base text-zinc-600 uppercase font-medium tracking-[0.5em] mt-3 lg:mt-5">{t.hours}</span>
        </div>
        <span className="text-xl lg:text-7xl text-white font-light -mt-2 lg:-mt-8">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl lg:text-9xl font-light text-white leading-none tabular-nums tracking-tighter">{minutes.toString().padStart(2, '0')}</span>
          <span className="text-[8px] md:text-sm lg:text-base text-zinc-600 uppercase font-medium tracking-[0.5em] mt-3 lg:mt-5">{t.mins}</span>
        </div>
        <span className="text-xl lg:text-7xl text-white font-light -mt-2 lg:-mt-8">:</span>
        <div className="flex flex-col items-center">
          <span className={`text-4xl md:text-6xl lg:text-9xl font-light leading-none tabular-nums tracking-tighter ${colorClass}`}>{seconds.toString().padStart(2, '0')}</span>
          <span className={`text-[8px] md:text-sm lg:text-base uppercase font-medium tracking-[0.5em] mt-3 lg:mt-5 ${colorClass} opacity-80`}>{t.secs}</span>
        </div>
      </div>
    </div>
  );
}
