import { forwardRef } from 'react';
import { useI18n } from '../context/I18nContext';

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
  showMath?: boolean;
  dailyCost?: number;
  annualPriceIncrease?: number;
  expectedReturn?: number;
}

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
  showMath,
  dailyCost,
  annualPriceIncrease,
  expectedReturn,
}, ref) => {
  const { t } = useI18n();
  const targetYear = currentYear + forecastYears;
  const T = t as any;

  // Colors — using the app's official palette
  const accent = isFree ? '#34d399' : '#f43f5e';
  const bgMain = '#050505';

  // Determine the hero value, headline (sentence opener) and punchline (sentence closer)
  const getCardData = () => {
    switch (variant) {
      case 'saved':
        return {
          value: formatCurrency(accumulated, 2),
          headline: isFree ? T.shareCardHeadline1Free : T.shareCardHeadline1Hooked,
          punchline: (T.shareCardPunchline1 || '{days} päivässä')
            .replace('{days}', days.toString()),
        };
      case 'investmentValue':
        return {
          value: formatCurrency(securedFV, 0),
          headline: isFree ? T.shareCardHeadline2Free : T.shareCardHeadline2Hooked,
          punchline: (T.shareCardPunchline2 || 'vuoteen {year} mennessä')
            .replace('{year}', targetYear.toString()),
        };
      case 'cashSavings':
        return {
          value: formatCurrency(totalDirectSavings, 0),
          headline: isFree ? T.shareCardHeadline3Free : T.shareCardHeadline3Hooked,
          punchline: (T.shareCardPunchline3 || 'vuoteen {year} mennessä')
            .replace('{year}', targetYear.toString()),
        };
      case 'totalValue':
        return {
          value: formatCurrency(totalForecast, 0),
          headline: isFree ? T.shareCardHeadline4Free : T.shareCardHeadline4Hooked,
          punchline: (T.shareCardPunchline4 || 'vuonna {year}')
            .replace('{year}', targetYear.toString()),
        };
    }
  };

  const data = getCardData();
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Status text positioning (centered dot + text via SVG coordinates)
  const statusText = isFree ? T.shareCardStatusFree : T.shareCardStatusHooked;
  const approxTextWidth = statusText.length * 13.0;
  const dotOffset = (approxTextWidth / 2) + 14;

  return (
    <div
      ref={ref}
      style={{
        width: 480,
        height: 550,
        background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, ${bgMain} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        color: '#fff',
        overflow: 'hidden',
        padding: '24px 28px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ═══ STATUS — flat dot + text (card opens with the USER's achievement) ═══ */}
      <div style={{ marginBottom: 20 }}>
        <svg width="400" height="28" viewBox="0 0 400 28">
          {/* Dot */}
          <circle 
            cx={200 - dotOffset} 
            cy="14" 
            r="4" 
            fill={accent} 
          />
          <circle 
            cx={200 - dotOffset} 
            cy="14" 
            r="8" 
            fill={accent} 
            opacity="0.3" 
          />
          {/* Status text — matched to TimerDisplay.tsx typography */}
          <text
            x="200"
            y="14.5"
            dominantBaseline="central"
            textAnchor="middle"
            fill="#d4d4d8"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.4em'
            }}
          >
            {statusText}
          </text>
        </svg>
      </div>

      {/* ═══ CLEAN TIMER — flat typography matching the main app ═══ */}
      <svg width="424" height="90" viewBox="0 0 424 90" style={{ flex: 'none', marginBottom: 24 }}>
        {/* Days */}
        <text x="53" y="38" textAnchor="middle" fill="#fff" style={{
          fontSize: '40px', fontWeight: 300, fontFamily: "'Outfit', sans-serif",
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em'
        }}>{pad(days)}</text>
        <text x="53" y="75" textAnchor="middle" fill="#a1a1aa" style={{
          fontSize: '10px', fontWeight: 500, fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.4em', textTransform: 'uppercase'
        }}>{t.days}</text>

        {/* Separator : */}
        <text x="106" y="32" textAnchor="middle" fill="#fff" opacity="0.3" style={{
          fontSize: '28px', fontWeight: 300, fontFamily: "'Outfit', sans-serif"
        }}>:</text>

        {/* Hours */}
        <text x="159" y="38" textAnchor="middle" fill="#fff" style={{
          fontSize: '40px', fontWeight: 300, fontFamily: "'Outfit', sans-serif",
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em'
        }}>{pad(hours)}</text>
        <text x="159" y="75" textAnchor="middle" fill="#a1a1aa" style={{
          fontSize: '10px', fontWeight: 500, fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.4em', textTransform: 'uppercase'
        }}>{t.hours}</text>

        {/* Separator : */}
        <text x="212" y="32" textAnchor="middle" fill="#fff" opacity="0.3" style={{
          fontSize: '28px', fontWeight: 300, fontFamily: "'Outfit', sans-serif"
        }}>:</text>

        {/* Minutes */}
        <text x="265" y="38" textAnchor="middle" fill="#fff" style={{
          fontSize: '40px', fontWeight: 300, fontFamily: "'Outfit', sans-serif",
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em'
        }}>{pad(minutes)}</text>
        <text x="265" y="75" textAnchor="middle" fill="#a1a1aa" style={{
          fontSize: '10px', fontWeight: 500, fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.4em', textTransform: 'uppercase'
        }}>{t.mins}</text>

        {/* Separator : */}
        <text x="318" y="32" textAnchor="middle" fill="#fff" opacity="0.3" style={{
          fontSize: '28px', fontWeight: 300, fontFamily: "'Outfit', sans-serif"
        }}>:</text>

        {/* Seconds — accent colored */}
        <text x="371" y="38" textAnchor="middle" fill={accent} style={{
          fontSize: '40px', fontWeight: 300, fontFamily: "'Outfit', sans-serif",
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em'
        }}>{pad(seconds)}</text>
        <text x="371" y="75" textAnchor="middle" fill={accent} style={{
          fontSize: '10px', fontWeight: 500, fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.4em', textTransform: 'uppercase'
        }}>{t.secs}</text>
      </svg>

      {/* ═══ STORY DATA — Headline → Hero Number → Punchline ═══ */}
      <svg width="424" height="190" viewBox="0 0 424 190" style={{ flex: 'none' }}>
        {/* Headline — sentence opener (e.g., "OLEN SÄÄSTÄNYT") */}
        <text
          x="50%"
          y="25"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="rgba(255,255,255,0.6)"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          {data.headline}
        </text>

        {/* Hero Number — the star of the card */}
        <text
          x="50%"
          y="100"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={accent}
          style={{
            fontSize: '56px',
            fontWeight: 300,
            letterSpacing: '-0.04em',
          }}
        >
          {data.value}
        </text>

        {/* Punchline — sentence closer (e.g., "6 PÄIVÄSSÄ") */}
        <text
          x="50%"
          y="170"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          style={{
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {data.punchline}
        </text>
      </svg>

      {/* ═══ FOOTER: Parameters (conditional) + Brand watermark (always) ═══ */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {showMath && dailyCost !== undefined && annualPriceIncrease !== undefined && expectedReturn !== undefined && (
          <div style={{
            fontSize: 9,
            fontWeight: 400,
            letterSpacing: '0.02em',
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: 315,
            marginBottom: 20,
          }}>
            {(T.shareCardMathFootnote || 'Laskelma perustuu {dailyCost} päiväkuluun, {annualIncrease} % vuotuiseen hinnannousuun ja {expectedReturn} % tuotto-odotukseen.')
              .replace('{dailyCost}', formatCurrency(dailyCost, 2))
              .replace('{annualIncrease}', annualPriceIncrease.toString())
              .replace('{expectedReturn}', expectedReturn.toString())
            }
          </div>
        )}
        <div style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.5em',
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
        }}>
          {t.tickerHeader}
        </div>
      </div>

    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
