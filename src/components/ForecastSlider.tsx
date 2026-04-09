import React from 'react';
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
  maxYears: number;
}

export default function ForecastSlider({ forecastYears, onForecastChange, gradientColor, maxYears }: Props) {
  const pct = ((forecastYears - 1) / (maxYears - 1)) * 100;

  return (
    <div className="w-full">
      <input
        type="range"
        min="1"
        max={maxYears}
        value={forecastYears}
        onChange={(e) => onForecastChange(parseInt(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${gradientColor}80 ${pct}%, #252525 ${pct}%)`,
          '--thumb-color': gradientColor
        } as React.CSSProperties}
        className="custom-slider-thin w-full rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
}
