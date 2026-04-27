import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Share2, ChevronLeft, ChevronRight, Download, CheckSquare, Square } from 'lucide-react';
import html2canvas from 'html2canvas';
import ShareCard, { ShareCardVariant } from './ShareCard';
import ForecastSlider from './ForecastSlider';
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
  const [showMath, setShowMath] = useState(false);
  const maxYears = settings.maxForecastYears ?? 75;

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  useEffect(() => {
    const handleResize = () => setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    showMath,
    dailyCost: settings.dailyCost,
    annualPriceIncrease: settings.annualPriceIncrease,
    expectedReturn: settings.expectedReturn,
  };

  // Get variant title for dot labels
  const getVariantTitle = (index: number) => {
    const titles = isFree
      ? [T.shareCardTitle1, T.shareCardTitle2, T.shareCardTitle3, T.shareCardTitle4]
      : [T.shareCardTitleHooked1, T.shareCardTitleHooked2, T.shareCardTitleHooked3, T.shareCardTitleHooked4];
    return titles[index] || '';
  };

  // Preview dimensions: dynamic scale based on both width and height
  // Max width is 82% of screen width, bounded by 480px.
  const maxWidth = Math.min(windowSize.width * 0.82, 480);
  const scaleX = maxWidth / 480;
  
  // Max height is ~52% of screen height to leave room for UI. Bounded by 600px.
  const maxHeight = Math.min(windowSize.height * 0.52, 600);
  const scaleY = maxHeight / 600;
  
  // Use the smaller scale to ensure it fits both constraints
  const previewScale = Math.min(scaleX, scaleY, 1);
  const previewWidth = 480 * previewScale;
  const previewHeight = 600 * previewScale;

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
      <div className="w-full flex items-center justify-between px-6 pt-[calc(24px+env(safe-area-inset-top,44px))] pb-4 shrink-0">
        <div className="w-10" />
        <div className="text-[12px] md:text-[13px] font-semibold text-white/90 uppercase tracking-[0.6em] pointer-events-none">
          {T.shareCardPreview || 'Esikatselu'}
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Carousel Wrapper */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 relative z-0 py-2">
        {/* Title above card */}
        <div className="flex-none w-full flex justify-center pb-4 z-20">
          <span className={`text-[11px] font-bold tracking-[0.4em] uppercase ${isFree ? 'text-emerald-400' : 'text-rose-500'}`}>
            {getVariantTitle(activeIndex)}
          </span>
        </div>

        {/* Card Container */}
        <div className="flex-none relative flex items-center justify-center" style={{ width: previewWidth, height: previewHeight }}>
          {/* Left arrow */}
          <button
            onClick={() => goToCard(-1)}
            className={`absolute -left-[clamp(24px,8vw,40px)] z-10 p-3 rounded-full transition-all ${
              activeIndex > 0 ? 'text-white/50 hover:text-white' : 'text-white/10 pointer-events-none'
            }`}
          >
            <ChevronLeft size={36} strokeWidth={1.5} />
          </button>

          {/* Animated card container */}
          <div className="relative overflow-hidden rounded-2xl" style={{ width: previewWidth, height: previewHeight }}>
            <AnimatePresence mode="sync" initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
                transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleSwipe}
                style={{ position: 'absolute', width: '100%' }}
              >
                {/* Scale 480×600 down to previewWidth×previewHeight */}
                <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: 480, height: 600 }}>
                  <ShareCard {...cardProps} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right arrow */}
          <button
            onClick={() => goToCard(1)}
            className={`absolute -right-[clamp(24px,8vw,40px)] z-10 p-3 rounded-full transition-all ${
              activeIndex < VARIANTS.length - 1 ? 'text-white/50 hover:text-white' : 'text-white/10 pointer-events-none'
            }`}
          >
            <ChevronRight size={36} strokeWidth={1.5} />
          </button>
        </div>

        {/* Pagination dots below card */}
        <div className="flex-none w-full flex justify-center gap-3 pt-6 pb-2 z-20">
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

      {/* Bottom controls */}
      <div className="w-full max-w-sm px-8 pb-[clamp(16px,4dvh,40px)] flex flex-col items-center gap-[clamp(20px,3dvh,32px)] min-h-0 shrink-0">
        {/* Forecast slider — using the main app's premium slider */}
        <div className="w-full">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-zinc-400">
                {T.shareCardTimeWindow || 'Aikaikkuna'}
              </span>
              <span className={`text-[10px] uppercase tracking-[0.1em] font-medium ${isFree ? 'text-emerald-400' : 'text-rose-500'}`}>
                {forecastYears} {T.shareCardYearsLabel || 'v'}
              </span>
            </div>
            <div className="w-full">
              <ForecastSlider
                forecastYears={forecastYears}
                maxYears={maxYears}
                onForecastChange={setForecastYears}
                gradientColor={isFree ? '#10b981' : '#f43f5e'}
              />
            </div>
        </div>

        {/* Math Toggle */}
        <button
          onClick={() => setShowMath(!showMath)}
          className="flex items-center gap-2 group transition-opacity opacity-70 hover:opacity-100"
        >
          {showMath ? (
            <CheckSquare size={14} className={isFree ? 'text-emerald-400' : 'text-rose-500'} />
          ) : (
            <Square size={14} className="text-white/30" />
          )}
          <span className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${showMath ? 'text-white' : 'text-white/40'}`}>
            Näytä parametrit
          </span>
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-full font-semibold text-[11px] uppercase tracking-[0.4em] transition-all active:scale-[0.97] ${
            isGenerating
              ? 'bg-white/5 text-white/20'
              : 'bg-[#111] border border-white/10 text-white hover:bg-white/5 hover:scale-[1.02] drop-shadow-lg'
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
