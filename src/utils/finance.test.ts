import { describe, it, expect } from 'vitest';
import {
  calculateAccumulated,
  calculateSecuredFutureValue,
  calculateTotalForecast,
} from './finance';

// ─────────────────────────────────────────────────────────────────────────────
// BRUTE FORCE HELPER
//
// Simulates day-by-day cost accumulation to verify the analytical formulas.
// On day d (0-indexed), the daily cost is:  dailyCost × (1 + i)^(d/365.25)
// This is the "ground truth" that the closed-form integral should match.
// ─────────────────────────────────────────────────────────────────────────────

function bruteForceAccumulated(dailyCost: number, i_percent: number, totalDays: number): number {
  const i = i_percent / 100;
  let sum = 0;
  for (let d = 0; d < totalDays; d++) {
    sum += dailyCost * Math.pow(1 + i, d / 365.25);
  }
  return sum;
}

// Brute-force total forecast:
// Each day's saving is invested and grows at rate r for the remaining time.
// On day d, you save dailyCost × (1+i)^(d/365.25), and it compounds at r
// for (totalYears - d/365.25) years.
function bruteForceTotalForecast(
  dailyCost: number, i_percent: number, totalYears: number, r_percent: number
): number {
  const i = i_percent / 100;
  const r = r_percent / 100;
  const totalDays = Math.round(totalYears * 365.25);
  let sum = 0;
  for (let d = 0; d < totalDays; d++) {
    const yearsRemaining = totalYears - d / 365.25;
    const dayCost = dailyCost * Math.pow(1 + i, d / 365.25);
    sum += dayCost * Math.pow(1 + r, yearsRemaining);
  }
  return sum;
}

