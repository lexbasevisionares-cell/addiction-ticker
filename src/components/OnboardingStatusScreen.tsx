import type { TranslationStrings } from '../utils/i18n';

interface Props {
  statusType: 'now' | 'past' | 'hooked' | null;
  onStatusChange: (type: 'now' | 'past' | 'hooked') => void;
  pastDate?: string;
  onPastDateChange?: (date: string) => void;
  t: TranslationStrings;
  borderless?: boolean;
}

export default function OnboardingStatusScreen({ statusType, onStatusChange, t, borderless }: Props) {
  const containerClass = borderless 
    ? "flex flex-col items-center justify-center w-full gap-4 my-auto py-4"
    : "flex flex-col items-center justify-center w-full gap-3 my-auto bg-zinc-900/40 border border-white/5 rounded-3xl p-4 backdrop-blur-md shadow-2xl";

  const btnClass = (active: boolean) => 
    `w-full max-w-sm py-4 px-6 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center space-y-1 relative
     ${active 
       ? 'bg-white text-black scale-[1.02] z-10' 
       : 'bg-transparent border border-white/10 text-white/50 hover:bg-white/[0.02] hover:text-white/80 z-0'}`;

  return (
    <div className={containerClass}>
      {/* Option: Now */}
      <button
        onClick={() => onStatusChange('now')}
        className={btnClass(statusType === 'now')}
      >
        <div className="text-center relative z-10">
          <div className={`font-sans text-lg lg:text-xl font-medium tracking-tight ${statusType === 'now' ? 'text-black' : 'text-white/90'}`}>{t.statusNowTitle}</div>
          <div className={`text-[10px] font-medium tracking-[0.2em] uppercase mt-1 px-4 ${statusType === 'now' ? 'text-black/60' : 'text-zinc-500'}`}>{t.statusNowDesc}</div>
        </div>
      </button>

      {/* Option: Past */}
      <button
        onClick={() => onStatusChange('past')}
        className={btnClass(statusType === 'past')}
      >
        <div className="text-center relative z-10">
          <div className={`font-sans text-lg lg:text-xl font-medium tracking-tight ${statusType === 'past' ? 'text-black' : 'text-white/90'}`}>{t.statusPastTitle}</div>
          <div className={`text-[10px] font-medium tracking-[0.2em] uppercase mt-1 px-4 ${statusType === 'past' ? 'text-black/60' : 'text-zinc-500'}`}>{t.statusPastDesc}</div>
        </div>
      </button>

      {/* Option: Hooked */}
      <button
        onClick={() => onStatusChange('hooked')}
        className={btnClass(statusType === 'hooked')}
      >
        <div className="text-center relative z-10">
          <div className={`font-sans text-lg lg:text-xl font-medium tracking-tight ${statusType === 'hooked' ? 'text-black' : 'text-white/90'}`}>{t.statusHookedTitle}</div>
          <div className={`text-[10px] font-medium tracking-[0.2em] uppercase mt-1 px-4 ${statusType === 'hooked' ? 'text-black/60' : 'text-zinc-500'}`}>{t.statusHookedDesc}</div>
        </div>
      </button>
    </div>
  );
}
