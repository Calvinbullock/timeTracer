import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { UrlDataObj } from '../TimeTracer/utils/urlDataObj.js';

import {
  searchDataUrls,
  cleanUrl,
  getDateKey,
  formatMillisecsToHoursAndMinutes,
  checkInterval,
  convertMinutesToMilliseconds,
  convertMillisecondsToMinutes,
  filterDateKeys,
  sortByUrlUsageTime,
  combineAndSumTimesWithOccurrences,
  calcAverages,
  formatDateTime,
  getGreaterEqualOrLessThenKey,
  calcTimeAvg,
} from './../TimeTracer/utils/utils.js';

describe('Utils Tests', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    // silence / mock all logs
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original implementations of console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('formatDateTime', () => {
    test('should format a specific date and time correctly', () => {
      // Setup
      const specificDate = new Date('2023-01-05T09:07:03'); // January 5th, 2023, 09:07:03 AM
      // Exercise
      const formattedString = formatDateTime(specificDate);
      // Test / Check
      expect(formattedString).toBe('2023/01/05 09:07:03');
    });

    test('should handle single-digit values with leading zeros correctly', () => {
      // Setup
      const singleDigitDate = new Date('2024-03-09T01:02:08'); // March 9th, 2024, 01:02:08 AM
      // Exercise
      const formattedString = formatDateTime(singleDigitDate);
      // Test / Check
      expect(formattedString).toBe('2024/03/09 01:02:08');
    });

    test('should format midnight (00:00:00) correctly', () => {
      // Setup
      const midnight = new Date('2025-12-25T00:00:00');
      // Exercise
      const formattedString = formatDateTime(midnight);
      // Test / Check
      expect(formattedString).toBe('2025/12/25 00:00:00');
    });

    test('should format the end of the day (23:59:59) correctly', () => {
      // Setup
      const endOfDay = new Date('2026-07-15T23:59:59');
      // Exercise
      const formattedString = formatDateTime(endOfDay);
      // Test / Check
      expect(formattedString).toBe('2026/07/15 23:59:59');
    });
  });

  describe('searchDataUrls', () => {
    test('should return the index of the object containing the target URL', () => {
      const target = 'google.com';
      const data = [{ url: target }, { url: 'poodle.com' }];
      const index = searchDataUrls(target, data);
      expect(index).toBe(0);
    });

    test('should return -1 if the target URL is not found', () => {
      // Setup
      const data = [{ url: 'google.com' }, { url: 'poodle.com' }];
      // Exercises
      const index = searchDataUrls('taco.com', data);
      // Test / Check
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

  describe('convertMillisecondsToMinutes', () => {
    test('should correctly convert milliseconds to minutes', () => {
      const milliSecs = 600000;
      const time = convertMillisecondsToMinutes(milliSecs);
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

      const result = checkInterval(
        urlData,
        timeIntervalMilliseconds,
        currentTime
      );

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

      const result = checkInterval(
        urlData,
        timeIntervalMilliseconds,
        currentTime
      );

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

      const result = checkInterval(
        urlData,
        timeIntervalMilliseconds,
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
      const startTime = new Date('2025-01-01T08:00:00.000Z'); // 120 minutes elapsed
      const lastCheckTime = new Date('2025-01-01T09:30:00.000Z'); // 30 minutes elapsed

      urlData.startTime = startTime;
      urlData.lastDateCheck = lastCheckTime;

      // Math.min(120 * 60 * 1000, 30 * 60 * 1000) = 30 minutes. 30 * 60 * 1000 <= 60 * 60 * 1000 (timeInterval).
      const expectedAddedTimeMs = 30 * 60 * 1000;

      // Exercise
      const result = checkInterval(
        urlData,
        timeIntervalMilliseconds,
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
      const result = checkInterval(
        urlData,
        timeIntervalMilliseconds,
        currentTime
      );

      // Test / Check
      expect(result.urlList.length).toBe(1);
      expect(result.urlList[0].url).toBe('https://example.com/new-page');
      expect(result.urlList[0].totalTime).toBe(expectedAddedTimeMs);
      expect(result.lastDateCheck.toISOString()).toBe(
        currentTime.toISOString()
      );
    });
  });

  describe('filterDateKeys', () => {
    // Test case 1: Should correctly filter out valid date strings
    test('should return an array containing only valid date keys', () => {
      //setup
      const chromeKeyList = [
        '2025-05-18',
        'some_other_key',
        '2024-10-01',
        'another_key_123',
        '1999-12-31',
        'invalid-date-format',
        '2023-02-29', // This format matches, even if date is invalid in calendar
      ];
      const expectedDateKeys = [
        '2025-05-18',
        '2024-10-01',
        '1999-12-31',
        '2023-02-29',
      ];
      // Exercises
      const result = filterDateKeys(chromeKeyList);
      // test / check
      expect(result).toEqual(expectedDateKeys);
    });

    // Test case 2: Should return an empty array if no date keys are present
    test('should return an empty array if no date keys are found', () => {
      //setup
      const chromeKeyList = ['key1', 'key2', 'item_abc', 'data_xyz'];
      const expectedDateKeys = [];
      // Exercise
      const result = filterDateKeys(chromeKeyList);
      // test / check
      expect(result).toEqual(expectedDateKeys);
    });

    // Test case 3: Should handle an empty input array
    test('should return an empty array when given an empty input list', () => {
      //setup
      const chromeKeyList = [];
      const expectedDateKeys = [];
      // Exercise
      const result = filterDateKeys(chromeKeyList);
      // test / check
      expect(result).toEqual(expectedDateKeys);
    });

    // Test case 4: Should correctly handle mixed valid and invalid formats
    test('should distinguish between valid and invalid date formats', () => {
      //setup
      const chromeKeyList = [
        '2020-01-01', // Valid
        '2020-1-1', // Invalid format (month/day not two digits)
        '2020/01/01', // Invalid format (wrong separator)
        '2020-13-01', // Invalid month
        '2020-01-32', // Invalid day
        '2020-02-29', // Valid format (leap year or not, regex matches format)
      ];
      const expectedDateKeys = ['2020-01-01', '2020-02-29'];
      // Exercise
      const result = filterDateKeys(chromeKeyList);
      // test / check
      expect(result).toEqual(expectedDateKeys);
    });

    // Test case 5: Ensure non-string values are ignored (though `filter` expects strings generally)
    test('should only process string elements and ignore non-strings', () => {
      //setup
      const chromeKeyList = [
        '2025-01-01',
        123, // Non-string
        true, // Non-string
        null, // Non-string
        undefined, // Non-string
        '2024-11-20',
      ];
      const expectedDateKeys = ['2025-01-01', '2024-11-20'];
      // Exercise
      const result = filterDateKeys(chromeKeyList);
      // test / check
      expect(result).toEqual(expectedDateKeys);
    });
  });

  describe('sortByUrlUsageTime', () => {
    // Test case 1: Basic sorting with distinct totalTime values
    test('should sort urlList by totalTime in descending order', () => {
      // Setup
      const urlList = [
        {
          url: 'example.com/b',
          totalTime: 50,
        },
        {
          url: 'example.com/a',
          totalTime: 100,
        },
        {
          url: 'example.com/c',
          totalTime: 25,
        },
      ];
      const expectedSortedList = [
        {
          url: 'example.com/a',
          totalTime: 100,
        },
        {
          url: 'example.com/b',
          totalTime: 50,
        },
        {
          url: 'example.com/c',
          totalTime: 25,
        },
      ];

      // Exercise
      const result = sortByUrlUsageTime(urlList);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
      // Also check that it's the same array instance (sorts in-place)
      expect(result).toBe(urlList);
    });

    // Test case 2: Sorting with duplicate totalTime values
    test('should handle duplicate totalTime values gracefully (maintain relative order if equal)', () => {
      // Setup
      const urlList = [
        {
          url: 'example.com/d',
          totalTime: 70,
        },
        {
          url: 'example.com/e',
          totalTime: 30,
        },
        {
          url: 'example.com/f',
          totalTime: 70,
        },
        {
          url: 'example.com/g',
          totalTime: 10,
        },
      ];
      // When totalTime is equal, the original relative order is maintained by `sort`
      const expectedSortedList = [
        {
          url: 'example.com/d',
          totalTime: 70,
        }, // d comes before f in original, so it should stay that way
        {
          url: 'example.com/f',
          totalTime: 70,
        },
        {
          url: 'example.com/e',
          totalTime: 30,
        },
        {
          url: 'example.com/g',
          totalTime: 10,
        },
      ];

      // Exercise
      const result = sortByUrlUsageTime(urlList);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
    });

    // Test case 3: Empty array input
    test('should return an empty array if an empty array is provided', () => {
      // Setup
      const urlList = [];
      const expectedSortedList = [];

      // Exercise
      const result = sortByUrlUsageTime(urlList);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
      expect(result).toBe(urlList); // Still the same array instance
    });

    // Test case 4: Array with a single element
    test('should return the same array if it contains only one element', () => {
      // Setup
      const urlList = [
        {
          url: 'single.com',
          totalTime: 42,
        },
      ];
      const expectedSortedList = [
        {
          url: 'single.com',
          totalTime: 42,
        },
      ];

      // Exercise
      const result = sortByUrlUsageTime(urlList);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
      expect(result).toBe(urlList);
    });

    // Test case 5: Array with zero totalTime values or mixed values
    test('should correctly sort with zero or mixed totalTime values', () => {
      // Setup
      const urlList = [
        {
          url: 'zero.com',
          totalTime: 0,
        },
        {
          url: 'high.com',
          totalTime: 999,
        },
        {
          url: 'mid.com',
          totalTime: 50,
        },
        {
          url: 'another_zero.com',
          totalTime: 0,
        },
      ];
      const expectedSortedList = [
        {
          url: 'high.com',
          totalTime: 999,
        },
        {
          url: 'mid.com',
          totalTime: 50,
        },
        {
          url: 'zero.com',
          totalTime: 0,
        }, // Retains relative order for equal totalTime
        {
          url: 'another_zero.com',
          totalTime: 0,
        },
      ];

      // Exercise
      const result = sortByUrlUsageTime(urlList);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
    });
  });

  describe('combineAndSumTimesWithOccurrences', () => {
    // Test case 1: Basic consolidation and sorting with distinct URLs
    test('should consolidate and sort URL usage by totalTime', () => {
      // Setup
      const inputUrlData = [
        [{ url: 'example.com/b', totalTime: 50 }],
        [{ url: 'example.com/a', totalTime: 100 }],
        [{ url: 'example.com/c', totalTime: 25 }],
      ];
      const expectedSortedList = [
        { url: 'example.com/b', totalTime: 50, occurrences: 1 },
        { url: 'example.com/a', totalTime: 100, occurrences: 1 },
        { url: 'example.com/c', totalTime: 25, occurrences: 1 },
      ];

      // Exercise
      const result = combineAndSumTimesWithOccurrences(inputUrlData);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
    });

    // Test case 2: Consolidation with duplicate URLs across inner arrays
    test('should consolidate totalTime and occurrences for duplicate URLs', () => {
      // Setup
      const inputUrlData = [
        [
          { url: 'google.com', totalTime: 20 },
          { url: 'apple.com', totalTime: 10 },
        ],
        [
          { url: 'google.com', totalTime: 30 },
          { url: 'microsoft.com', totalTime: 5 },
        ],
        [
          { url: 'apple.com', totalTime: 15 },
          { url: 'google.com', totalTime: 10 },
        ],
      ];
      const expectedSortedList = [
        { url: 'google.com', totalTime: 60, occurrences: 3 }, // 20 + 30 + 10
        { url: 'apple.com', totalTime: 25, occurrences: 2 }, // 10 + 15
        { url: 'microsoft.com', totalTime: 5, occurrences: 1 },
      ];

      // Exercise
      const result = combineAndSumTimesWithOccurrences(inputUrlData);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
    });

    // Test case 3: Empty input array
    test('should return an empty array when input is empty', () => {
      // Setup
      const inputUrlData = [];
      const expectedSortedList = [];

      // Exercise
      const result = combineAndSumTimesWithOccurrences(inputUrlData);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
    });

    // Test case 4: Input with empty inner arrays
    test('should return an empty array when inner arrays are empty', () => {
      // Setup
      const inputUrlData = [[], [], []];
      const expectedSortedList = [];

      // Exercise
      const result = combineAndSumTimesWithOccurrences(inputUrlData);

      // Test / Check
      expect(result).toEqual(expectedSortedList);
    });
  });

  describe('calcAverages', () => {
    test('if nothing needs to change nothing should change', () => {
      // Setup
      const inputList = [
        { url: 'example.com/a', totalTime: 100, occurrences: 1 },
        { url: 'example.com/b', totalTime: 50, occurrences: 1 },
        { url: 'example.com/c', totalTime: 25, occurrences: 1 },
      ];
      // In this test, if nothing needs to change, it implies divideBy should be 1.
      const divideByValue = 1;
      const expectedList = [
        { url: 'example.com/a', avg: 100 }, // 100 / 1
        { url: 'example.com/b', avg: 50 }, // 50 / 1
        { url: 'example.com/c', avg: 25 }, // 25 / 1
      ];

      // Exercise
      const result = calcAverages(inputList, divideByValue);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should calculate correct averages for items with a specific divideBy value (e.g., 5)', () => {
      // Setup
      const inputList = [
        { url: 'google.com', totalTime: 60, occurrences: 3 }, // occurrences is now irrelevant for calculation
        { url: 'apple.com', totalTime: 25, occurrences: 2 },
        { url: 'microsoft.com', totalTime: 100, occurrences: 5 },
      ];
      const divideByValue = 5; // Example divideBy value
      const expectedList = [
        { url: 'google.com', avg: 12 }, // 60 / 5
        { url: 'apple.com', avg: 5 }, // 25 / 5
        { url: 'microsoft.com', avg: 20 }, // 100 / 5
      ];

      // Exercise
      const result = calcAverages(inputList, divideByValue);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should return an empty array when the input list is empty', () => {
      // Setup
      const inputList = [];
      const divideByValue = 5; // The divideBy value doesn't matter for an empty list
      const expectedList = [];

      // Exercise
      const result = calcAverages(inputList, divideByValue);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should handle items with zero totalTime correctly', () => {
      // Setup
      const inputList = [
        { url: 'zero.com', totalTime: 0, occurrences: 5 },
        { url: 'non-zero.com', totalTime: 50, occurrences: 1 },
      ];
      const divideByValue = 2; // Example divideBy value
      const expectedList = [
        { url: 'zero.com', avg: 0 }, // 0 / 2
        { url: 'non-zero.com', avg: 25 }, // 50 / 2
      ];

      // Exercise
      const result = calcAverages(inputList, divideByValue);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should handle divideBy being 0 (avg should be 0)', () => {
      // Setup
      const inputList = [
        { url: 'divide-by-zero.com', totalTime: 100, occurrences: 5 },
        { url: 'some-visits.com', totalTime: 50, occurrences: 1 },
      ];
      // The function specifically handles divideBy > 0. If divideBy is 0, avg should be 0.
      const divideByValue = 0;
      const expectedList = [
        { url: 'divide-by-zero.com', avg: 0 }, // totalTime / 0 should result in 0 based on the function
        { url: 'some-visits.com', avg: 0 }, // totalTime / 0 should result in 0 based on the function
      ];

      // Exercise
      const result = calcAverages(inputList, divideByValue);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should handle a mix of totalTime values with a specific divideBy', () => {
      // Setup
      const inputList = [
        { url: 'site1.com', totalTime: 100, occurrences: 1 },
        { url: 'site2.com', totalTime: 150, occurrences: 3 },
        { url: 'site3.com', totalTime: 20, occurrences: 2 },
        { url: 'site4.com', totalTime: 0, occurrences: 1 },
        { url: 'site5.com', totalTime: 50, occurrences: 0 },
      ];
      const divideByValue = 4; // Example divideBy value
      const expectedList = [
        { url: 'site1.com', avg: 25 }, // 100 / 4
        { url: 'site2.com', avg: 37.5 }, // 150 / 4
        { url: 'site3.com', avg: 5 }, // 20 / 4
        { url: 'site4.com', avg: 0 }, // 0 / 4
        { url: 'site5.com', avg: 12.5 }, // 50 / 4
      ];

      // Exercise
      const result = calcAverages(inputList, divideByValue);

      // Test / Check
      expect(result).toEqual(expectedList);
    });
  });

  describe('calcTimeAvg', () => {
    test('should calculate average correctly for a single URL and diviser of 1', () => {
      // Setup
      const dataList = [[{ url: 'example.com/page1', totalTime: 100 }]];
      const diviser = 1;
      const expectedList = [{ url: 'example.com/page1', avg: 100 }];

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should calculate average for multiple URLs in a single inner array', () => {
      // Setup
      const dataList = [
        [
          { url: 'example.com/home', totalTime: 50 },
          { url: 'example.com/about', totalTime: 30 },
        ],
      ];
      const diviser = 5;
      const expectedList = [
        { url: 'example.com/home', avg: 10 }, // 50 / 5
        { url: 'example.com/about', avg: 6 }, // 30 / 5
      ].sort((a, b) => b.avg - a.avg); // Ensure expected is also sorted

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should aggregate totalTime for the same URL across nested arrays and calculate average', () => {
      // Setup
      const dataList = [
        [{ url: 'example.com/product', totalTime: 100 }],
        [{ url: 'example.com/cart', totalTime: 50 }],
        [{ url: 'example.com/product', totalTime: 200 }],
      ];
      const diviser = 10;
      const expectedList = [
        { url: 'example.com/product', avg: 30 }, // (100 + 200) / 10 = 300 / 10
        { url: 'example.com/cart', avg: 5 }, // 50 / 10
      ].sort((a, b) => b.avg - a.avg);

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should sort results by average time in descending order', () => {
      // Setup
      const dataList = [
        [{ url: 'pageB', totalTime: 80 }],
        [{ url: 'pageA', totalTime: 150 }],
        [{ url: 'pageC', totalTime: 20 }],
      ];
      const diviser = 10;
      const expectedList = [
        { url: 'pageA', avg: 15 }, // 150 / 10
        { url: 'pageB', avg: 8 }, // 80 / 10
        { url: 'pageC', avg: 2 }, // 20 / 10
      ]; // Already sorted descending

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should return an empty array if dataList is empty', () => {
      // Setup
      const dataList = [];
      const diviser = 5;
      const expectedList = [];

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should return an empty array if dataList contains empty inner arrays', () => {
      // Setup
      const dataList = [[], []];
      const diviser = 5;
      const expectedList = [];

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should handle zero diviser gracefully (avg should be 0 for all)', () => {
      // Setup
      const dataList = [
        [{ url: 'pageX', totalTime: 100 }],
        [{ url: 'pageY', totalTime: 50 }],
      ];
      const diviser = 0;
      const expectedList = [
        { url: 'pageX', avg: 0 },
        { url: 'pageY', avg: 0 },
      ].sort((a, b) => b.avg - a.avg); // Even if all are 0, sort still applies.

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should handle URLs with totalTime of 0', () => {
      // Setup
      const dataList = [
        [{ url: 'zero.com', totalTime: 0 }],
        [{ url: 'nonzero.com', totalTime: 75 }],
      ];
      const diviser = 3;
      const expectedList = [
        { url: 'nonzero.com', avg: 25 }, // 75 / 3
        { url: 'zero.com', avg: 0 }, // 0 / 3
      ].sort((a, b) => b.avg - a.avg);

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should handle floating point averages', () => {
      // Setup
      const dataList = [
        [{ url: 'floaty.com', totalTime: 101 }],
        [{ url: 'another.com', totalTime: 50 }],
      ];
      const diviser = 2;
      const expectedList = [
        { url: 'floaty.com', avg: 50.5 }, // 101 / 2
        { url: 'another.com', avg: 25 }, // 50 / 2
      ].sort((a, b) => b.avg - a.avg);

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });

    test('should handle a more complex scenario with mixed data and multiple occurrences', () => {
      // Setup
      const dataList = [
        [
          { url: 'blog.com', totalTime: 60 },
          { url: 'shop.com', totalTime: 120 },
        ],
        [{ url: 'news.com', totalTime: 30 }],
        [
          { url: 'blog.com', totalTime: 30 },
          { url: 'shop.com', totalTime: 60 },
          { url: 'news.com', totalTime: 90 },
        ],
      ];
      const diviser = 3; // Example: 3 days of data

      // blog.com: (60 + 30) / 3 = 90 / 3 = 30
      // shop.com: (120 + 60) / 3 = 180 / 3 = 60
      // news.com: (30 + 90) / 3 = 120 / 3 = 40

      const expectedList = [
        { url: 'shop.com', avg: 60 },
        { url: 'news.com', avg: 40 },
        { url: 'blog.com', avg: 30 },
      ];

      // Exercise
      const result = calcTimeAvg(dataList, diviser);

      // Test / Check
      expect(result).toEqual(expectedList);
    });
  });

  describe('getGraterEqualOrLessThenKey', () => {
    test('should correctly separate dates into graterEq and less based on period', () => {
      // Setup
      const dateKeysArray = [
        '2025-05-31', // Today
        '2025-05-25', // 6 days ago (2025-05-31 - 6) - last in the less array
        '2025-05-24', // 7 days ago (2025-05-31 - 7) - This is the cutoff for 'graterEq'
        '2025-05-23', // 8 days ago (2025-05-31 - 8) - This is older than the cutoff
        '2025-05-15', // Older date
        '2025-06-01', // Future date
      ];
      const periodInDays = 7;
      const today = new Date('2025-05-31T12:00:00Z'); // Using a specific date for 'today'

      // Expected values based on 'today' being 2025-05-31 and periodInDays being 7
      // Cutoff date is 2025-05-31 - 7 days = 2025-05-24
      const expectedGraterEq = [
        '2025-05-25',
        '2025-05-24', // Equal to the cutoff date
      ];
      const expectedLess = ['2025-05-23', '2025-05-15'];

      // Exercise
      const result = getGreaterEqualOrLessThenKey(
        dateKeysArray,
        periodInDays,
        today
      );

      // Test / Check
      expect(result.graterEq).toEqual(expect.arrayContaining(expectedGraterEq));
      expect(result.graterEq.length).toBe(expectedGraterEq.length);

      expect(result.less).toEqual(expect.arrayContaining(expectedLess));
      expect(result.less.length).toBe(expectedLess.length);
    });

    test('should handle empty dateKeysArray', () => {
      // Setup
      const dateKeysArray = [];
      const periodInDays = 7;
      const today = new Date('2025-05-31T12:00:00Z');

      const expectedGraterEq = [];
      const expectedLess = [];

      // Exercise
      const result = getGreaterEqualOrLessThenKey(
        dateKeysArray,
        periodInDays,
        today
      );

      // Test / Check
      expect(result.graterEq).toEqual(expectedGraterEq);
      expect(result.less).toEqual(expectedLess);
    });

    test('should handle all dates being graterEq', () => {
      // Setup
      const dateKeysArray = ['2025-05-31', '2025-05-30'];
      const periodInDays = 1; // Cutoff: 2025-05-30
      const today = new Date('2025-05-31T12:00:00Z');

      const expectedGraterEq = ['2025-05-30'];
      const expectedLess = [];

      // Exercise
      const result = getGreaterEqualOrLessThenKey(
        dateKeysArray,
        periodInDays,
        today
      );

      // Test / Check
      expect(result.graterEq).toEqual(expect.arrayContaining(expectedGraterEq));
      expect(result.graterEq.length).toBe(expectedGraterEq.length);
      expect(result.less).toEqual(expectedLess);
    });

    test('should handle all dates being less', () => {
      // Setup
      const dateKeysArray = ['2025-05-20', '2025-05-19', '2025-05-18'];
      const periodInDays = 1; // Cutoff: 2025-05-30
      const today = new Date('2025-05-31T12:00:00Z');

      const expectedGraterEq = [];
      const expectedLess = ['2025-05-20', '2025-05-19', '2025-05-18'];

      // Exercise
      const result = getGreaterEqualOrLessThenKey(
        dateKeysArray,
        periodInDays,
        today
      );

      // Test / Check
      expect(result.graterEq).toEqual(expectedGraterEq);
      expect(result.less).toEqual(expect.arrayContaining(expectedLess));
      expect(result.less.length).toBe(expectedLess.length);
    });

    test('should handle year difference crossing into a new year', () => {
      // Setup
      const dateKeysArray = [
        '2024-12-25', // Older than cutoff (Dec 26, 2024)
        '2024-12-26', // Equal to cutoff
        '2024-12-31', // Newer than cutoff
        '2025-01-01', // Newer than cutoff, next year
        '2025-01-04', // Newer than cutoff, same year
        '2023-11-01', // Very old date, different year
      ];
      const periodInDays = 10; // Dec 26, 2024 (cutoff date)
      const today = new Date('2025-01-05T12:00:00Z'); // Today is Jan 5, 2025

      const expectedGraterEq = [
        '2024-12-26', // Equal to cutoff
        '2024-12-31',
        '2025-01-01',
        '2025-01-04',
      ];
      const expectedLess = ['2024-12-25', '2023-11-01'];

      // Exercise
      const result = getGreaterEqualOrLessThenKey(
        dateKeysArray,
        periodInDays,
        today
      );

      // Test / Check
      expect(result.graterEq).toEqual(expect.arrayContaining(expectedGraterEq));
      expect(result.graterEq.length).toBe(expectedGraterEq.length);

      expect(result.less).toEqual(expect.arrayContaining(expectedLess));
      expect(result.less.length).toBe(expectedLess.length);
    });
  });
});