// ═══════════════════════════════════════════════════════════════════════════════
// calculateAccumulated
//
// Models cumulative nicotine spending with annual price inflation.
// Formula:  c × [(1+i)^years − 1] / ln(1+i),  where c = dailyCost × 365.25
// At i=0:   dailyCost × daysElapsed  (simple multiplication, no integral)
//
// Derivation: Cost rate at time t (years) = c·(1+i)^t.
//             Total from 0→T = ∫₀ᵀ c·(1+i)^t dt = c · [(1+i)^T − 1] / ln(1+i)
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateAccumulated', () => {
  // ── Edge cases ────────────────────────────────────────────────────────────
  it('returns 0 when no days have elapsed', () => {
    expect(calculateAccumulated(10, 5, 0)).toBe(0);
    expect(calculateAccumulated(10, 0, 0)).toBe(0);
    expect(calculateAccumulated(0, 5, 100)).toBe(0);
  });

  // ── Zero inflation ────────────────────────────────────────────────────────
  it('i=0: returns exact simple multiplication (dailyCost × days)', () => {
    expect(calculateAccumulated(10, 0, 1)).toBe(10);
    expect(calculateAccumulated(10, 0, 30)).toBe(300);
    expect(calculateAccumulated(10, 0, 365.25)).toBe(3652.5);
    expect(calculateAccumulated(7, 0, 365.25 * 3)).toBe(7 * 365.25 * 3);
  });

  // ── Hand-calculated anchor values ─────────────────────────────────────────
  // c = 10 × 365.25 = 3652.5
  // 1 year, 5% inflation:
  //   ln(1.05) = 0.04879016...
  //   (1.05¹ − 1) / ln(1.05) = 0.05 / 0.04879016 = 1.024797...
  //   result = 3652.5 × 1.024797 = 3743.10
  it('1 year, 10€/day, 5% inflation — hand-calculated: 3743.10', () => {
    const result = calculateAccumulated(10, 5, 365.25);
    expect(result).toBeCloseTo(3743.10, 0);
  });

  // 2 years, 5% inflation:
  //   (1.05² − 1) / ln(1.05) = 0.1025 / 0.04879016 = 2.100784...
  //   result = 3652.5 × 2.100784 = 7673.11
  it('2 years, 10€/day, 5% inflation — hand-calculated: 7673.11', () => {
    const result = calculateAccumulated(10, 5, 365.25 * 2);
    expect(result).toBeCloseTo(7673.11, 0);
  });

  // 5 years, 8% inflation:
  //   c = 3652.5, ln(1.08) = 0.076961...
  //   (1.08⁵ − 1) / 0.076961 = 0.469328 / 0.076961 = 6.098...
  //   result = 3652.5 × 6.098 = 22278
  it('5 years, 10€/day, 8% inflation — hand-calculated: ~22278', () => {
    const result = calculateAccumulated(10, 8, 365.25 * 5);
    expect(result).toBeCloseTo(22278, -1); // within ±5
  });

  // ── Brute force verification ──────────────────────────────────────────────
  it('matches day-by-day brute force: 1 year, 7€/day, 5% inflation', () => {
    const analytical = calculateAccumulated(7, 5, 365);
    const bruteForce = bruteForceAccumulated(7, 5, 365);
    // Integral approximation vs discrete sum — should agree within 0.3%
    expect(Math.abs(analytical - bruteForce) / bruteForce).toBeLessThan(0.003);
  });

  it('matches day-by-day brute force: 3 years, 10€/day, 10% inflation', () => {
    const days = Math.round(365.25 * 3);
    const analytical = calculateAccumulated(10, 10, days);
    const bruteForce = bruteForceAccumulated(10, 10, days);
    expect(Math.abs(analytical - bruteForce) / bruteForce).toBeLessThan(0.003);
  });

  it('matches day-by-day brute force: 10 years, 15€/day, 3% inflation', () => {
    const days = Math.round(365.25 * 10);
    const analytical = calculateAccumulated(15, 3, days);
    const bruteForce = bruteForceAccumulated(15, 3, days);
    expect(Math.abs(analytical - bruteForce) / bruteForce).toBeLessThan(0.003);
  });

  // ── Mathematical properties ───────────────────────────────────────────────
  it('scales linearly with dailyCost', () => {
    const single = calculateAccumulated(10, 5, 365.25);
    const triple = calculateAccumulated(30, 5, 365.25);
    expect(triple).toBeCloseTo(single * 3, 6);
  });

  it('higher inflation → more accumulated cost', () => {
    const low = calculateAccumulated(10, 2, 365.25 * 5);
    const high = calculateAccumulated(10, 10, 365.25 * 5);
    expect(high).toBeGreaterThan(low);
  });

  it('longer period → more accumulated cost', () => {
    const short = calculateAccumulated(10, 5, 100);
    const long = calculateAccumulated(10, 5, 1000);
    expect(long).toBeGreaterThan(short);
  });

  it('always returns a finite positive number for positive inputs', () => {
    const values = [
      calculateAccumulated(1, 1, 1),
      calculateAccumulated(100, 20, 365.25 * 30),
      calculateAccumulated(0.5, 0.1, 10),
    ];
    values.forEach(v => {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThan(0);
    });
  });
});



