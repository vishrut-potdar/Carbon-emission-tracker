import { EMISSION_FACTORS } from '../data/staticData';

/**
 * Calculates CO2 emissions for a given transport mode and distance.
 * @param distanceKm - Distance travelled in kilometers.
 * @param commuteType - Mode of transport (e.g., 'drive-ice', 'rail').
 * @returns Total calculated footprint in kg CO2e, rounded to 2 decimal places.
 */
export function calculateCommuteCarbon(distanceKm: number, commuteType: keyof typeof EMISSION_FACTORS.commute): number {
  if (distanceKm < 0) return 0;
  const factor = EMISSION_FACTORS.commute[commuteType] || 0.18;
  return Number((distanceKm * factor).toFixed(2));
}

/**
 * Calculates diet footprint for a specific protein / nutritional layout over duration.
 * @param days - Number of days to calculate for.
 * @param dietType - Type of food consumption profile (e.g., 'vegan', 'beef-centric').
 * @returns Total calculation in kg CO2e, rounded to 2 decimal places.
 */
export function calculateDietCarbon(days: number, dietType: keyof typeof EMISSION_FACTORS.diet): number {
  if (days < 0) return 0;
  const factor = EMISSION_FACTORS.diet[dietType] || 1.3;
  return Number((days * factor).toFixed(2));
}

/**
 * Computes embodied carbon inside raw consumer goods during fabrication/procurement.
 * @param quantity - Number of items acquired.
 * @param procurementType - Nature of product (e.g., 'electronics', 'garments').
 * @returns Aggregate embodied carbon in kg CO2e, rounded to 2 decimal places.
 */
export function calculateProcurementCarbon(quantity: number, procurementType: keyof typeof EMISSION_FACTORS.procurement): number {
  if (quantity < 0) return 0;
  const factor = EMISSION_FACTORS.procurement[procurementType] || 4.5;
  return Number((quantity * factor).toFixed(2));
}

/**
 * Computes monthly electricity footprints for domestic drawing loads.
 * @param watts - Unit operational wattage draw.
 * @param dailyHours - Daily usage duration in hours.
 * @param count - Appliance quantity.
 * @param multiplier - Grid generation intensity multiplier in kg/kWh.
 * @returns Monthly calculated footprint in kg CO2e, rounded to 2 decimal places.
 */
export function calculateApplianceMonthlyFootprint(watts: number, dailyHours: number, count: number, multiplier: number): number {
  if (watts < 0 || dailyHours < 0 || count < 0 || multiplier < 0) return 0;
  // kWh per month = (watts * hours/day * 30 days * count) / 1000
  // kg CO2e = kWh per month * grid carbon factor
  const monthlyKwh = (watts * dailyHours * 30 * count) / 1000;
  return Number((monthlyKwh * multiplier).toFixed(2));
}

/**
 * Formats a mass values elegantly into metric grams or metric ton scales.
 * @param kg - Calculated mass weight in kilograms.
 * @returns Human-readable string representation (e.g., "350kg CO₂e" or "1.24t CO₂e").
 */
export function formatCarbon(kg: number): string {
  if (kg < 0) return '0kg CO₂e';
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)}t CO₂e`;
  }
  return `${kg.toFixed(0)}kg CO₂e`;
}

/**
 * Formats double parameters into localized US Dollar format designators.
 * @param usd - Numerical monetary value.
 * @returns Localized dollar layout.
 */
export function formatUSD(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
}
