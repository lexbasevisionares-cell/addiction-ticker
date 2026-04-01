import type { TranslationStrings, TimeFormat, Language } from '../utils/i18n';

interface Props {
  isFree: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  colorClass: string;
  t: TranslationStrings;
  startTime: number;
  timeFormat: TimeFormat;
  language: Language;
}

export default function TimerDisplay({ isFree, days, hours, minutes, seconds, colorClass, t, startTime, timeFormat, language }: Props) {
  const locale = language === 'fi' ? 'fi-FI' : 'en-US';
  const formattedStart = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  }).format(new Date(startTime));

  return (
    <div className="flex flex-col items-center w-full relative">
      <div className="text-[12px] lg:text-base font-black text-white uppercase tracking-[0.5em] mb-8 lg:mb-12">
        {t.tickerHeader}
      </div>

      {isFree && (
        <div className="flex items-center gap-2 mb-3 lg:mb-6">
          <div className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs lg:text-lg font-bold text-zinc-300 uppercase tracking-[0.2em]">
            {t.freeFor}
          </div>
        </div>
      )}

      {isFree && (
        <div className="flex items-baseline justify-center gap-1.5 md:gap-3 lg:gap-4 font-serif tracking-tighter">
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-6xl lg:text-9xl font-black text-white leading-none tabular-nums">{days}</span>
            <span className="text-[10px] md:text-sm lg:text-base text-zinc-500 uppercase font-extrabold tracking-[0.3em] mt-2 lg:mt-4 opacity-60">{t.days}</span>
          </div>
          <span className="text-2xl lg:text-7xl text-zinc-800 font-light -mt-2 lg:-mt-8">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-6xl lg:text-9xl font-black text-white leading-none tabular-nums">{hours.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-sm lg:text-base text-zinc-500 uppercase font-extrabold tracking-[0.3em] mt-2 lg:mt-4 opacity-60">{t.hours}</span>
          </div>
          <span className="text-2xl lg:text-7xl text-zinc-800 font-light -mt-2 lg:-mt-8">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-6xl lg:text-9xl font-black text-white leading-none tabular-nums">{minutes.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-sm lg:text-base text-zinc-500 uppercase font-extrabold tracking-[0.3em] mt-2 lg:mt-4 opacity-60">{t.mins}</span>
          </div>
          <span className="text-2xl lg:text-7xl text-zinc-800 font-light -mt-2 lg:-mt-8">:</span>
          <div className="flex flex-col items-center">
            <span className={`text-4xl md:text-6xl lg:text-9xl font-black leading-none tabular-nums ${colorClass}`}>{seconds.toString().padStart(2, '0')}</span>
            <span className={`text-[10px] md:text-sm lg:text-base uppercase font-extrabold tracking-[0.3em] mt-2 lg:mt-4 ${colorClass} opacity-70`}>{t.secs}</span>
          </div>
        </div>
      )}
    </div>
  );
}
