import { Check } from 'lucide-react';
import { TranslationStrings } from '../utils/i18n';

interface Props {
  statusType: 'now' | 'past' | 'hooked' | null;
  onStatusChange: (status: 'now' | 'past' | 'hooked') => void;
  t: TranslationStrings;
  borderless?: boolean;
}

export default function OnboardingStatusScreen({ statusType, onStatusChange, t }: Props) {
  const options = [
    { id: 'now', icon: '✨', label: t.statusNowTitle, desc: t.statusNowDesc },
    { id: 'past', icon: '🎉', label: t.statusPastTitle, desc: t.statusPastDesc },
    { id: 'hooked', icon: '📉', label: t.statusHookedTitle, desc: t.statusHookedDesc },
  ] as const;

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm mx-auto px-4">
      {options.map((opt) => {
        const selected = statusType === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onStatusChange(opt.id)}
            className={`
              w-full p-6 transition-all duration-500 rounded-[32px] text-center flex flex-col items-center gap-2 relative overflow-hidden
              ${selected 
                ? 'bg-white text-black scale-[1.03] shadow-[0_20px_50px_rgba(255,255,255,0.1)] z-10' 
                : 'bg-white/[0.05] text-white transition-opacity hover:bg-white/[0.1] z-0'}
            `}
          >
            {selected && (
              <div className="absolute top-4 right-4 text-black/20">
                <Check size={16} strokeWidth={4} />
              </div>
            )}
            
            <span className={`text-[10px] font-medium uppercase tracking-[0.6em] transition-colors ${selected ? 'text-black' : 'text-zinc-200'}`}>
              {opt.label}
            </span>
            <span className={`text-[10px] font-normal leading-relaxed max-w-[200px] transition-colors ${selected ? 'text-black/60' : 'text-zinc-500'}`}>
              {opt.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
