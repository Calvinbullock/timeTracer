import { describe, test, expect, beforeEach } from 'vitest';
import { UrlDataObj } from '../TimeTracer/utils/urlDataObj.js';

import {
  searchDataUrls,
  cleanUrl,
  getDateKey,
  minutesFromMilliseconds,
  formatMillisecsToHoursAndMinutes,
  checkTimeAcuraccy,
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

  describe('checkTimeAcuraccy', () => {
    let urlData;
    let timeIntervalMinutes = 60; // Represents 60 minutes for the interval

    beforeEach(() => {
      // Initialize a fresh UrlDataObj before each test
      urlData = new UrlDataObj();
      urlData.activeUrl = 'https://example.com/test'; // Set an active URL
      // Pre-populate urlList so addActiveTime can update existing entry
      urlData.urlList.push({ url: urlData.activeUrl, totalTime: 0 });
    });

    test('should add exact timeElapsed if it is less than or equal to timeInterval', () => {
      const currentTime = new Date('2025-01-01T10:30:00.000Z');
      const startTime = new Date('2025-01-01T10:00:00.000Z'); // 30 mins elapsed
      const lastCheckTime = new Date('2025-01-01T09:50:00.000Z'); // 40 mins elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // The smaller elapsed time is 30 minutes, which is <= 60 minutes (timeInterval)
      const expectedAddedTimeMs = 30 * 60 * 1000;

      const result = checkTimeAcuraccy(
        urlData,
        timeIntervalMinutes,
        currentTime
      );

      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMs);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    test('should add timeInterval if timeElapsed is between timeInterval and timeInterval * 2', () => {
      const currentTime = new Date('2025-01-01T10:30:00.000Z');
      const startTime = new Date('2025-01-01T09:00:00.000Z'); // 90 mins elapsed
      const lastCheckTime = new Date('2025-01-01T08:50:00.000Z'); // 100 mins elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // The smaller elapsed time is 90 minutes.
      // 60 < 90 <= 120 (timeInterval * 2) -> Add timeInterval (60 minutes)
      const expectedAddedTimeMs = timeIntervalMinutes * 60 * 1000;

      const result = checkTimeAcuraccy(
        urlData,
        timeIntervalMinutes,
        currentTime
      );

      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMs);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    test('should not add time if timeElapsed is greater than timeInterval * 2', () => {
      const currentTime = new Date('2025-01-01T10:30:00.000Z');
      const startTime = new Date('2025-01-01T07:30:00.000Z'); // 180 mins elapsed
      const lastCheckTime = new Date('2025-01-01T07:00:00.000Z'); // 210 mins elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // The smaller elapsed time is 180 minutes.
      // 180 > 120 (timeInterval * 2) -> No time added
      const initialTotalTimeMs = urlData.urlList[0].totalTime; // Should be 0

      const result = checkTimeAcuraccy(
        urlData,
        timeIntervalMinutes,
        currentTime
      );

      expect(result.urlList[0].totalTime).toBe(initialTotalTimeMs); // Total time should remain unchanged
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    test('should handle timeElapsed being exactly timeInterval', () => {
      const currentTime = new Date('2025-01-01T10:00:00.000Z');
      const startTime = new Date('2025-01-01T09:00:00.000Z'); // 60 mins elapsed
      const lastCheckTime = new Date('2025-01-01T08:50:00.000Z'); // 70 mins elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // The smaller elapsed time is 60 minutes.
      // 60 <= 60 (timeInterval) -> Add 60 minutes
      const expectedAddedTimeMs = 60 * 60 * 1000;

      const result = checkTimeAcuraccy(
        urlData,
        timeIntervalMinutes,
        currentTime
      );

      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMs);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    test('should correctly use the smaller of the two elapsed times', () => {
      // Setup
      const currentTime = new Date('2025-01-01T10:00:00.000Z');
      const startTime = new Date('2025-01-01T08:00:00.000Z'); // 120 mins elapsed
      const lastCheckTime = new Date('2025-01-01T09:30:00.000Z'); // 30 mins elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // Math.min(120, 30) = 30 minutes. 30 <= 60 (timeInterval).
      const expectedAddedTimeMs = 30 * 60 * 1000;

      // Exercise
      const result = checkTimeAcuraccy(
        urlData,
        timeIntervalMinutes,
        currentTime
      );

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
      checkTimeAcuraccy(urlData, timeIntervalMinutes, currentTime);
      expect(urlData.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );

      // Reset for next scenario
      urlData.lastDateCheck = oldLastCheckTime;
      urlData.startTime = new Date('2025-01-01T08:00:00.000Z'); // Medium elapsed time

      // Case 2: timeInterval < timeElapsed <= timeInterval * 2
      checkTimeAcuraccy(urlData, timeIntervalMinutes, currentTime);
      expect(urlData.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );

      // Reset for next scenario
      urlData.lastDateCheck = oldLastCheckTime;
      urlData.startTime = new Date('2025-01-01T07:00:00.000Z'); // Large elapsed time

      // Case 3: timeElapsed > timeInterval * 2
      checkTimeAcuraccy(urlData, timeIntervalMinutes, currentTime);
      expect(urlData.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });

    // --- Edge Case: No entry in urlList for activeUrl initially ---
    test('should handle urlList not having the activeUrl initially (add new entry)', () => {
      // setup
      timeIntervalMinutes = 2.0;
      urlData = new UrlDataObj(); // Reset to an empty UrlDataObj
      urlData.activeUrl = 'https://example.com/new-page'; // A new active URL

      const currentTime = new Date('2025-05-21T10:30:00.000Z');
      const startTime = new Date('2025-05-21T10:29:30.000Z'); // 0.5 mins elapsed
      const lastCheckTime = new Date('2025-05-21T10:29:00.000Z'); // 1 min elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      const expectedAddedTimeMinutes = 30000; // milli-sec -> 0.5 minutes

      // Exercise
      const result = checkTimeAcuraccy(
        urlData,
        timeIntervalMinutes,
        currentTime
      );

      // Test / Check
      expect(result.urlList.length).toBe(1);
      expect(result.urlList[0].url).toBe('https://example.com/new-page');
      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMinutes);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });
  });
});
