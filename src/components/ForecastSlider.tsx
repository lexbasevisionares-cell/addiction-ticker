import React from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface Props {
  forecastYears: number;
  onForecastChange: (years: number) => void;
  gradientColor: string;
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
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (val !== forecastYears) {
            if (Capacitor.isNativePlatform()) {
              Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
            }
            onForecastChange(val);
          }
        }}
        style={{
          background: `linear-gradient(to right, #71717a ${pct}%, #18181b ${pct}%)`,
          '--thumb-color': '#71717a'
        } as React.CSSProperties}
        className="custom-slider-thin w-full rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
}
