import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

const CURRENCY_SYMBOLS = ['€', '$', '£'];

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  suffix?: string;
  locale?: string;
}

export default function CircularSlider({ value, min, max, step, onChange, suffix, locale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Angle from top (0 = top, 90 = right, 180 = bottom, 270 = left)
    let angleFromTop = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
    if (angleFromTop < 0) angleFromTop += 360;
    
    // Shift so 0 is at bottom-left (225 degrees from top)
    let mappedAngle = angleFromTop - 225;
    if (mappedAngle < 0) mappedAngle += 360;
    
    // 270 degrees sweep
    if (mappedAngle > 270) {
      // Snap to nearest edge if in the dead zone at the bottom
      if (mappedAngle < 315) mappedAngle = 270;
      else mappedAngle = 0;
    }
    
    const percentage = mappedAngle / 270;
    let rawValue = min + percentage * (max - min);
    
    // Apply step rounding
    rawValue = Math.round(rawValue / step) * step;
    
    // Clamp between min and max
    rawValue = Math.max(min, Math.min(max, rawValue));
    
    onChange(rawValue);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    calculateValue(e.clientX, e.clientY);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      calculateValue(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const percentage = (value - min) / (max - min);
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage * 270 / 360) * circumference;
  const trackDashoffset = circumference - (270 / 360) * circumference;

  // Thumb position
  const angleDeg = 135 + percentage * 270;
  const angleRad = angleDeg * Math.PI / 180;
  const thumbX = 160 + radius * Math.cos(angleRad);
  const thumbY = 160 + radius * Math.sin(angleRad);

  // Determine decimal places based on step
  const isCurrency = suffix ? CURRENCY_SYMBOLS.includes(suffix) : false;
  const decimals = isCurrency ? 2 : (step % 1 !== 0 ? 1 : 0);
  
  // Format value based on suffix
  const displayValue = isCurrency 
    ? new Intl.NumberFormat(locale || 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : value.toFixed(decimals);

  return (
    <div 
      ref={containerRef}
      className="relative w-80 h-80 mx-auto touch-none select-none group cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg width="320" height="320" viewBox="0 0 320 320" className="absolute inset-0 drop-shadow-xl">
        {/* Track */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="#18181b" // zinc-900
          strokeWidth="24"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={trackDashoffset}
          transform="rotate(135 160 160)"
        />

        {/* Progress */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="#ffffff"
          strokeWidth="24"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(135 160 160)"
          className="transition-all duration-75 ease-out"
        />
        
        {/* Thumb */}
        <circle
          cx={thumbX}
          cy={thumbY}
          r="18"
          fill="#ffffff"
          className="transition-all duration-75 ease-out shadow-lg group-active:scale-90 origin-center drop-shadow-md"
          style={{ transformOrigin: `${thumbX}px ${thumbY}px` }}
        />
      </svg>
      
      {/* Center Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div 
          key={value}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight"
        >
          {displayValue}
          <span className="text-xl text-zinc-400 ml-1 font-sans font-medium">{suffix}</span>
        </motion.div>
      </div>
    </div>
  );
}
