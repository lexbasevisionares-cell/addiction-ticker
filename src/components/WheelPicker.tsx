import React, { useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

const ITEM_HEIGHT = 62; 
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
  const samples = useRef<{ t: number; y: number }[]>([]);

  useEffect(() => {
    if (internalIndex.current !== selectedIndex) {
      animate(y, -selectedIndex * ITEM_HEIGHT, {
        type: 'spring',
        stiffness: 350, 
        damping: 35,
        mass: 0.5
      });
      lastY.current = -selectedIndex * ITEM_HEIGHT;
      internalIndex.current = selectedIndex;
    }
  }, [selectedIndex, y]);

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleTouchStart = (e: TouchEvent) => e.stopPropagation();
    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
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
        stiffness: 180,
        damping: 24,
        mass: 0.6,
        velocity: velocity,
        onComplete: () => { lastY.current = targetY; },
      });
    },
    [items.length, y]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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
      const minY = -(items.length - 1) * ITEM_HEIGHT;
      const maxY = 0;
      const clamped = newY > maxY ? maxY + Math.pow(newY - maxY, 0.55) : newY < minY ? minY - Math.pow(minY - newY, 0.55) : newY;
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
      const tracker = samples.current;
      let velocity = 0;
      if (tracker.length >= 2) {
        const first = tracker[0];
        const last = tracker[tracker.length - 1];
        const dt = (last.t - first.t) / 1000;
        if (dt > 0.01) velocity = (last.y - first.y) / dt;
      }
      const currentY = y.get();
      const rawIndex = -currentY / ITEM_HEIGHT;
      const momentumIndex = rawIndex - (velocity * 0.3) / ITEM_HEIGHT;
      snapToIndex(Math.round(momentumIndex), velocity);
    },
    [snapToIndex, y]
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden touch-none overscroll-none"
      style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT, width }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={(e) => { e.preventDefault(); snapToIndex(selectedIndex + (e.deltaY > 0 ? 1 : -1)); }}
    >
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none h-1/2 bg-gradient-to-bottom from-[#050505] to-transparent opacity-90" />
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none h-1/2 bg-gradient-to-top from-[#050505] to-transparent opacity-90" />
      
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
  decimals?: 0 | 1 | 2;
  suffix?: string;
  label?: string;
  locale?: string;
}

export default function DualWheelPicker({ value, min, max, onChange, decimals = 2, suffix, label, locale }: DualWheelProps) {
  const intVal = Math.floor(value);
  const fracVal = Math.round((value - intVal) * Math.pow(10, decimals));
  const integerItems = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const decimalItems = Array.from({ length: Math.pow(10, decimals) }, (_, i) => i);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto overflow-x-hidden">
      {label && (
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.8em] mb-10 text-center">
          {label}
        </span>
      )}

      <div className="relative flex items-center justify-center w-full">
        <div className="absolute inset-x-[-40px] top-[50%] translate-y-[-50%] z-0 h-[90px] pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-white/5" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
        </div>

        <div className="flex items-center z-10 relative w-full justify-center">
          <div className={`w-[100px] lg:w-[150px] flex ${decimals === 0 ? 'justify-center' : 'justify-end'}`}>
            <WheelColumn items={integerItems} selectedIndex={integerItems.indexOf(intVal)} onChange={(idx) => onChange(integerItems[idx] + fracVal / Math.pow(10, decimals))} formatItem={(v) => v.toString()} width="100%" />
          </div>
          {decimals > 0 && (
            <>
              <div className="flex items-center justify-center translate-y-[-4px] h-[90px] w-6">
                <span className="text-5xl lg:text-6xl font-sans tabular-nums text-white font-light">
                  {locale === 'fi-FI' ? ',' : '.'}
                </span>
              </div>
              <div className="w-[100px] lg:w-[150px] flex justify-start">
                <WheelColumn items={decimalItems} selectedIndex={decimalItems.indexOf(fracVal)} onChange={(idx) => onChange(intVal + decimalItems[idx] / Math.pow(10, decimals))} formatItem={(v) => v.toString().padStart(decimals, '0')} width="100%" />
              </div>
            </>
          )}
          {suffix && (
            <div className="absolute right-2 lg:right-6 h-[90px] flex items-center">
              <span className="text-2xl lg:text-3xl font-medium text-white uppercase tracking-[0.4em] font-sans">
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
  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto overflow-x-hidden">
      {label && <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.8em] mb-10 text-center">{label}</span>}
      <div className="relative flex items-center justify-center w-full overflow-hidden">
        <div className="absolute inset-x-[-40px] top-[50%] translate-y-[-50%] z-0 h-[90px] pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-white/5" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
        </div>
        <div className="flex items-center z-10 px-4 relative w-full justify-center">
          <div className="flex-1 max-w-[400px]">
            <WheelColumn items={options} selectedIndex={Math.max(0, selectedIndex)} onChange={(idx) => onChange(options[idx].value)} formatItem={(o) => o.label} width="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WheelItem({ index, label, y, onTap }: { index: number, label: string, y: any, onTap: () => void, key?: any }) {
  const rawOffset = useTransform(y, (yVal: number) => index - (-yVal / ITEM_HEIGHT));
  const rotateX = useTransform(rawOffset, (offset: number) => -offset * 20);
  const opacity = useTransform(rawOffset, [-2, -1.2, 0, 1.2, 2], [0, 0.2, 1, 0.2, 0]);
  const scale = useTransform(rawOffset, [-1.5, 0, 1.5], [0.8, 1.25, 0.8]);
  const color = useTransform(rawOffset, [-0.6, 0, 0.6], ['#27272a', '#ffffff', '#27272a']);

  return (
    <motion.div
      onClick={onTap}
      style={{ height: ITEM_HEIGHT, rotateX, opacity, scale, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={`flex items-center justify-center w-full pointer-events-auto font-sans tabular-nums`}
    >
      <motion.span style={{ color }} className="font-light tracking-tighter text-4xl lg:text-6xl">
        {label}
      </motion.span>
    </motion.div>
  );
}
