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
    <div className="w-full py-1">
      <input
        type="range"
        min="1"
        max="75"
        value={forecastYears}
        onChange={(e) => onForecastChange(parseInt(e.target.value))}
        style={{ background: `linear-gradient(to right, ${gradientColor} ${((forecastYears - 1) / 74) * 100}%, #18181b ${((forecastYears - 1) / 74) * 100}%)` }}
        className="custom-slider w-full h-1 lg:h-1.5 rounded-full appearance-none cursor-pointer transition-all"
      />
      <div className="flex justify-center mt-2">
        <span className="text-[9px] lg:text-[10px] text-zinc-600 font-mono tracking-wider">
          {forecastYears} {t.years} → {new Date().getFullYear() + forecastYears}
        </span>
      </div>
    </div>
  );
}
