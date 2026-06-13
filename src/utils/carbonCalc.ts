import { EMISSION_FACTORS } from '../data/staticData';
import { OPERATIONAL_CONFIG } from '../data/config';

/**
 * Calculates CO2 emissions for a given transport mode and distance.
 * @param distanceKm - Distance travelled in kilometers.
 * @param commuteType - Mode of transport (e.g., 'drive-ice', 'rail').
 * @returns Total calculated footprint in kg CO2e, rounded to 2 decimal places.
 */
export function calculateCommuteCarbon(distanceKm: number, commuteType: keyof typeof EMISSION_FACTORS.commute): number {
  try {
    if (typeof distanceKm !== 'number' || isNaN(distanceKm)) {
      throw new TypeError('distanceKm must be a valid number');
    }
    if (distanceKm < 0) return 0;
    const factor = EMISSION_FACTORS.commute[commuteType] || OPERATIONAL_CONFIG.DEFAULT_CARBON_FACTORS.COMMUTE;
    return Number((distanceKm * factor).toFixed(2));
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(`Calculation TypeError inside calculateCommuteCarbon: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Standard error inside calculateCommuteCarbon: ${error.message}`);
    } else {
      console.error(`Unexpected calculation error in calculateCommuteCarbon:`, error);
    }
    return 0;
  }
}

/**
 * Calculates diet footprint for a specific protein / nutritional layout over duration.
 * @param days - Number of days to calculate for.
 * @param dietType - Type of food consumption profile (e.g., 'vegan', 'beef-centric').
 * @returns Total calculation in kg CO2e, rounded to 2 decimal places.
 */
export function calculateDietCarbon(days: number, dietType: keyof typeof EMISSION_FACTORS.diet): number {
  try {
    if (typeof days !== 'number' || isNaN(days)) {
      throw new TypeError('days must be a valid number');
    }
    if (days < 0) return 0;
    const factor = EMISSION_FACTORS.diet[dietType] || OPERATIONAL_CONFIG.DEFAULT_CARBON_FACTORS.DIET;
    return Number((days * factor).toFixed(2));
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(`Calculation TypeError inside calculateDietCarbon: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Standard error inside calculateDietCarbon: ${error.message}`);
    } else {
      console.error(`Unexpected calculation error in calculateDietCarbon:`, error);
    }
    return 0;
  }
}

/**
 * Computes embodied carbon inside raw consumer goods during fabrication/procurement.
 * @param quantity - Number of items acquired.
 * @param procurementType - Nature of product (e.g., 'electronics', 'garments').
 * @returns Aggregate embodied carbon in kg CO2e, rounded to 2 decimal places.
 */
export function calculateProcurementCarbon(quantity: number, procurementType: keyof typeof EMISSION_FACTORS.procurement): number {
  try {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      throw new TypeError('quantity must be a valid number');
    }
    if (quantity < 0) return 0;
    const factor = EMISSION_FACTORS.procurement[procurementType] || OPERATIONAL_CONFIG.DEFAULT_CARBON_FACTORS.PROCUREMENT;
    return Number((quantity * factor).toFixed(2));
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(`Calculation TypeError inside calculateProcurementCarbon: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Standard error inside calculateProcurementCarbon: ${error.message}`);
    } else {
      console.error(`Unexpected calculation error in calculateProcurementCarbon:`, error);
    }
    return 0;
  }
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
  try {
    if (typeof watts !== 'number' || isNaN(watts)) {
      throw new TypeError('watts must be a valid number');
    }
    if (typeof dailyHours !== 'number' || isNaN(dailyHours)) {
      throw new TypeError('dailyHours must be a valid number');
    }
    if (typeof count !== 'number' || isNaN(count)) {
      throw new TypeError('count must be a valid number');
    }
    if (typeof multiplier !== 'number' || isNaN(multiplier)) {
      throw new TypeError('multiplier grid intensity must be a valid number');
    }
    if (watts < 0 || dailyHours < 0 || count < 0 || multiplier < 0) return 0;
    // kWh per month = (watts * hours/day * days in month * count) / divisor
    // kg CO2e = kWh per month * grid carbon factor
    const monthlyKwh = (watts * dailyHours * OPERATIONAL_CONFIG.MULTIPLIERS.DAYS_IN_MONTH * count) / OPERATIONAL_CONFIG.MULTIPLIERS.WATT_TO_KILOWATT_DIVISOR;
    return Number((monthlyKwh * multiplier).toFixed(2));
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(`Calculation TypeError inside calculateApplianceMonthlyFootprint: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Standard error inside calculateApplianceMonthlyFootprint: ${error.message}`);
    } else {
      console.error(`Unexpected calculation error in calculateApplianceMonthlyFootprint:`, error);
    }
    return 0;
  }
}

/**
 * Formats a mass values elegantly into metric grams or metric ton scales.
 * @param kg - Calculated mass weight in kilograms.
 * @returns Human-readable string representation (e.g., "350kg CO₂e" or "1.24t CO₂e").
 */
export function formatCarbon(kg: number): string {
  try {
    if (typeof kg !== 'number' || isNaN(kg)) {
      throw new TypeError('mass in kg must be a valid number');
    }
    if (kg < 0) return '0kg CO₂e';
    if (kg >= OPERATIONAL_CONFIG.MULTIPLIERS.METRIC_TON_KILOGRAM_THRESHOLD) {
      return `${(kg / OPERATIONAL_CONFIG.MULTIPLIERS.METRIC_TON_KILOGRAM_THRESHOLD).toFixed(2)}t CO₂e`;
    }
    return `${kg.toFixed(0)}kg CO₂e`;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(`Formatting TypeError inside formatCarbon: ${error.message}`);
    } else {
      console.error(`Formatting error inside formatCarbon:`, error);
    }
    return '0kg CO₂e';
  }
}

/**
 * Formats double parameters into localized US Dollar format designators.
 * @param usd - Numerical monetary value.
 * @returns Localized dollar layout.
 */
export function formatUSD(usd: number): string {
  try {
    if (typeof usd !== 'number' || isNaN(usd)) {
      throw new TypeError('usd value must be a valid number');
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
  } catch (error) {
    console.error(`Formatting error inside formatUSD:`, error);
    return '$0.00';
  }
}

