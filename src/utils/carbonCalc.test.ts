import { describe, it, expect } from 'vitest';
import {
  calculateCommuteCarbon,
  calculateDietCarbon,
  calculateProcurementCarbon,
  calculateApplianceMonthlyFootprint,
  formatCarbon,
  formatUSD,
} from './carbonCalc';

describe('carbonCalc utility functions', () => {
  describe('calculateCommuteCarbon', () => {
    it('calculates the correct footprint for driving an ICE (Internal Combustion Engine) vehicle', () => {
      // 100 km * 0.18 kg CO2e/km = 18.00
      expect(calculateCommuteCarbon(100, 'drive-ice')).toBe(18);
    });

    it('calculates the correct footprint for driving an EV (Electric Vehicle)', () => {
      // 100 km * 0.04 kg CO2e/km = 4.00
      expect(calculateCommuteCarbon(100, 'drive-ev')).toBe(4);
    });

    it('calculates transit methods like rails correctly', () => {
      // 50 km * 0.03 kg CO2e/km = 1.50
      expect(calculateCommuteCarbon(50, 'rail')).toBe(1.5);
    });

    it('falls back gracefully on unknown commute type', () => {
      // should fallback to 0.18 factor
      // using type-cast to bypass TypeScript compile errors for testing fallback branch
      expect(calculateCommuteCarbon(100, 'unknown-type' as any)).toBe(18);
    });
  });

  describe('calculateDietCarbon', () => {
    it('calculates the footprint for a vegan diet correctly', () => {
      // 10 days * 0.6 kg CO2e/day = 6.00
      expect(calculateDietCarbon(10, 'vegan')).toBe(6);
    });

    it('calculates the footprint for a beef-centric diet correctly', () => {
      // 2 days * 6.8 kg CO2e/day = 13.60
      expect(calculateDietCarbon(2, 'beef-centric')).toBe(13.60);
    });

    it('falls back gracefully on unknown diet type', () => {
      // should fallback to 1.3 factor
      expect(calculateDietCarbon(10, 'unknown-diet' as any)).toBe(13);
    });
  });

  describe('calculateProcurementCarbon', () => {
    it('calculates procurement footprint for garments', () => {
      // 3 items * 20.5 kg CO2e/item = 61.50
      expect(calculateProcurementCarbon(3, 'garments')).toBe(61.5);
    });

    it('calculates procurement footprint for electronics with heavy embodied carbon', () => {
      // 1 laptop * 175.0 kg CO2e/item = 175.00
      expect(calculateProcurementCarbon(1, 'electronics')).toBe(175);
    });

    it('falls back gracefully on unknown procurement category', () => {
      // should fallback to 4.5 factor
      expect(calculateProcurementCarbon(10, 'unknown-procurement' as any)).toBe(45);
    });
  });

  describe('calculateApplianceMonthlyFootprint', () => {
    it('calculates the correct monthly footprint for standard appliances', () => {
      // (1000 watts * 2 hours/day * 30 days * 1 count) / 1000 = 60 kWh per month
      // 60 kWh * 0.38 multiplier (grid intensity) = 22.80 kg CO2e
      expect(calculateApplianceMonthlyFootprint(1000, 2, 1, 0.38)).toBe(22.8);
    });

    it('calculates high efficiency heat pumps correctly under low grid density', () => {
      // (1500 watts * 4 hours/day * 30 days * 1 count) / 1000 = 180 kWh per month
      // 180 kWh * 0.12 grid intensity = 21.60 kg CO2e
      expect(calculateApplianceMonthlyFootprint(1500, 4, 1, 0.12)).toBe(21.6);
    });
  });

  describe('formatCarbon', () => {
    it('formats values under 1000 in kilograms with no decimal points', () => {
      expect(formatCarbon(350)).toBe('350kg CO₂e');
      expect(formatCarbon(999.4)).toBe('999kg CO₂e');
    });

    it('formats values of 1000 and above in metric tons with 2 decimal points', () => {
      expect(formatCarbon(1000)).toBe('1.00t CO₂e');
      expect(formatCarbon(12345.67)).toBe('12.35t CO₂e');
    });
  });

  describe('formatUSD', () => {
    it('formats numbers into standard US dollars correctly', () => {
      const formatted = formatUSD(1234.56);
      expect(formatted).toContain('$1,234.56');
    });
  });
});
