import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

const ITEM_HEIGHT = 44; // Tightened to reduce vertical footprint
const VISIBLE_ITEMS = 5; 
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2); // 2

// ─────────────────────────────────────────────────────────────────────────────
// WHEEL COLUMN COMPONENT (APPLE-FEEL PHYSICS)
// ─────────────────────────────────────────────────────────────────────────────

interface WheelColumnProps {
  items: any[];
  selectedIndex: number;
  onChange: (index: number) => void;
  formatItem: (item: any) => string;
  width?: number | string;
}

export function WheelColumn({ items, selectedIndex, onChange, formatItem, width = '100%' }: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(-selectedIndex * ITEM_HEIGHT);
  const dragStartY = useRef(0);
  const lastY = useRef(y.get());
  const internalIndex = useRef(selectedIndex);
  
  // High-precision velocity tracking (Apple-feel)
  const samples = useRef<{ t: number; y: number }[]>([]);

  useEffect(() => {
    // Fast, crisp external sync
    if (internalIndex.current !== selectedIndex) {
      animate(y, -selectedIndex * ITEM_HEIGHT, {
        type: 'spring',
        stiffness: 320, 
        damping: 30,
        mass: 0.5
      });
      lastY.current = -selectedIndex * ITEM_HEIGHT;
      internalIndex.current = selectedIndex;
    }
  }, [selectedIndex, y]);

  // Continuous internal sync for native-like feel
  useEffect(() => {
    return y.on('change', (latest) => {
      const newIndex = Math.round(-latest / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, newIndex));
      if (clamped !== internalIndex.current) {
        internalIndex.current = clamped;
        onChange(clamped);
      }
    });
  }, [y, items.length, onChange]);

  // Use raw event listeners for non-passive prevention (critical for iOS stability)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Aggressively stop propagation to prevent parent containers from reacting
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Strictly prevent browser scrolling while using the wheel
      if (e.cancelable) {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const snapToIndex = useCallback(
    (idx: number, velocity = 0) => {
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const targetY = -clamped * ITEM_HEIGHT;

      animate(y, targetY, {
        type: 'spring',
        stiffness: 180,  // Softer spring = more natural glide
        damping: 22,     // Less damping = freer movement
        mass: 0.6,       // Lighter = snappier response
        velocity: velocity,
        onComplete: () => {
          lastY.current = targetY;
        },
      });
    },
    [items.length, onChange, selectedIndex, y]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Prevent horizontal scroll and lock touch to the component
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragStartY.current = e.clientY;
      lastY.current = y.get();
      samples.current = [{ t: Date.now(), y: e.clientY }];
    },
    [y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
      
      const delta = e.clientY - dragStartY.current;
      const newY = lastY.current + delta;

      // Natural rubber-band
      const minY = -(items.length - 1) * ITEM_HEIGHT;
      const maxY = 0;
      const clamped =
        newY > maxY
          ? maxY + Math.pow(newY - maxY, 0.55)
          : newY < minY
          ? minY - Math.pow(minY - newY, 0.55)
          : newY;

      y.set(clamped);
      
      samples.current.push({ t: Date.now(), y: e.clientY });
      if (samples.current.length > 5) samples.current.shift();
    },
    [items.length, y]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

      // Better velocity calculation using last few samples
      const tracker = samples.current;
      let velocity = 0;
      if (tracker.length >= 2) {
        const first = tracker[0];
        const last = tracker[tracker.length - 1];
        const dt = (last.t - first.t) / 1000;
        if (dt > 0.01) {
          velocity = (last.y - first.y) / dt;
        }
      }

      const currentY = y.get();
      const rawIndex = -currentY / ITEM_HEIGHT;
      
      const MOMENTUM_MULTIPLIER = 0.30;  // More carry on flick
      const momentumIndex = rawIndex - (velocity * MOMENTUM_MULTIPLIER) / ITEM_HEIGHT;
      
      snapToIndex(Math.round(momentumIndex), velocity);
    },
    [snapToIndex, y]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      snapToIndex(selectedIndex + delta);
    },
    [selectedIndex, snapToIndex]
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-none overscroll-none"
      style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT, width }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Seamless Floating Fades */}
      <div 
        className="absolute inset-x-0 top-0 z-10 pointer-events-none" 
        style={{ 
          height: CENTER_INDEX * ITEM_HEIGHT, 
          background: 'linear-gradient(to bottom, #050505 10%, rgba(5,5,5,0.2) 75%, transparent 100%)' 
        }} 
      />
      <div 
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" 
        style={{ 
          height: CENTER_INDEX * ITEM_HEIGHT, 
          background: 'linear-gradient(to top, #050505 10%, rgba(5,5,5,0.2) 75%, transparent 100%)' 
        }} 
      />
      
      <motion.div style={{ y, paddingTop: CENTER_INDEX * ITEM_HEIGHT }} className="absolute inset-x-0 top-0 cursor-grab active:cursor-grabbing">
        {items.map((item, i) => (
          <WheelItem key={i} index={i} label={formatItem(item)} y={y} onTap={() => snapToIndex(i)} />
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DUAL WHEEL PICKER (BORDERLESS & RESPONSIVE)
// ─────────────────────────────────────────────────────────────────────────────

interface DualWheelProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  decimals?: 1 | 2;
  suffix?: string;
  label?: string;
  locale?: string;
}

export default function DualWheelPicker({ value, min, max, onChange, decimals = 2, suffix, label, locale }: DualWheelProps) {
  const intVal = Math.floor(value);
  const fracVal = Math.round((value - intVal) * Math.pow(10, decimals));

  const integerItems = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const decimalItems = Array.from({ length: Math.pow(10, decimals) }, (_, i) => i);

  const handleIntChange = (idx: number) => {
    const newInt = integerItems[idx];
    const newValue = newInt + fracVal / Math.pow(10, decimals);
    onChange(newValue);
  };

  const handleFracChange = (idx: number) => {
    const newFrac = decimalItems[idx];
    const newValue = intVal + newFrac / Math.pow(10, decimals);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto overflow-x-hidden">
      {label && (
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em] mb-12 text-center opacity-60">
          {label}
        </span>
      )}

      <div className="relative flex items-center justify-center w-full overflow-hidden">
        
        {/* Infinite Selection Anchor (Minimalist Horizontal Cues) */}
        <div className="absolute inset-x-[-20px] top-[50%] translate-y-[-50%] z-0 h-[72px] pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="flex items-center z-10 px-2 lg:px-4 relative w-full justify-center">
          <div className="w-[80px] lg:w-[100px] flex justify-end">
            <WheelColumn
              items={integerItems}
              selectedIndex={integerItems.indexOf(intVal)}
              onChange={handleIntChange}
              formatItem={(v) => v.toString()}
              width="100%"
            />
          </div>

          <div className="flex items-center justify-center translate-y-[-4px] h-[72px] w-[20px] lg:w-[30px]">
            <span className="text-3xl lg:text-4xl font-serif text-white/30 font-light select-none">
              {new Intl.NumberFormat(locale || 'en-US').format(1.1).replace(/\d/g, '').trim() || (locale === 'fi' ? ',' : '.')}
            </span>
          </div>

          <div className="w-[80px] lg:w-[100px] flex justify-start">
            <WheelColumn
              items={decimalItems}
              selectedIndex={decimalItems.indexOf(fracVal)}
              onChange={handleFracChange}
              formatItem={(v) => v.toString().padStart(decimals, '0')}
              width="100%"
            />
          </div>

          {suffix && (
            <div className="absolute right-4 lg:right-12 h-[72px] flex items-center shrink-0">
              <span className="text-2xl lg:text-3xl font-light italic text-zinc-600 font-serif tracking-[0.1em] lg:tracking-[0.15em] opacity-80">
                {suffix}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SingleTextWheelPicker({ value, options, onChange, label }: { value: any, options: {value: any, label: string}[], onChange: (val: any) => void, label?: string }) {
  const selectedIndex = options.findIndex(o => o.value === value);
  const handleIndexChange = (idx: number) => {
    onChange(options[idx].value);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto overflow-x-hidden">
      {label && (
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em] mb-12 text-center opacity-60">
          {label}
        </span>
      )}

      <div className="relative flex items-center justify-center w-full overflow-hidden">
        {/* Infinite Selection Anchor (Minimalist Horizontal Cues) */}
        <div className="absolute inset-x-[-20px] top-[50%] translate-y-[-50%] z-0 h-[72px] pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="flex items-center z-10 px-2 lg:px-8 relative w-full justify-center">
          <div className="flex-1 max-w-[280px]">
            <WheelColumn
              items={options}
              selectedIndex={Math.max(0, selectedIndex)}
              onChange={handleIndexChange}
              formatItem={(o) => o.label}
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ITEM COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ItemProps {
  key?: React.Key;
  index: number;
  label: string;
  y: any;
  onTap: () => void;
}

function WheelItem({ index, label, y, onTap }: ItemProps) {
  const rawOffset = useTransform(y, (yVal: number) => index - (-yVal / ITEM_HEIGHT));

  const CYLINDER_DEGREES_PER_ITEM = 22; // More pronounced barrel curve
  const rotateX = useTransform(rawOffset, (offset: number) => -offset * CYLINDER_DEGREES_PER_ITEM);
  
  // High-fidelity opacity and scale (sharper fade so only the selected and nearest ones are visible)
  const opacity = useTransform(rawOffset, [-2.5, -1.8, -0.8, 0, 0.8, 1.8, 2.5], [0, 0.05, 0.6, 1, 0.6, 0.05, 0]);
  const scale = useTransform(rawOffset, [-1.5, -0.8, 0, 0.8, 1.5], [0.85, 0.95, 1.15, 0.95, 0.85]);
  
  // Z-axis movement for real depth feel
  const translateZ = useTransform(rawOffset, (offset: number) => {
    const r = 240; 
    const angle = (Math.abs(offset) * CYLINDER_DEGREES_PER_ITEM * Math.PI) / 180;
    return -r * (1 - Math.cos(angle)) - 20; // Pushes distant items back
  });

  const translateY = useTransform(rawOffset, (offset: number) => {
    const r = 240; 
    const angle = (offset * CYLINDER_DEGREES_PER_ITEM * Math.PI) / 180;
    return r * Math.sin(angle) - offset * ITEM_HEIGHT;
  });

  const color = useTransform(rawOffset, [-0.8, 0, 0.8], ['#52525b', '#ffffff', '#52525b']);

  return (
    <motion.div
      onClick={onTap}
      style={{ 
        height: ITEM_HEIGHT, 
        rotateX, 
        opacity, 
        scale, 
        z: translateZ,
        y: translateY, 
        transformStyle: 'preserve-3d', 
        perspective: 1500 
      }}
      className="flex items-center justify-center w-full font-serif text-white/95 pointer-events-auto"
    >
      <motion.span 
        style={{ color }} 
        className="font-medium tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
