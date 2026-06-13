/**
 * Central constants and operational coefficients config map.
 * Ensures strict decoupling of environmental metrics and thresholds.
 */
export const OPERATIONAL_CONFIG = {
  // Conversion factors and operational multipliers
  MULTIPLIERS: {
    DAYS_IN_MONTH: 30,
    WATT_TO_KILOWATT_DIVISOR: 1000,
    METRIC_TON_KILOGRAM_THRESHOLD: 1000,
  },

  // Fallback coefficients for carbon calculations when exact matches aren't found
  DEFAULT_CARBON_FACTORS: {
    COMMUTE: 0.18,      // kg CO2e per km fallback (e.g. drive-ice default)
    DIET: 1.3,          // kg CO2e per day fallback (e.g. vegetarian default)
    PROCUREMENT: 4.5,   // kg CO2e per item fallback (e.g. general default)
  },

  // Budget defaults
  DEFAULT_BUDGETS: {
    DAILY_LIMIT_KG: 10,
    MONTHLY_LIMIT_KG: 500,
  },

  // Advisory alert & style transitions thresholds
  ALERT_THRESHOLDS: {
    DAILY_CAUTION: 0.70, // 70% of daily capacity trigger
    MONTHLY_ALERT_WARNING: 0.80, // 80% of monthly budget trigger
  },

  // Offset project price rates in USD per kg carbon offset
  OFFSET_PROJECT_PRICES: {
    'reforestation': 0.12,    // $0.12 per kg carbon offset ($120/ton)
    'renewable-solar': 0.08,  // $0.08 per kg carbon offset
    'cooking-stoves': 0.05,   // $0.05 per kg carbon offset
    'methane-capture': 0.15   // $0.15 per kg carbon offset
  } as Record<'reforestation' | 'renewable-solar' | 'cooking-stoves' | 'methane-capture', number>,

  // Offset project default names
  OFFSET_PROJECT_NAMES: {
    'reforestation': 'Cascadian Mountain Reforestation Initiative',
    'renewable-solar': 'Sahara Solar Grid Addition Sector V',
    'cooking-stoves': 'Clean Mechanical Cookstoves for Coastal Villages',
    'methane-capture': 'Landfill Methane Bio-Capture Alliance'
  } as Record<'reforestation' | 'renewable-solar' | 'cooking-stoves' | 'methane-capture', string>
} as const;
