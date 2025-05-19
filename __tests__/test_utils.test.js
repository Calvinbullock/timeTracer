import { describe, test, expect } from 'vitest';
import {
  searchDataUrls,
  cleanUrl,
  getDateKey,
  minutesFromMilliseconds,
  formatMillisecsToHoursAndMinutes,
} from './../TimeTracer/utils/utils.js';

describe('Utils Tests', () => {
  describe('searchDataUrls', () => {
    test('should return the index of the object containing the target URL', () => {
      const target = 'google.com';
      const data = [{ url: target }, { url: 'poodle.com' }];
      const index = searchDataUrls(target, data);
      expect(index).toBe(0);
    });

    test('should return -1 if the target URL is not found', () => {
      const data = [{ url: 'google.com' }, { url: 'poodle.com' }];
      const index = searchDataUrls('taco.com', data);
      expect(index).toBe(-1);
    });
  });

  describe('cleanUrl', () => {
    test('should clean a basic Reddit URL', () => {
      const dirtyUrl = 'https://www.reddit.com/r/linux/';
      const cleanedUrl = cleanUrl(dirtyUrl);
      expect(cleanedUrl).toBe('www.reddit.com');
    });

    test('should clean a basic Google Mail URL', () => {
      const dirtyUrl = 'https://mail.google.com/mail/u/0/#inbox';
      const cleanedUrl = cleanUrl(dirtyUrl);
      expect(cleanedUrl).toBe('mail.google.com');
    });

    test('should clean a basic Google Gemini URL', () => {
      const dirtyUrl = 'https://gemini.google.com/app/';
      const cleanedUrl = cleanUrl(dirtyUrl);
      expect(cleanedUrl).toBe('gemini.google.com');
    });
  });

  describe('minutesFromMilliseconds', () => {
    test('should correctly convert milliseconds to minutes', () => {
      const milliSecs = 600000;
      const time = minutesFromMilliseconds(milliSecs);
      expect(time).toBe(10);
    });
  });

  describe('formatMillisecsToHoursAndMinutes', () => {
    test('should format an exact hour correctly', () => {
      const testData = 3600000;
      const expectedOutput = '1 hr';
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format only minutes correctly', () => {
      const testData = 1800000; // 30 minutes
      const expectedOutput = '30 min';
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format hours and minutes correctly', () => {
      const testData = 7500000; // 2 hours and 5 minutes
      const expectedOutput = '2 hr, 5 min';
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format zero milliseconds correctly', () => {
      const testData = 0;
      const expectedOutput = '0 min';
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format null input to "0 min"', () => {
      const testData = null;
      const expectedOutput = '0 min';
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format negative input to "0 min"', () => {
      const testData = -1000;
      const expectedOutput = '0 min';
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      expect(actualOutput).toBe(expectedOutput);
    });
  });

  describe('getDateKey', () => {
    test('should format a specific date to "YYYY-MM-DD"', () => {
      const testDate = new Date(2023, 10, 15); // November 15, 2023
      const expectedOutput = '2023-11-15';
      const actualOutput = getDateKey(testDate);
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format a date with single digit month and day correctly', () => {
      const testDate = new Date(2024, 5, 9); // June 9, 2024
      const expectedOutput = '2024-06-09';
      const actualOutput = getDateKey(testDate);
      expect(actualOutput).toBe(expectedOutput);
    });
  });
});
