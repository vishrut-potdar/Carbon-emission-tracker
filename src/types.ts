export type LogCategory = 'commute' | 'diet' | 'procurement';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO String
  date: string; // YYYY-MM-DD
  category: LogCategory;
  description: string;
  carbonAmount: number; // in kg CO2e
  details: {
    distanceKm?: number;
    commuteType?: 'drive-ice' | 'drive-ev' | 'rail' | 'bus' | 'flight-domestic' | 'flight-intl';
    dietType?: 'vegan' | 'vegetarian' | 'mediterranean' | 'poultry-centric' | 'beef-centric';
    procurementType?: 'garments' | 'electronics' | 'books' | 'appliances' | 'furniture' | 'general';
    quantity?: number;
  };
}

export interface OffsetLog {
  id: string;
  timestamp: string;
  projectType: 'reforestation' | 'renewable-solar' | 'cooking-stoves' | 'methane-capture';
  projectName: string;
  offsetAmount: number; // in kg CO2e offset
  costUSD: number; // estimated cost in USD
}

export interface ApplianceRating {
  id: string;
  name: string;
  watts: number;
  typicalMultiplier: number; // efficiency or carbon coefficient multiplier
}

export interface ApplianceConfig {
  id: string;
  applianceTypeId: string; // e.g. hvac, fridge, computer
  customName: string;
  watts: number;
  dailyHours: number;
  count: number;
  monthlyFootprint: number; // dynamically calculated in kg CO2e
}

export interface IndustryCarbon {
  id: string;
  name: string;
  percentage: number;
  annualGigaTons: number;
  subSectors: { name: string; percentage: number }[];
  editorialDescription: string;
}

export interface RegionalGridIntensity {
  code: string;
  name: string;
  carbonIntensity: number; // g CO2e / kWh
  primarySource: string;
  secondarySource: string;
  status: 'critical' | 'transitional' | 'decarbonized';
  description: string;
}

export interface WisdomReflection {
  id: string;
  author: string;
  location: string;
  reflection: string;
  scribeDate: string; // friendly date string
  consensus: number; // qualitative upvotes
}

export interface SwapAlternative {
  id: string;
  title: string;
  legacyName: string;
  legacyEmissionsYearly: number; // kg
  legacyDescription: string;
  swapName: string;
  swapEmissionsYearly: number; // kg
  swapDescription: string;
  effortScale: 'Low' | 'Medium' | 'High';
  financialCost: 'Low' | 'Moderate' | 'Substantial';
  wisdomQuote: string;
}

export interface DailyInsightTip {
  id: string;
  title: string;
  category: string;
  impactLabel: string;
  savingsKgYearly: number;
  actionRequired: string;
  citation: string;
}
