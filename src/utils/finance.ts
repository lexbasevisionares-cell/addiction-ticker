export function calculateAccumulated(dailyCost: number, i_percent: number, daysElapsed: number): number {
  const annualCost = dailyCost * 365.25;
  const i = i_percent / 100;
  const years = daysElapsed / 365.25;
  
  if (i === 0) {
    return dailyCost * daysElapsed;
  }
  
  const result = annualCost * (Math.pow(1 + i, years) - 1) / i;
  console.log(`CalculateAccumulated: daily=${dailyCost}, i=${i}, days=${daysElapsed}, years=${years.toFixed(2)} -> result=${result.toFixed(2)}`);
  return result;
}

export function calculateSecuredFutureValue(accumulated: number, yearsToTarget: number, r_percent: number): number {
  const r = r_percent / 100;
  if (r === 0) return accumulated;
  const result = accumulated * Math.pow(1 + r, yearsToTarget);
  console.log(`CalculateSecured: acc=${accumulated.toFixed(2)}, years=${yearsToTarget.toFixed(2)}, r=${r} -> result=${result.toFixed(2)}`);
  return result;
}

export function calculateTotalForecast(dailyCost: number, i_percent: number, totalYears: number, r_percent: number): number {
  const c = dailyCost * 365.25;
  const i = i_percent / 100;
  const r = r_percent / 100;
  
  let result = 0;
  if (Math.abs(r - i) < 0.0001) {
    result = c * totalYears * Math.pow(1 + r, totalYears - 1);
  } else {
    // Standard Growing Annuity Formula (Future Value)
    result = c * (Math.pow(1 + r, totalYears) - Math.pow(1 + i, totalYears)) / (r - i);
  }
  
  console.log(`CalculateTotalForecast: daily=${dailyCost}, totalYears=${totalYears.toFixed(2)}, i=${i}, r=${r} -> result=${result.toFixed(2)}`);
  return result;
}
