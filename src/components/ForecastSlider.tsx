import { Info } from 'lucide-react';
import type { TranslationStrings } from '../utils/i18n';
import type { InfoType } from './InfoModal';

interface Props {
  forecastYears: number;
  onForecastChange: (years: number) => void;
  gradientColor: string;
  isFree: boolean;
  colorClass: string;
  formatCurrency: (value: number) => string;
  t: TranslationStrings;
  onShowInfo: (type: InfoType) => void;
}

export default function ForecastSlider({
  forecastYears, onForecastChange, gradientColor, isFree, colorClass,
  formatCurrency, t, onShowInfo
}: Props) {
  return (
    <div className="w-full mt-2 lg:mt-8">
      <div className="flex justify-between items-end mb-4 lg:mb-8 px-2 lg:px-4">
        <span className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] font-bold opacity-60">
          {t.timeline}
        </span>
        <span className="font-mono tabular-nums text-xl lg:text-3xl text-white/90 font-bold tracking-tight">
          {forecastYears} {t.years}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="75"
        value={forecastYears}
        onChange={(e) => onForecastChange(parseInt(e.target.value))}
        style={{ background: `linear-gradient(to right, ${gradientColor} ${((forecastYears - 1) / 74) * 100}%, #18181b ${((forecastYears - 1) / 74) * 100}%)` }}
        className="custom-slider w-full h-1 lg:h-1.5 rounded-full appearance-none cursor-pointer mb-8 lg:mb-16 transition-all"
      />
      
    </div>
  );
}
