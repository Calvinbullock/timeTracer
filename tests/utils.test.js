import { describe, test, expect, beforeEach } from 'vitest';
import { UrlDataObj } from '../TimeTracer/utils/urlDataObj.js';

import {
  searchDataUrls,
  cleanUrl,
  getDateKey,
  minutesFromMilliseconds,
  formatMillisecsToHoursAndMinutes,
  checkInterval,
  convertMinutesToMilliseconds,
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

  describe('convertMinutesToMilliseconds', () => {
    test('should correctly convert minutes to milliseconds', () => {
      // setup
      const minutes = 10;
      // exercise
      const milliseconds = convertMinutesToMilliseconds(minutes);
      // test / check
      expect(milliseconds).toBe(600000); // 10 minutes * 60 seconds/minute * 1000 milliseconds/second
    });

    test('should return 0 for 0 minutes', () => {
      // setup
      const minutes = 0;
      // exercise
      const milliseconds = convertMinutesToMilliseconds(minutes);
      // test / check
      expect(milliseconds).toBe(0);
    });

    test('should handle fractional minutes correctly', () => {
      // setup
      const minutes = 0.5; // 30 seconds
      // exercise
      const milliseconds = convertMinutesToMilliseconds(minutes);
      // test / check
      expect(milliseconds).toBe(30000); // 0.5 * 60 * 1000
    });

    test('should handle negative minutes (though unlikely in real use, ensures mathematical correctness)', () => {
      // setup
      const minutes = -5;
      // exercise
      const milliseconds = convertMinutesToMilliseconds(minutes);
      // test / check
      expect(milliseconds).toBe(-300000); // -5 * 60 * 1000
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

  describe('checkInterval', () => {
    let urlData;
    let timeIntervalMilliseconds = 60 * 60 * 1000; // Represents 60 minutes for the interval, converted to milliseconds

    beforeEach(() => {
      // Initialize a fresh UrlDataObj before each test
      urlData = new UrlDataObj();
      urlData.activeUrl = 'https://example.com/test'; // Set an active URL
      // Pre-populate urlList so addActiveTime can update existing entry
      urlData.urlList.push({ url: urlData.activeUrl, totalTime: 0 });
    });

    test('should add exact timeElapsed if it is less than or equal to timeInterval', () => {
      const currentTime = new Date('2025-01-01T10:30:00.000Z');
      const startTime = new Date('2025-01-01T10:00:00.000Z'); // 30 minutes elapsed
      const lastCheckTime = new Date('2025-01-01T09:50:00.000Z'); // 40 minutes elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // The smaller elapsed time is 30 minutes, which is <= 60 minutes (timeInterval)
      const expectedAddedTimeMs = 30 * 60 * 1000;

      const result = checkInterval(urlData, timeIntervalMilliseconds, currentTime);

      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMs);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    test('should not add time if timeElapsed is greater than timeInterval * 2', () => {
      const currentTime = new Date('2025-01-01T10:30:00.000Z');
      const startTime = new Date('2025-01-01T07:30:00.000Z'); // 180 minutes elapsed
      const lastCheckTime = new Date('2025-01-01T07:00:00.000Z'); // 210 minutes elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // The smaller elapsed time is 180 minutes.
      // 180 * 60 * 1000 > 120 * 60 * 1000 (timeInterval * 2) -> No time added
      const initialTotalTimeMs = urlData.urlList[0].totalTime; // Should be 0

      const result = checkInterval(urlData, timeIntervalMilliseconds, currentTime);

      expect(result.urlList[0].totalTime).toBe(initialTotalTimeMs); // Total time should remain unchanged
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    test('should handle timeElapsed being exactly timeInterval', () => {
      const currentTime = new Date('2025-01-01T10:00:00.000Z');
      const startTime = new Date('2025-01-01T09:00:00.000Z'); // 60 minutes elapsed
      const lastCheckTime = new Date('2025-01-01T08:50:00.000Z'); // 70 minutes elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // The smaller elapsed time is 60 minutes.
      // 60 * 60 * 1000 <= 60 * 60 * 1000 (timeInterval) -> Add 60 minutes
      const expectedAddedTimeMs = 60 * 60 * 1000;

      const result = checkInterval(urlData, timeIntervalMilliseconds, currentTime);

      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMs);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    test('should correctly use the smaller of the two elapsed times', () => {
      // Setup
      const currentTime = new Date('2025-01-01T10:00:00.000Z');
      const startTime = new Date('2025-01-01T08:00:00.000Z'); // 120 minutes elapsed
      const lastCheckTime = new Date('2025-01-01T09:30:00.000Z'); // 30 minutes elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // Math.min(120 * 60 * 1000, 30 * 60 * 1000) = 30 minutes. 30 * 60 * 1000 <= 60 * 60 * 1000 (timeInterval).
      const expectedAddedTimeMs = 30 * 60 * 1000;

      // Exercise
      const result = checkInterval(urlData, timeIntervalMilliseconds, currentTime);

      // Test / Check
      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMs);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    test('should always update lastDateCheck regardless of time elapsed condition', () => {
      const currentTime = new Date('2025-01-01T10:00:00.000Z');
      const oldLastCheckTime = new Date('2025-01-01T09:00:00.000Z');
      urlData.lastDateCheck = oldLastCheckTime;
      urlData.startTime = new Date('2025-01-01T09:55:00.000Z'); // Small elapsed time

      // Case 1: timeElapsed <= timeInterval
      checkInterval(urlData, timeIntervalMilliseconds, currentTime);
      expect(urlData.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );

      // Reset for next scenario
      urlData.lastDateCheck = oldLastCheckTime;
      urlData.startTime = new Date('2025-01-01T08:00:00.000Z'); // Medium elapsed time

      // Case 2: timeInterval < timeElapsed <= timeInterval * 2
      checkInterval(urlData, timeIntervalMilliseconds, currentTime);
      expect(urlData.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );

      // Reset for next scenario
      urlData.lastDateCheck = oldLastCheckTime;
      urlData.startTime = new Date('2025-01-01T07:00:00.000Z'); // Large elapsed time

      // Case 3: timeElapsed > timeInterval * 2
      checkInterval(urlData, timeIntervalMilliseconds, currentTime);
      expect(urlData.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    // --- Edge Case: No entry in urlList for activeUrl initially ---
    test('should handle urlList not having the activeUrl initially (add new entry)', () => {
      // setup
      timeIntervalMilliseconds = 2.0 * 60 * 1000; // 2 minutes in milliseconds
      urlData = new UrlDataObj(); // Reset to an empty UrlDataObj
      urlData.activeUrl = 'https://example.com/new-page'; // A new active URL

      const currentTime = new Date('2025-05-21T10:30:00.000Z');
      const startTime = new Date('2025-05-21T10:29:30.000Z'); // 30 seconds elapsed
      const lastCheckTime = new Date('2025-05-21T10:29:00.000Z'); // 1 minute elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      const expectedAddedTimeMs = 30 * 1000; // 30 seconds in milliseconds

      // Exercise
      const result = checkInterval(urlData, timeIntervalMilliseconds, currentTime);

      // Test / Check
      expect(result.urlList.length).toBe(1);
      expect(result.urlList[0].url).toBe('https://example.com/new-page');
      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMs);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });
  });
});
