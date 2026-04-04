/**
 * Date Utility Functions Tests
 * Tests for UTC to browser timezone conversion utilities
 */

import {
  formatDate,
  formatTime,
  formatDateTime,
  formatShortTime,
  formatLongDate,
  parseUTCDate,
} from '../date';

describe('Date Utility Functions', () => {
  // Mock a consistent timezone for testing
  const mockDate = new Date('2025-12-10T08:30:00Z'); // UTC time
  const mockDateString = '2025-12-10T08:30:00Z';

  describe('formatDate', () => {
    it('should format date with default options', () => {
      const result = formatDate(mockDate);
      expect(result).toMatch(/Dec|December/); // Should contain month
      expect(result).toContain('10'); // Should contain day
      expect(result).toContain('2025'); // Should contain year
    });

    it('should format date string', () => {
      const result = formatDate(mockDateString);
      expect(result).toMatch(/Dec|December/);
      expect(result).toContain('10');
      expect(result).toContain('2025');
    });

    it('should accept custom options', () => {
      const result = formatDate(mockDate, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      expect(result).toContain('December');
      expect(result).toContain('10');
      expect(result).toContain('2025');
    });
  });

  describe('formatTime', () => {
    it('should format time with default options', () => {
      const result = formatTime(mockDate);
      // Should contain hour and minute in some format
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format time string', () => {
      const result = formatTime(mockDateString);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should accept custom options', () => {
      const result = formatTime(mockDate, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time together', () => {
      const result = formatDateTime(mockDate);
      expect(result).toContain('December');
      expect(result).toContain('10');
      expect(result).toContain('2025');
      // Should also contain time information
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format date string with time', () => {
      const result = formatDateTime(mockDateString);
      expect(result).toContain('2025');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatShortTime', () => {
    it('should format time in HH:MM format', () => {
      const result = formatShortTime(mockDate);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format time string in HH:MM format', () => {
      const result = formatShortTime(mockDateString);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatLongDate', () => {
    it('should format date in long format', () => {
      const result = formatLongDate(mockDate);
      expect(result).toContain('December');
      expect(result).toContain('10');
      expect(result).toContain('2025');
    });

    it('should format date string in long format', () => {
      const result = formatLongDate(mockDateString);
      expect(result).toContain('December');
      expect(result).toContain('10');
      expect(result).toContain('2025');
    });
  });

  describe('parseUTCDate', () => {
    it('should parse UTC date string to Date object', () => {
      const result = parseUTCDate(mockDateString);
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(11); // December is 11
      expect(result.getUTCDate()).toBe(10);
      expect(result.getUTCHours()).toBe(8);
      expect(result.getUTCMinutes()).toBe(30);
    });

    it('should handle different UTC formats', () => {
      const isoString = '2025-01-15T10:30:00.000Z';
      const result = parseUTCDate(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(0); // January is 0
      expect(result.getUTCDate()).toBe(15);
    });
  });

  describe('Timezone Conversion', () => {
    it('should convert UTC to local timezone', () => {
      // Create a UTC date
      const utcDate = new Date('2025-12-10T12:00:00Z');

      // Format it - should be in local timezone
      const formatted = formatDateTime(utcDate);

      // The formatted string should exist and contain the date
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('2025');
    });

    it('should handle Date objects and strings consistently', () => {
      const dateObj = new Date('2025-12-10T12:00:00Z');
      const dateStr = '2025-12-10T12:00:00Z';

      const resultFromObj = formatDate(dateObj);
      const resultFromStr = formatDate(dateStr);

      // Both should produce the same output
      expect(resultFromObj).toBe(resultFromStr);
    });
  });

  describe('Edge Cases', () => {
    it('should handle dates at year boundaries', () => {
      const newYear = new Date('2025-01-01T00:00:00Z');
      const result = formatDate(newYear);
      expect(result).toContain('2025');
      expect(result).toContain('Jan');
    });

    it('should handle dates at month boundaries', () => {
      const monthEnd = new Date('2025-01-31T23:59:59Z');
      const result = formatDate(monthEnd);
      // Depending on timezone, this could be Jan 31 or Feb 1
      expect(result).toMatch(/31|1/);
      expect(result).toMatch(/Jan|Feb/);
    });

    it('should handle leap year dates', () => {
      const leapDay = new Date('2024-02-29T12:00:00Z');
      const result = formatDate(leapDay);
      expect(result).toContain('29');
      expect(result).toContain('Feb');
    });
  });
});
