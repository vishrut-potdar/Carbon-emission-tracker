import { EMISSION_FACTORS } from '../data/staticData';
import { LogCategory } from '../types';

export function calculateCommuteCarbon(distanceKm: number, commuteType: keyof typeof EMISSION_FACTORS.commute): number {
  const factor = EMISSION_FACTORS.commute[commuteType] || 0.18;
  return Number((distanceKm * factor).toFixed(2));
}

export function calculateDietCarbon(days: number, dietType: keyof typeof EMISSION_FACTORS.diet): number {
  const factor = EMISSION_FACTORS.diet[dietType] || 1.3;
  return Number((days * factor).toFixed(2));
}

export function calculateProcurementCarbon(quantity: number, procurementType: keyof typeof EMISSION_FACTORS.procurement): number {
  const factor = EMISSION_FACTORS.procurement[procurementType] || 4.5;
  return Number((quantity * factor).toFixed(2));
}

export function calculateApplianceMonthlyFootprint(watts: number, dailyHours: number, count: number, multiplier: number): number {
  // kWh per month = (watts * ours/day * 30 days * count) / 1000
  // kg CO2e = kWh per month * grid carbon factor
  const monthlyKwh = (watts * dailyHours * 30 * count) / 1000;
  return Number((monthlyKwh * multiplier).toFixed(2));
}

export function formatCarbon(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)}t CO₂e`;
  }
  return `${kg.toFixed(0)}kg CO₂e`;
}

export function formatUSD(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
}