// ═══════════════════════════════════════════════════════════════════════════════
// calculateSecuredFutureValue
//
// Simple compound growth of a lump sum.
// Formula:  accumulated × (1 + r)^years
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateSecuredFutureValue', () => {
  it('returns principal unchanged after 0 years', () => {
    expect(calculateSecuredFutureValue(1000, 0, 7)).toBe(1000);
    expect(calculateSecuredFutureValue(5000, 0, 12)).toBe(5000);
  });

  it('returns 0 when principal is 0', () => {
    expect(calculateSecuredFutureValue(0, 10, 7)).toBe(0);
  });

  // 1000 × 1.07¹ = 1070.00
  it('1 year at 7% — exact: 1070.00', () => {
    expect(calculateSecuredFutureValue(1000, 1, 7)).toBeCloseTo(1070.00, 2);
  });

  // 1000 × 1.07² = 1144.90
  it('2 years at 7% — exact: 1144.90', () => {
    expect(calculateSecuredFutureValue(1000, 2, 7)).toBeCloseTo(1144.90, 2);
  });

  // 1000 × 1.07⁵ = 1402.5517...
  it('5 years at 7% — exact: 1402.55', () => {
    expect(calculateSecuredFutureValue(1000, 5, 7)).toBeCloseTo(1402.55, 1);
  });

  // 1000 × 1.07¹⁰ = 1967.1514...
  it('10 years at 7% — exact: 1967.15', () => {
    expect(calculateSecuredFutureValue(1000, 10, 7)).toBeCloseTo(1967.15, 0);
  });

  // 5000 × 1.10²⁰ = 5000 × 6.7275 = 33637.5
  it('20 years at 10% — exact: 33637.50', () => {
    const expected = 5000 * Math.pow(1.10, 20);
    expect(calculateSecuredFutureValue(5000, 20, 10)).toBeCloseTo(expected, 2);
  });

  it('scales linearly with principal', () => {
    const single = calculateSecuredFutureValue(1000, 10, 7);
    const quadruple = calculateSecuredFutureValue(4000, 10, 7);
    expect(quadruple).toBeCloseTo(single * 4, 6);
  });

  it('higher return → higher future value', () => {
    const low = calculateSecuredFutureValue(1000, 10, 3);
    const high = calculateSecuredFutureValue(1000, 10, 12);
    expect(high).toBeGreaterThan(low);
  });

  it('longer horizon → higher future value', () => {
    const short = calculateSecuredFutureValue(1000, 5, 7);
    const long = calculateSecuredFutureValue(1000, 20, 7);
    expect(long).toBeGreaterThan(short);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// calculateTotalForecast
//
// FV of investing each day's savings (growing with inflation i) at return r.
//
// Derivation: On day d the contribution is c·(1+i)^(d/365.25). Each contribu-
// tion compounds at r for (T − d/365.25) remaining years. Integrating:
//   FV = ∫₀ᵀ c·(1+i)^t · (1+r)^(T−t) dt
//      = c·(1+r)^T · ∫₀ᵀ k^t dt,  where k=(1+i)/(1+r)
//
//   If k=1 (i.e. i=r):  FV = c · (1+r)^T · T
//   Otherwise:           FV = c · (1+r)^T · (k^T − 1) / ln(k)
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateTotalForecast', () => {
  // ── Edge cases ────────────────────────────────────────────────────────────
  it('returns ~0 for 0-year horizon', () => {
    expect(calculateTotalForecast(10, 5, 0, 7)).toBeCloseTo(0, 4);
    expect(calculateTotalForecast(10, 7, 0, 7)).toBeCloseTo(0, 4); // i==r
  });

  it('returns 0 with 0 dailyCost', () => {
    expect(calculateTotalForecast(0, 5, 10, 7)).toBe(0);
  });

  // ── i == r special case ───────────────────────────────────────────────────
  it('i==r: produces a finite positive number (no div-by-zero)', () => {
    const result = calculateTotalForecast(10, 7, 10, 7);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  // i==r anchor: c = 3652.5, FV = 3652.5 × 1.07¹ × 1 = 3908.175
  it('i==r anchor: 10€/day, 7%/7%, 1 year — exact: 3908.175', () => {
    expect(calculateTotalForecast(10, 7, 1, 7)).toBeCloseTo(3908.175, 1);
  });

  // i==r anchor: 3652.5 × 1.07¹⁰ × 10 = 3652.5 × 19.67151 = 71849.4
  it('i==r anchor: 10€/day, 7%/7%, 10 years — exact: 71849.4', () => {
    const expected = 10 * 365.25 * Math.pow(1.07, 10) * 10;
    expect(calculateTotalForecast(10, 7, 10, 7)).toBeCloseTo(expected, 0);
  });

  // ── Hand-calculated anchor: i != r ────────────────────────────────────────
  // dailyCost=10, i=5%, r=7%, T=1
  // c = 3652.5, k = 1.05/1.07 = 0.98130841...
  // ln(k) = ln(0.98130841) = −0.018868...
  // k¹ − 1 = −0.018692...
  // (k^T−1)/ln(k) = −0.018692 / −0.018868 = 0.99068...
  // FV = 3652.5 × 1.07 × 0.99068 = 3870.4
  it('i≠r anchor: 10€/day, 5%/7%, 1 year — hand-calculated: ~3870', () => {
    const result = calculateTotalForecast(10, 5, 1, 7);
    expect(result).toBeCloseTo(3870, -1); // within ±5
  });

  // ── Brute force verification ──────────────────────────────────────────────
  it('matches day-by-day brute force: 1 year, 7€/day, i=5%, r=7%', () => {
    const analytical = calculateTotalForecast(7, 5, 1, 7);
    const bruteForce = bruteForceTotalForecast(7, 5, 1, 7);
    expect(Math.abs(analytical - bruteForce) / bruteForce).toBeLessThan(0.003);
  });

  it('matches day-by-day brute force: 3 years, 10€/day, i=5%, r=7%', () => {
    const analytical = calculateTotalForecast(10, 5, 3, 7);
    const bruteForce = bruteForceTotalForecast(10, 5, 3, 7);
    expect(Math.abs(analytical - bruteForce) / bruteForce).toBeLessThan(0.003);
  });

  it('matches day-by-day brute force: 10 years, 15€/day, i=3%, r=10%', () => {
    const analytical = calculateTotalForecast(15, 3, 10, 10);
    const bruteForce = bruteForceTotalForecast(15, 3, 10, 10);
    expect(Math.abs(analytical - bruteForce) / bruteForce).toBeLessThan(0.003);
  });

  it('matches day-by-day brute force: i==r case, 5 years, 8€/day', () => {
    const analytical = calculateTotalForecast(8, 6, 5, 6);
    const bruteForce = bruteForceTotalForecast(8, 6, 5, 6);
    expect(Math.abs(analytical - bruteForce) / bruteForce).toBeLessThan(0.003);
  });

  // ── Mathematical properties ───────────────────────────────────────────────
  it('scales linearly with dailyCost', () => {
    const single = calculateTotalForecast(10, 5, 10, 7);
    const double = calculateTotalForecast(20, 5, 10, 7);
    expect(double).toBeCloseTo(single * 2, 2);
  });

  it('more years → higher forecast', () => {
    const five = calculateTotalForecast(10, 5, 5, 7);
    const twenty = calculateTotalForecast(10, 5, 20, 7);
    expect(twenty).toBeGreaterThan(five);
  });

  it('higher return → higher forecast', () => {
    const low = calculateTotalForecast(10, 5, 10, 3);
    const high = calculateTotalForecast(10, 5, 10, 12);
    expect(high).toBeGreaterThan(low);
  });

  it('higher inflation → higher forecast (larger contributions)', () => {
    const low = calculateTotalForecast(10, 2, 10, 7);
    const high = calculateTotalForecast(10, 10, 10, 7);
    expect(high).toBeGreaterThan(low);
  });

  // ── Cross-function consistency ────────────────────────────────────────────
  // If r=0 and i=0, the total forecast should equal simple accumulation
  // (no compounding on either side).
  it('with r=0 and i=0: equals simple dailyCost × totalDays', () => {
    const totalYears = 5;
    const forecast = calculateTotalForecast(10, 0, totalYears, 0);
    const simple = 10 * 365.25 * totalYears;
    expect(forecast).toBeCloseTo(simple, 0);
  });

  // securedFV(accumulated, T, r) should be ≤ totalForecast(cost, i, elapsed+T, r)
  // because totalForecast includes both past and future savings being invested.
  it('total forecast ≥ secured FV of just the accumulated portion', () => {
    const days = 365.25;
    const accumulated = calculateAccumulated(10, 5, days);
    const securedOnly = calculateSecuredFutureValue(accumulated, 5, 7);

    const totalYearsTotal = 1 + 5; // 1 year elapsed + 5 years future
    const totalForecast = calculateTotalForecast(10, 5, totalYearsTotal, 7);

    expect(totalForecast).toBeGreaterThan(securedOnly);
  });
});
