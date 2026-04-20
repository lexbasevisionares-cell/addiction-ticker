import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Share2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import ShareCard, { ShareCardVariant } from './ShareCard';
import { useI18n } from '../context/I18nContext';
import { calculateAccumulated, calculateSecuredFutureValue, calculateTotalForecast } from '../utils/finance';
import { UserSettings } from './Onboarding';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  isFree: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  accumulated: number;
  elapsedDays: number;
  currentYear: number;
}

const VARIANTS: ShareCardVariant[] = ['saved', 'investmentValue', 'cashSavings', 'totalValue'];
const SWIPE_THRESHOLD = 50;

export default function ShareCardModal({
  isOpen,
  onClose,
  settings,
  isFree,
  days,
  hours,
  minutes,
  seconds,
  accumulated,
  elapsedDays,
  currentYear,
}: ShareCardModalProps) {
  const { t, formatCurrencyString } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [forecastYears, setForecastYears] = useState(25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [direction, setDirection] = useState(0);
  const maxYears = settings.maxForecastYears ?? 75;

  const captureRef = useRef<HTMLDivElement>(null);

  const computedValues = useMemo(() => {
    const targetDate = new Date(currentYear + forecastYears, 0, 1).getTime();
    const now = Date.now();
    const yearsToTarget = Math.max(0, (targetDate - now) / (1000 * 60 * 60 * 24 * 365.25));
    const totalYears = elapsedDays / 365.25 + yearsToTarget;

    const currentPortfolioValue = calculateTotalForecast(
      settings.dailyCost, settings.annualPriceIncrease, elapsedDays / 365.25, settings.expectedReturn
    );
    const securedFV = calculateSecuredFutureValue(currentPortfolioValue, yearsToTarget, settings.expectedReturn);
    const totalDirectSavings = calculateAccumulated(
      settings.dailyCost, settings.annualPriceIncrease, totalYears * 365.25
    );
    const totalForecast = calculateTotalForecast(
      settings.dailyCost, settings.annualPriceIncrease, totalYears, settings.expectedReturn
    );

    return { securedFV, totalDirectSavings, totalForecast };
  }, [forecastYears, currentYear, elapsedDays, settings]);

  const currentVariant = VARIANTS[activeIndex];

  const handleSwipe = useCallback((_: any, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && activeIndex < VARIANTS.length - 1) {
      setDirection(1);
      setActiveIndex(prev => prev + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD && activeIndex > 0) {
      setDirection(-1);
      setActiveIndex(prev => prev - 1);
    }
  }, [activeIndex]);

  const goToCard = (dir: -1 | 1) => {
    const newIndex = activeIndex + dir;
    if (newIndex >= 0 && newIndex < VARIANTS.length) {
      setDirection(dir);
      setActiveIndex(newIndex);
    }
  };

  const handleShare = async () => {
    if (!captureRef.current || isGenerating) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
      });

      if (!blob) {
        setIsGenerating(false);
        return;
      }

      const file = new File([blob], 'addiction-ticker.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'addiction-ticker.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.log('Share failed:', err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const canShareWithFile = typeof navigator !== 'undefined' && navigator.share && navigator.canShare;
  const T = t as any;

  const cardProps = {
    variant: currentVariant,
    isFree,
    days,
    hours,
    minutes,
    seconds,
    accumulated,
    securedFV: computedValues.securedFV,
    totalDirectSavings: computedValues.totalDirectSavings,
    totalForecast: computedValues.totalForecast,
    forecastYears,
    currentYear,
    formatCurrency: formatCurrencyString,
  };

  // Get variant title for dot labels
  const getVariantTitle = (index: number) => {
    const titles = isFree
      ? [T.shareCardTitle1, T.shareCardTitle2, T.shareCardTitle3, T.shareCardTitle4]
      : [T.shareCardTitleHooked1, T.shareCardTitleHooked2, T.shareCardTitleHooked3, T.shareCardTitleHooked4];
    return titles[index] || '';
  };

  // Preview dimensions: 480×600 card scaled to fit ~300px wide
  const previewScale = 300 / 480;
  const previewWidth = 300;
  const previewHeight = 600 * previewScale; // 375

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-black backdrop-blur-md flex flex-col items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Capture card: in viewport but invisible */}
      <div style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        <ShareCard ref={captureRef} {...cardProps} />
      </div>

      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 pt-[clamp(12px,2dvh,24px)] pb-2">
        <div className="w-10" />
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.5em]">
          {T.shareCardPreview || 'Esikatselu'}
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Card area with swipe */}
      <div className="flex-1 flex flex-col items-center justify-center w-full overflow-hidden px-4">
        <div className="relative flex items-center justify-center w-full" style={{ maxWidth: previewWidth + 80 }}>
          {/* Left arrow */}
          <button
            onClick={() => goToCard(-1)}
            className={`absolute -left-1 z-10 p-2 rounded-full transition-all ${
              activeIndex > 0 ? 'text-white/50 hover:text-white' : 'text-white/10 pointer-events-none'
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Animated card container */}
          <div className="relative overflow-hidden rounded-2xl" style={{ width: previewWidth, height: previewHeight }}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                initial={{ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: direction > 0 ? -300 : 300, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleSwipe}
              >
                {/* Scale 480×600 down to 300×375 */}
                <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: 480, height: 600 }}>
                  <ShareCard {...cardProps} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right arrow */}
          <button
            onClick={() => goToCard(1)}
            className={`absolute -right-1 z-10 p-2 rounded-full transition-all ${
              activeIndex < VARIANTS.length - 1 ? 'text-white/50 hover:text-white' : 'text-white/10 pointer-events-none'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Variant label + dot indicators */}
        <div className="flex flex-col items-center mt-4 gap-2">
          <div className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${isFree ? 'text-emerald-400/60' : 'text-rose-400/60'}`}>
            {getVariantTitle(activeIndex)}
          </div>
          <div className="flex items-center gap-2">
            {VARIANTS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? (isFree ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]')
                    : 'bg-white/15 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-sm px-8 pb-[clamp(16px,4dvh,40px)] flex flex-col items-center gap-5">
        {/* Forecast slider — now shown for all cards to prevent layout shifts */}
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.3em]">
                {T.shareCardTimeWindow || 'Aikaikkuna'}
              </span>
              <span className={`text-[11px] font-semibold tabular-nums ${isFree ? 'text-emerald-400' : 'text-rose-400'}`}>
                {forecastYears} {T.shareCardYearsLabel || 'v'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={maxYears}
              value={forecastYears}
              onChange={(e) => setForecastYears(Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${isFree ? '#10b981' : '#f43f5e'} ${(forecastYears / maxYears) * 100}%, rgba(255,255,255,0.1) ${(forecastYears / maxYears) * 100}%)`,
              }}
            />
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-full font-semibold text-[11px] uppercase tracking-[0.4em] transition-all active:scale-[0.97] ${
            isGenerating
              ? 'bg-white/5 text-white/20'
              : 'bg-white text-black hover:scale-[1.02] shadow-[0_10px_40px_rgba(0,0,0,0.3)]'
          }`}
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          ) : canShareWithFile ? (
            <>
              <Share2 size={14} strokeWidth={2.5} />
              <span>{T.shareCardShareBtn || 'Jaa'}</span>
            </>
          ) : (
            <>
              <Download size={14} strokeWidth={2.5} />
              <span>{T.shareCardDownloadBtn || 'Tallenna kuva'}</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
