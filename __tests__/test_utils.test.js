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
      // setup
      const target = 'google.com';
      const data = [{ url: target }, { url: 'poodle.com' }];
      // exercises
      const index = searchDataUrls(target, data);
      // test / check
      expect(index).toBe(0);
    });

    test('should return -1 if the target URL is not found', () => {
      // setup
      const data = [{ url: 'google.com' }, { url: 'poodle.com' }];
      // exercises
      const index = searchDataUrls('taco.com', data);
      // test / check
      expect(index).toBe(-1);
    });
  });

  describe('cleanUrl', () => {
    test('should clean a basic Reddit URL', () => {
      // setup
      const dirtyUrl = 'https://www.reddit.com/r/linux/';
      // exercises
      const cleanedUrl = cleanUrl(dirtyUrl);
      // test / check
      expect(cleanedUrl).toBe('www.reddit.com');
    });

    test('should clean a basic Google Mail URL', () => {
      // setup
      const dirtyUrl = 'https://mail.google.com/mail/u/0/#inbox';
      // exercises
      const cleanedUrl = cleanUrl(dirtyUrl);
      // test / check
      expect(cleanedUrl).toBe('mail.google.com');
    });

    test('should clean a basic Google Gemini URL', () => {
      // setup
      const dirtyUrl = 'https://gemini.google.com/app/';
      // exercises
      const cleanedUrl = cleanUrl(dirtyUrl);
      // test / check
      expect(cleanedUrl).toBe('gemini.google.com');
    });
  });

  describe('minutesFromMilliseconds', () => {
    test('should correctly convert milliseconds to minutes', () => {
      // setup
      const milliSecs = 600000;
      // exercises
      const time = minutesFromMilliseconds(milliSecs);
      // test / check
      expect(time).toBe(10);
    });
  });

  describe('formatMillisecsToHoursAndMinutes', () => {
    test('should format an exact hour correctly', () => {
      // setup
      const testData = 3600000;
      const expectedOutput = '1 hr';
      // exercises
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      // test / check
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format only minutes correctly', () => {
      // setup
      const testData = 1800000; // 30 minutes
      const expectedOutput = '30 min';
      // exercises
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      // test / check
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format hours and minutes correctly', () => {
      // setup
      const testData = 7500000; // 2 hours and 5 minutes
      const expectedOutput = '2 hr, 5 min';
      // exercises
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      // test / check
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format zero milliseconds correctly', () => {
      // setup
      const testData = 0;
      const expectedOutput = '0 min';
      // exercises
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      // test / check
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format null input to "0 min"', () => {
      // setup
      const testData = null;
      const expectedOutput = '0 min';
      // exercises
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      // test / check
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format negative input to "0 min"', () => {
      // setup
      const testData = -1000;
      const expectedOutput = '0 min';
      // exercises
      const actualOutput = formatMillisecsToHoursAndMinutes(testData);
      // test / check
      expect(actualOutput).toBe(expectedOutput);
    });
  });

  describe('getDateKey', () => {
    test('should format a specific date to "YYYY-MM-DD"', () => {
      // setup
      const testDate = new Date(2023, 10, 15); // November 15, 2023
      const expectedOutput = '2023-11-15';
      // exercises
      const actualOutput = getDateKey(testDate);
      // test / check
      expect(actualOutput).toBe(expectedOutput);
    });

    test('should format a date with single digit month and day correctly', () => {
      // setup
      const testDate = new Date(2024, 5, 9); // June 9, 2024
      const expectedOutput = '2024-06-09';
      // exercises
      const actualOutput = getDateKey(testDate);
      // test / check
      expect(actualOutput).toBe(expectedOutput);
    });
  });
});
