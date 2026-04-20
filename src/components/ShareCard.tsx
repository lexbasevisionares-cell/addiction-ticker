import { forwardRef } from 'react';
import { useI18n } from '../context/I18nContext';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export type ShareCardVariant = 'saved' | 'investmentValue' | 'cashSavings' | 'totalValue';

interface ShareCardProps {
  variant: ShareCardVariant;
  isFree: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  accumulated: number;
  securedFV: number;
  totalDirectSavings: number;
  totalForecast: number;
  forecastYears: number;
  currentYear: number;
  formatCurrency: (value: number, fractionDigits?: number) => string;
}

/**
 * Helper component for the Flip Clock style digits
 */
const FlipDigit = ({ val, label, accent }: { val: string, label: string, accent: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
    <div style={{ display: 'flex', gap: 2 }}>
      {val.split('').map((digit, i) => (
        <div key={i} style={{
          width: 38,
          height: 54,
          background: 'linear-gradient(180deg, #1d1d21 0%, #09090b 100%)',
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Digit — Using SVG for absolute coordinate-based stability in exports */}
          <svg 
            width="38" 
            height="54" 
            viewBox="0 0 38 54" 
            style={{ position: 'absolute', inset: 0, zIndex: 2 }}
          >
            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={accent}
              style={{
                fontSize: '32px',
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {digit}
            </text>
          </svg>
          
          {/* Horizontal split line — visual only */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1.5,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1,
          }} />
        </div>
      ))}
    </div>
    <span style={{
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.4)',
      marginTop: 10,
    }}>{label}</span>
  </div>
);

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({
  variant,
  isFree,
  days,
  hours,
  minutes,
  seconds,
  accumulated,
  securedFV,
  totalDirectSavings,
  totalForecast,
  forecastYears,
  currentYear,
  formatCurrency,
}, ref) => {
  const { t } = useI18n();
  const targetYear = currentYear + forecastYears;
  const T = t as any;

  // Colors — using the app's official palette
  const accent = isFree ? '#34d399' : '#f43f5e';
  const accentDim = isFree ? 'rgba(52,211,153,0.3)' : 'rgba(244,63,94,0.3)';
  const bgMain = '#050505';

  // Determine the single hero value and context text
  const getCardData = () => {
    switch (variant) {
      case 'saved':
        return {
          value: formatCurrency(accumulated, 2),
          title: isFree ? T.shareCardTitle1 : T.shareCardTitleHooked1,
          context: (isFree ? T.shareCardContext1Free : T.shareCardContext1Hooked)
            .replace('{days}', days.toString()),
        };
      case 'investmentValue':
        return {
          value: formatCurrency(securedFV, 0),
          title: isFree ? T.shareCardTitle2 : T.shareCardTitleHooked2,
          context: (isFree ? T.shareCardContext2Free : T.shareCardContext2Hooked)
            .replace('{year}', targetYear.toString()),
        };
      case 'cashSavings':
        return {
          value: formatCurrency(totalDirectSavings, 0),
          title: isFree ? T.shareCardTitle3 : T.shareCardTitleHooked3,
          context: (isFree ? T.shareCardContext3Free : T.shareCardContext3Hooked)
            .replace('{year}', targetYear.toString()),
        };
      case 'totalValue':
        return {
          value: formatCurrency(totalForecast, 0),
          title: isFree ? T.shareCardTitle4 : T.shareCardTitleHooked4,
          context: (isFree ? T.shareCardContext4Free : T.shareCardContext4Hooked)
            .replace('{year}', targetYear.toString()),
        };
    }
  };

  const data = getCardData();
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      ref={ref}
      style={{
        width: 480,
        height: 600,
        background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, ${bgMain} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        padding: '32px 28px 24px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ═══ HEADER branding ═══ */}
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: '0.6em',
        textTransform: 'uppercase',
        marginBottom: 20,
        textShadow: '0 0 20px rgba(255,255,255,0.3)',
      }}>
        {t.tickerHeader}
      </div>

      <div style={{
        marginBottom: 24,
        background: 'rgba(255,255,255,0.03)',
        padding: '0 16px',
        height: 28,
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 424, // Never wider than card interior
      }}>
        <svg width="380" height="28" viewBox="0 0 380 28">
          <circle 
            cx="14" 
            cy="14" 
            r="4" 
            fill={accent} 
          />
          {/* Subtle glow for the circle — SVG based for clean render */}
          <circle cx="14" cy="14" r="8" fill={accent} opacity="0.3" />

          <text
            x="32"
            y="14.5"
            dominantBaseline="central"
            textAnchor="start"
            fill="#fff"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.15em'
            }}
          >
            {isFree ? t.freeFor : t.hookedStatus}
          </text>
        </svg>
      </div>

      {/* ═══ FLIP TIMER ═══ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        marginBottom: 36,
      }}>
        <FlipDigit val={pad(days)} label={t.days} accent="#fff" />
        <div style={{ fontSize: 24, opacity: 0.3, fontWeight: 700, marginTop: -24 }}>:</div>
        <FlipDigit val={pad(hours)} label={t.hours} accent="#fff" />
        <div style={{ fontSize: 24, opacity: 0.3, fontWeight: 700, marginTop: -24 }}>:</div>
        <FlipDigit val={pad(minutes)} label={t.mins} accent="#fff" />
        <div style={{ fontSize: 24, opacity: 0.3, fontWeight: 700, marginTop: -24 }}>:</div>
        <FlipDigit val={pad(seconds)} label={t.secs} accent={accent} />
      </div>

      {/* ═══ DIVIDER ═══ */}
      <div style={{
        width: '100%',
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${accentDim} 50%, transparent 100%)`,
        marginBottom: 36,
      }} />

      {/* ═══ THE SVG RESULT PLATE (Atomic rendering for perfect export quality) ═══ */}
      <svg width="424" height="240" viewBox="0 0 424 240" style={{ flex: 'none', marginBottom: 20 }}>
        {/* The Plate Background */}
        <rect 
          x="1" 
          y="1" 
          width="422" 
          height="238" 
          rx="20" 
          fill="rgba(255,255,255,0.015)" 
          stroke="rgba(255,255,255,0.08)" 
          strokeWidth="1"
        />
        
        {/* Header Separator Line */}
        <line x1="1" y1="44" x2="423" y2="44" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        
        {/* Title Text (SÄÄSTETTY / KULUTETTU) */}
        <text
          x="50%"
          y="22"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          style={{
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.4em'
          }}
        >
          {data.title.toUpperCase()}
        </text>

        {/* Main Value Number */}
        <text
          x="50%"
          y="115"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={accent}
          style={{
            fontSize: '56px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            filter: `drop-shadow(0 0 15px ${accent}66)`
          }}
        >
          {data.value}
        </text>



        {/* Context Text — Handle as dual lines for better fit in SVG */}
        <text
          x="50%"
          y="185"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          style={{
            fontSize: '14px',
            fontWeight: 400
          }}
        >
          {(() => {
            const ctx = data.context;
            if (ctx.length <= 38) return <tspan x="50%" dy="0">{ctx}</tspan>;
            // Find the split point closest to the middle for balanced lines
            const mid = Math.floor(ctx.length / 2);
            let splitAt = ctx.lastIndexOf(' ', mid);
            if (splitAt <= 0) splitAt = ctx.indexOf(' ', mid);
            if (splitAt <= 0) return <tspan x="50%" dy="0">{ctx}</tspan>;
            return (
              <>
                <tspan x="50%" dy="0">{ctx.substring(0, splitAt)}</tspan>
                <tspan x="50%" dy="22">{ctx.substring(splitAt + 1)}</tspan>
              </>
            );
          })()}
        </text>
      </svg>


    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
