import { describe, test, expect, beforeEach } from 'vitest';
import { UrlDataObj } from './../TimeTracer/utils/urlDataObj.js';

describe('UrlDataObj Tests', () => {
  let trackerObj;

  beforeEach(() => {
    trackerObj = new UrlDataObj();
    // Replace muteConsole/unmuteConsole with vi.spyOn for console.log
  });

  // ===================================================== \\
  // ===================================================== \\
  //                         TESTS
  // ===================================================== \\
  // ===================================================== \\

  describe('addActiveTime', () => {
    // Test Case 1: activeUrl is null
    test('should log an error and return if activeUrl is null', () => {
      // setup
      trackerObj.activeUrl = null;
      // exercises
      trackerObj.addActiveTime(1000);
      // test / check
      expect(trackerObj.urlList).toHaveLength(0); // Ensure no changes to urlList
    });

    // Test Case 2: Adding a new URL
    test('should add a new activeUrl to urlList if it does not exist', () => {
      // setup
      const newUrl = 'http://example.com/new-page';
      const elapsedTime = 3000;
      trackerObj.activeUrl = newUrl;
      const initialLength = trackerObj.urlList.length;

      // exercises
      trackerObj.addActiveTime(elapsedTime);

      // test / check
      const finalLength = trackerObj.urlList.length;
      const addedItem = trackerObj.urlList[finalLength - 1]; // The newly added item
      expect(finalLength).toBe(initialLength + 1);
      expect(addedItem.url).toBe(newUrl);
      expect(addedItem.totalTime).toBe(elapsedTime);
    });

    // Test Case 3: Updating an existing URL
    test('should update totalTime for an existing activeUrl in urlList', () => {
      const existingUrl = 'http://example.com/page1';
      const initialTime = 5000;
      const elapsedTime = 2000;

      // Set up existing URL in urlList
      trackerObj.urlList.push({ url: existingUrl, totalTime: initialTime });
      // Set activeUrl to the existing URL
      trackerObj.activeUrl = existingUrl;
      const initialLength = trackerObj.urlList.length;

      trackerObj.addActiveTime(elapsedTime);

      const finalLength = trackerObj.urlList.length;
      const updatedItem = trackerObj.urlList.find(
        (item) => item.url === existingUrl
      );

      expect(finalLength).toBe(initialLength); // Length should not change
      expect(updatedItem.url).toBe(existingUrl);
      expect(updatedItem.totalTime).toBe(initialTime + elapsedTime);
    });

    // Test Case 4: Adding a new URL when other URLs already exist
    test('should add a new activeUrl without affecting other existing URLs in the list', () => {
      const existingUrl1 = 'http://example.com/old-page-1';
      const existingTime1 = 1000;
      const existingUrl2 = 'http://example.com/old-page-2';
      const existingTime2 = 2000;
      const newUrl = 'http://example.com/brand-new-page';
      const elapsedTime = 500;

      trackerObj.urlList.push(
        { url: existingUrl1, totalTime: existingTime1 },
        { url: existingUrl2, totalTime: existingTime2 }
      );
      trackerObj.activeUrl = newUrl;
      const initialLength = trackerObj.urlList.length;

      trackerObj.addActiveTime(elapsedTime);

      const finalLength = trackerObj.urlList.length;
      const addedItem = trackerObj.urlList.find((item) => item.url === newUrl);

      expect(finalLength).toBe(initialLength + 1);
      expect(trackerObj.urlList).toContainEqual({
        url: existingUrl1,
        totalTime: existingTime1,
      });
      expect(trackerObj.urlList).toContainEqual({
        url: existingUrl2,
        totalTime: existingTime2,
      });
      expect(addedItem.url).toBe(newUrl);
      expect(addedItem.totalTime).toBe(elapsedTime);
    });

    // Test Case 5: elapsedTime is zero for an existing URL
    test('should update totalTime correctly when elapsedTime is zero for an existing URL', () => {
      const existingUrl = 'http://example.com/page-zero';
      const initialTime = 10000;
      const elapsedTime = 0;

      trackerObj.activeUrl = existingUrl;
      trackerObj.urlList.push({ url: existingUrl, totalTime: initialTime });

      trackerObj.addActiveTime(elapsedTime);

      const updatedItem = trackerObj.urlList.find(
        (item) => item.url === existingUrl
      );
      expect(updatedItem.totalTime).toBe(initialTime); // Time should remain the same
    });

    // Test Case 6: elapsedTime is zero for a new URL
    test('should add a new URL with totalTime zero when elapsedTime is zero', () => {
      const newUrl = 'http://example.com/new-page-zero';
      const elapsedTime = 0;

      trackerObj.activeUrl = newUrl;
      const initialLength = trackerObj.urlList.length;

      trackerObj.addActiveTime(elapsedTime);

      const finalLength = trackerObj.urlList.length;
      const addedItem = trackerObj.urlList.find((item) => item.url === newUrl);

      expect(finalLength).toBe(initialLength + 1);
      expect(addedItem.url).toBe(newUrl);
      expect(addedItem.totalTime).toBe(0);
    });
  });

  describe('appendListItem', () => {
    test('should append a new URL to the list', () => {
      // setup
      const initialLength = trackerObj.urlList.length;
      const urlToAppend = 'simple-test.com';
      // exercises
      const result = trackerObj.appendListItem(urlToAppend);
      // test / check
      const finalLength = trackerObj.urlList.length;
      const addedItem = trackerObj.urlList[finalLength - 1];
      expect(result).toBe(true);
      expect(finalLength).toBe(initialLength + 1);
      expect(addedItem.url).toBe(urlToAppend);
      expect(addedItem.totalTime).toBe(0);
    });

    test('should return false and not append if the URL already exists', () => {
      // setup
      const existingUrl = 'simple.com';
      trackerObj.urlList.push({ url: existingUrl, totalTime: 4 });
      const initialLength = trackerObj.urlList.length;
      // exercises
      const result = trackerObj.appendListItem(existingUrl);
      // test / check
      const finalLength = trackerObj.urlList.length;
      expect(result).toBe(false);
      expect(finalLength).toBe(initialLength);
    });
  });

  describe('startSession', () => {
    test('should set startTime, activeUrl, and lastActiveUrl for a new session', () => {
      // setup
      const testUrl = 'new-session.com';
      const testTime = new Date(2024, 0, 7, 10, 0, 0, 0);
      // exercises
      trackerObj.startSession(testUrl, testTime);
      // test / check
      expect(trackerObj.startTime).toBe(testTime);
      expect(trackerObj.activeUrl).toBe(testUrl);
      expect(trackerObj.lastActiveUrl).toBeNull();
    });
  });

  describe('endSession', () => {
    let trackerObj;
    // Define time intervals in milliseconds
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
    const TWENTY_MINUTES_MS = 20 * 60 * 1000;
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;

    // Use a default time interval in milliseconds for the tests
    const DEFAULT_TIME_INTERVAL_MS = FIFTEEN_MINUTES_MS;

    beforeEach(() => {
      trackerObj = new UrlDataObj();
    });

    // Test Case 1: activeUrl is null
    test('should log an error and return if activeUrl is null', () => {
      const testCurrentDate = new Date('2025-01-01T10:00:00.000Z'); // Always pass a date
      trackerObj.activeUrl = null; // Ensure activeUrl is null
      trackerObj.startTime = null; // Ensure startTime is null
      trackerObj.lastCheckDate = null; // Ensure lastCheckDate is null

      trackerObj.endSession(DEFAULT_TIME_INTERVAL_MS, testCurrentDate);

      expect(trackerObj.urlList).toHaveLength(0); // urlList should remain unchanged
      expect(trackerObj.activeUrl).toBeNull(); // Should still be null
      expect(trackerObj.startTime).toBeNull(); // Should still be null
      expect(trackerObj.lastActiveUrl).toBeNull(); // Should still be null
    });

    // Test Case 2: Ending session for an existing URL when time is within interval
    test('should update totalTime, set lastActiveUrl, and reset activeUrl/startTime for an existing URL when time is within interval', () => {
      const url = 'http://test.com/existing';
      const initialTotalTime = 1000;
      const sessionStartTime = new Date('2025-01-01T10:00:00.000Z');
      // End time 5 minutes after start (within 15 min interval)
      const sessionEndTime = new Date(sessionStartTime.getTime() + FIVE_MINUTES_MS);
      const expectedElapsedTime = sessionEndTime.getTime() - sessionStartTime.getTime(); // 5 minutes in ms
      const expectedNewTotalTime = initialTotalTime + expectedElapsedTime;

      trackerObj.urlList.push({ url: url, totalTime: initialTotalTime });
      trackerObj.activeUrl = url;
      trackerObj.startTime = sessionStartTime;
      trackerObj.lastCheckDate = sessionStartTime; // For calcTimeElapsed to work correctly

      trackerObj.endSession(DEFAULT_TIME_INTERVAL_MS, sessionEndTime);

      const updatedItem = trackerObj.urlList.find((item) => item.url === url);

      expect(updatedItem.totalTime).toBe(expectedNewTotalTime);
      expect(trackerObj.lastActiveUrl).toBe(url);
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
    });

    // Test Case 3: Ending session for an existing URL when time is NOT within interval (factor of 2)
    test('should NOT update totalTime if elapsed time is NOT within interval for an existing URL (factor of 2 and a bit..)', () => {
      const url = 'http://test.com/existing-outside-factor-2';
      const initialTotalTime = 1000;
      const sessionStartTime = new Date('2025-01-01T10:00:00.000Z');
      // End time 2x the DEFAULT_TIME_INTERVAL_MS after start (30 minutes after start)
      const sessionEndTime = new Date(sessionStartTime.getTime() + (DEFAULT_TIME_INTERVAL_MS * 2 + 1));

      trackerObj.urlList.push({ url: url, totalTime: initialTotalTime });
      trackerObj.activeUrl = url;
      trackerObj.startTime = sessionStartTime;
      trackerObj.lastCheckDate = sessionStartTime;

      trackerObj.endSession(DEFAULT_TIME_INTERVAL_MS, sessionEndTime);
      console.log(trackerObj)

      const updatedItem = trackerObj.urlList.find((item) => item.url === url);

      expect(updatedItem.totalTime).toBe(initialTotalTime); // totalTime should remain unchanged
      expect(trackerObj.lastActiveUrl).toBe(url);
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
    });

    // Test Case 4: Ending session for a new URL when time is within interval
    test('should add the activeUrl to urlList and update time, set lastActiveUrl, and reset activeUrl/startTime for a new URL when time is within interval', () => {
      const url = 'http://test.com/new-url';
      const sessionStartTime = new Date('2025-01-01T11:00:00.000Z');
      // End time 10 minutes after start (within 15 min interval)
      const sessionEndTime = new Date(sessionStartTime.getTime() + TEN_MINUTES_MS);
      const expectedElapsedTime = sessionEndTime.getTime() - sessionStartTime.getTime(); // 10 minutes in ms

      trackerObj.activeUrl = url;
      trackerObj.startTime = sessionStartTime;
      trackerObj.lastCheckDate = sessionStartTime; // For calcTimeElapsed to work correctly
      trackerObj.urlList = []; // Ensure it's empty

      trackerObj.endSession(DEFAULT_TIME_INTERVAL_MS, sessionEndTime);

      const newItem = trackerObj.urlList.find((item) => item.url === url);

      expect(newItem).toBeDefined();
      expect(newItem.url).toBe(url);
      expect(newItem.totalTime).toBe(expectedElapsedTime);
      expect(trackerObj.lastActiveUrl).toBe(url);
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
    });

    // Test Case 5: Ending session for a new URL when time is NOT within interval
    test('Should add the activeUrl to urlList if elapsed time is within interval * 2 for a new URL', () => {
      const url = 'http://test.com/new-url-added';
      const sessionStartTime = new Date('2025-01-01T13:00:00.000Z');
      // End time 20 minutes after start (outside 15 min interval)
      const sessionEndTime = new Date(sessionStartTime.getTime() + TWENTY_MINUTES_MS);

      trackerObj.activeUrl = url;
      trackerObj.startTime = sessionStartTime;
      trackerObj.lastCheckDate = sessionStartTime;
      trackerObj.urlList = []; // Ensure it's empty

      trackerObj.endSession(DEFAULT_TIME_INTERVAL_MS, sessionEndTime);

      const newItem = trackerObj.urlList.find((item) => item.url === url);

      expect(trackerObj.urlList).toHaveLength(1);
      expect(trackerObj.lastActiveUrl).toBe(url);
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
      expect(newItem.url).toBe(url);
      expect(newItem.totalTime).toBe(1200000);
    });

    // Test Case 6: Ensures lastActiveUrl is only set if activeUrl was not null
    test('should not set lastActiveUrl if activeUrl was initially null', () => {
      const testCurrentDate = new Date('2025-01-01T10:00:00.000Z'); // Always pass a date
      trackerObj.activeUrl = null;
      trackerObj.startTime = null;
      trackerObj.lastCheckDate = null;
      trackerObj.lastActiveUrl = 'http://previous.com'; // Some previous value

      trackerObj.endSession(DEFAULT_TIME_INTERVAL_MS, testCurrentDate);

      expect(trackerObj.lastActiveUrl).toBe('http://previous.com'); // lastActiveUrl should remain unchanged
    });

    // Test Case 7: When timeInterval parameter is used correctly (custom interval in MS)
    test('should correctly apply a custom timeInterval in milliseconds', () => {
      const customTimeIntervalMs = THIRTY_MINUTES_MS; // 30 minutes in milliseconds
      const url = 'http://test.com/custom-interval';
      const sessionStartTime = new Date('2025-01-01T15:00:00.000Z');
      // End 10 minutes later (within 30 min interval)
      const sessionEndTime = new Date(sessionStartTime.getTime() + TEN_MINUTES_MS);

      trackerObj.activeUrl = url;
      trackerObj.startTime = sessionStartTime;
      trackerObj.lastCheckDate = sessionStartTime;

      trackerObj.endSession(customTimeIntervalMs, sessionEndTime);

      // Expect time to be added because 10 minutes is <= 30 minutes
      const updatedItem = trackerObj.urlList.find((item) => item.url === url);
      expect(updatedItem.totalTime).toBe(sessionEndTime.getTime() - sessionStartTime.getTime());

      expect(trackerObj.lastActiveUrl).toBe(url);
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
    });

    // Test Case 8: Custom timeInterval in MS, elapsed time slightly over the interval
    test('Item should update totalTime if elapsed time is slightly over the custom timeInterval (in MS)', () => {
      const customTimeIntervalMs = TEN_MINUTES_MS; // 10 minutes in milliseconds
      const url = 'http://test.com/over-interval';
      const sessionStartTime = new Date('2025-01-01T16:00:00.000Z');
      // End 10 minutes and 1 millisecond later (slightly over 10 min interval)
      const sessionEndTime = new Date(sessionStartTime.getTime() + TEN_MINUTES_MS + 1);

      trackerObj.urlList.push({ url: url, totalTime: 5000 }); // Existing total time
      trackerObj.activeUrl = url;
      trackerObj.startTime = sessionStartTime;
      trackerObj.lastCheckDate = sessionStartTime;

      trackerObj.endSession(customTimeIntervalMs, sessionEndTime);

      // Expect totalTime to remain unchanged
      const updatedItem = trackerObj.urlList.find((item) => item.url === url);
      expect(updatedItem.totalTime).toBe(sessionEndTime - sessionStartTime + 5000); // totalTime + elapsedTime calculation

      expect(trackerObj.lastActiveUrl).toBe(url);
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
    });

    // Test Case 9: Custom timeInterval in MS, elapsed time exactly at the interval limit
    test('should update totalTime if elapsed time is exactly at the custom timeInterval limit (in MS)', () => {
      const customTimeIntervalMs = FIVE_MINUTES_MS; // 5 minutes in milliseconds
      const url = 'http://test.com/exact-interval';
      const sessionStartTime = new Date('2025-01-01T17:00:00.000Z');
      // End exactly 5 minutes later
      const sessionEndTime = new Date(sessionStartTime.getTime() + FIVE_MINUTES_MS);
      const expectedElapsedTime = FIVE_MINUTES_MS;

      trackerObj.urlList.push({ url: url, totalTime: 2000 }); // Existing total time
      trackerObj.activeUrl = url;
      trackerObj.startTime = sessionStartTime;
      trackerObj.lastCheckDate = sessionStartTime;

      trackerObj.endSession(customTimeIntervalMs, sessionEndTime);

      // Expect totalTime to be updated
      const updatedItem = trackerObj.urlList.find((item) => item.url === url);
      expect(updatedItem.totalTime).toBe(2000 + expectedElapsedTime);

      expect(trackerObj.lastActiveUrl).toBe(url);
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
    });
  });




  describe('calcTimeElapsed', () => {
    let trackerObj;
    let fixedStartTime;
    let fixedLastCheckTime;

    beforeEach(() => {
      trackerObj = new UrlDataObj();
      // Set fixed times for consistent testing
      fixedStartTime = new Date(2024, 0, 7, 10, 0, 0, 0); // Jan 7, 2024, 10:00:00
      fixedLastCheckTime = new Date(2024, 0, 7, 10, 0, 0, 0); // Jan 7, 2024, 10:00:00
      trackerObj.startTime = fixedStartTime;
      trackerObj.lastDateCheck = fixedLastCheckTime;
    });

    test('should return the smaller of startElapsed and lastCheckElapsed when both are positive', () => {
      // setup
      const currentTime = new Date(2024, 0, 7, 10, 10, 0, 0); // 10 minutes later

      // exercise
      const time = trackerObj.calcTimeElapsed(currentTime);

      // test / check
      expect(time).toBe(600000); // 10 minutes in milliseconds
    });

    test('should return startElapsed when it is smaller', () => {
      // setup

      trackerObj.startTime = new Date(2024, 0, 7, 10, 5, 0, 0); // 10:05:00 (Start: 5 mins elapsed)
      trackerObj.lastDateCheck = new Date(2024, 0, 7, 10, 0, 0, 0); // 10:00:00 (Last Check: 10 mins elapsed)
      const currentTime = new Date(2024, 0, 7, 10, 10, 0, 0); // 10:10:00

      // exercise
      const time = trackerObj.calcTimeElapsed(currentTime);

      // test / check
      expect(time).toBe(300000); // 5 minutes (currentTime - lastDateCheck)
    });

    test('should return lastCheckElapsed when it is smaller', () => {
      // setup
      trackerObj.startTime = new Date(2024, 0, 7, 10, 0, 0, 0); // 10:00:00 (Start: 10 mins elapsed)
      trackerObj.lastDateCheck = new Date(2024, 0, 7, 10, 5, 0, 0); // 10:05:00 (Last Check: 5 mins elapsed)
      const currentTime = new Date(2024, 0, 7, 10, 10, 0, 0); // 10:10:00

      // exercise
      const time = trackerObj.calcTimeElapsed(currentTime);

      // test / check
      expect(time).toBe(300000); // 5 minutes (currentTime - lastDateCheck)
    });

    test('should use current system time if no currentTime is provided', () => {
      // This test relies on a stable time window, which can be tricky.
      // For a more robust test, consider mocking `new Date()`.
      const now = new Date();
      trackerObj.startTime = new Date(now.getTime() - 1000); // 1 second ago
      trackerObj.lastDateCheck = new Date(now.getTime() - 500); // 0.5 seconds ago

      const time = trackerObj.calcTimeElapsed();
      expect(time).toBeGreaterThanOrEqual(450); // Should be around 500ms, allowing for execution time
      expect(time).toBeLessThanOrEqual(550);
    });

    test('should return 0 if startTime is in the future relative to currentTime', () => {
      // setup
      trackerObj.startTime = new Date(2024, 0, 7, 10, 10, 0, 0); // 10:10:00 (Future start time)
      trackerObj.lastDateCheck = new Date(2024, 0, 7, 10, 0, 0, 0); // 10:00:00 (Past check time)
      const currentTime = new Date(2024, 0, 7, 10, 5, 0, 0); // 10:05:00 (Earlier than startTime)

      // exercise
      const time = trackerObj.calcTimeElapsed(currentTime);

      // test / check
      // startElapsed becomes (10:05 - 10:10) = -5 minutes, then clamped to 0.
      // lastCheckElapsed becomes (10:05 - 10:00) = 5 minutes.
      // Math.min(0, 5 minutes) should be 0.
      expect(time).toBe(0);
    });

    test('should return 0 if lastDateCheck is in the future relative to currentTime', () => {
      // setup
      trackerObj.startTime = new Date(2024, 0, 7, 10, 0, 0, 0); // 10:00:00 (Past start time)
      trackerObj.lastDateCheck = new Date(2024, 0, 7, 10, 10, 0, 0); // 10:10:00 (Future check time)
      const currentTime = new Date(2024, 0, 7, 10, 5, 0, 0); // 10:05:00 (Earlier than lastDateCheck)

      // exercise
      const time = trackerObj.calcTimeElapsed(currentTime);

      // test / check
      // startElapsed becomes (10:05 - 10:00) = 5 minutes.
      // lastCheckElapsed becomes (10:05 - 10:10) = -5 minutes, then clamped to 0.
      // Math.min(5 minutes, 0) should be 0.
      expect(time).toBe(0);
    });

    test('should handle zero elapsed time correctly', () => {
      // setup
      const currentTime = new Date(2024, 0, 7, 10, 0, 0, 0); // Same as start and last check times

      // exercise
      const time = trackerObj.calcTimeElapsed(currentTime);

      // test / check
      expect(time).toBe(0);
    });
  });

  describe('toJSONString', () => {
    test('should return a JSON string representation of the UrlDataObj', () => {
      // setup
      const testUrl1 = 'test-url-1.com';
      const testUrl2 = 'test-url-2.com';
      const startTime = new Date(2024, 0, 1, 10, 0, 0);
      const lastDateCheck = new Date(2024, 0, 15, 12, 30, 0); // Added

      trackerObj.activeUrl = testUrl1;
      trackerObj.lastActiveUrl = 'last-active.com';
      trackerObj.startTime = startTime;
      trackerObj.lastDateCheck = lastDateCheck; // Added
      trackerObj.urlList = [
        { url: testUrl1, totalTime: 1800 },
        { url: testUrl2, totalTime: 0 },
      ];

      // exercises
      const jsonOutput = trackerObj.toJSONString();

      // test / check
      const expectedOutput = JSON.stringify({
        activeUrl: testUrl1,
        lastActiveUrl: 'last-active.com',
        startTime: startTime.toISOString(),
        lastDateCheck: lastDateCheck.toISOString(), // Added
        urlList: [
          { url: testUrl1, totalTime: 1800 },
          { url: testUrl2, totalTime: 0 },
        ],
      });
      expect(jsonOutput).toBe(expectedOutput);
    });

    test('should handle null dates gracefully when converting to JSON', () => {
      trackerObj.activeUrl = 'some-url.com';
      trackerObj.urlList = [];

      const jsonOutput = trackerObj.toJSONString();
      const expectedOutput = JSON.stringify({
        activeUrl: 'some-url.com',
        lastActiveUrl: null,
        startTime: null,
        lastDateCheck: null,
        urlList: [],
      });
      expect(jsonOutput).toBe(expectedOutput);
    });

    test('should handle null dates gracefully when converting to JSON', () => {
      trackerObj.activeUrl = 'some-url.com';
      trackerObj.urlList = [];

      const jsonOutput = trackerObj.toJSONString();
      const expectedOutput = JSON.stringify({
        activeUrl: 'some-url.com',
        lastActiveUrl: null,
        startTime: null,
        lastDateCheck: null,
        urlList: [],
      });
      expect(jsonOutput).toBe(expectedOutput);
    });
  });

  describe('fromJSONString', () => {
    test('should correctly parse a JSON string and populate the UrlDataObj', () => {
      // setup
      const testUrl1 = 'test-url-1.com';
      const testUrl2 = 'test-url-2.com';
      const startTime = new Date(2024, 0, 1, 10, 0, 0);
      const lastDateCheck = new Date(2024, 0, 15, 12, 30, 0); // Added

      const jsonString = JSON.stringify({
        activeUrl: testUrl1,
        lastActiveUrl: 'lastActiveUrl',
        startTime: startTime.toISOString(),
        lastDateCheck: lastDateCheck.toISOString(), // Added
        urlList: [
          { url: testUrl1, totalTime: 1800 },
          { url: testUrl2, totalTime: 0 },
        ],
      });
      let parsedTrackerObj = new UrlDataObj();

      // exercises
      parsedTrackerObj = parsedTrackerObj.fromJSONString(jsonString);

      // test / check
      expect(parsedTrackerObj.activeUrl).toBe(testUrl1);
      expect(parsedTrackerObj.lastActiveUrl).toBe('lastActiveUrl');
      expect(parsedTrackerObj.startTime?.getTime()).toBe(startTime.getTime());
      expect(parsedTrackerObj.lastDateCheck?.getTime()).toBe(
        lastDateCheck.getTime()
      ); // Added
      expect(parsedTrackerObj.urlList).toEqual([
        { url: testUrl1, totalTime: 1800 },
        { url: testUrl2, totalTime: 0 },
      ]);
    });

    test('should handle null dates gracefully when parsing from JSON', () => {
      const jsonString = JSON.stringify({
        activeUrl: 'another-url.com',
        lastActiveUrl: null,
        startTime: null,
        lastDateCheck: null,
        urlList: [],
      });

      const parsedTrackerObj = new UrlDataObj().fromJSONString(jsonString);

      expect(parsedTrackerObj.activeUrl).toBe('another-url.com');
      expect(parsedTrackerObj.lastActiveUrl).toBeNull();
      expect(parsedTrackerObj.startTime).toBeNull();
      expect(parsedTrackerObj.lastDateCheck).toBeNull();
      expect(parsedTrackerObj.urlList).toEqual([]);
    });
  });

  describe('toJSONString and fromJSONString integration', () => {
    test('should correctly serialize and then deserialize a UrlDataObj', () => {
      // setup
      const testUrl1 = 'test-url-1.com';
      const testUrl2 = 'test-url-2.com';
      const startTime = new Date(2024, 0, 1, 10, 0, 0);
      const lastDateCheck = new Date(2024, 0, 15, 12, 30, 0); // Added

      const originalTrackerObj = new UrlDataObj();
      originalTrackerObj.activeUrl = testUrl1;
      originalTrackerObj.lastActiveUrl = 'lastActiveUrl';
      originalTrackerObj.startTime = startTime;
      originalTrackerObj.lastDateCheck = lastDateCheck; // Added
      originalTrackerObj.urlList = [
        { url: testUrl1, totalTime: 1800 },
        { url: testUrl2, totalTime: 0 },
      ];

      // exercises
      const jsonString = originalTrackerObj.toJSONString();
      const reconstructedTrackerObj = new UrlDataObj().fromJSONString(
        jsonString
      );

      // test / check
      expect(reconstructedTrackerObj.activeUrl).toBe(
        originalTrackerObj.activeUrl
      );
      expect(reconstructedTrackerObj.lastActiveUrl).toBe(
        originalTrackerObj.lastActiveUrl
      );
      expect(reconstructedTrackerObj.startTime?.getTime()).toBe(
        originalTrackerObj.startTime?.getTime()
      );
      expect(reconstructedTrackerObj.lastDateCheck?.getTime()).toBe(
        // Added
        originalTrackerObj.lastDateCheck?.getTime()
      );
      expect(reconstructedTrackerObj.urlList).toEqual(
        originalTrackerObj.urlList
      );
    });

    test('should handle serialization and deserialization with null dates', () => {
      const originalTrackerObj = new UrlDataObj();
      originalTrackerObj.activeUrl = 'null-date-url.com';
      originalTrackerObj.urlList = [];

      const jsonString = originalTrackerObj.toJSONString();
      const reconstructedTrackerObj = new UrlDataObj().fromJSONString(
        jsonString
      );

      expect(reconstructedTrackerObj.activeUrl).toBe('null-date-url.com');
      expect(reconstructedTrackerObj.lastActiveUrl).toBeNull();
      expect(reconstructedTrackerObj.startTime).toBeNull();
      expect(reconstructedTrackerObj.lastDateCheck).toBeNull();
      expect(reconstructedTrackerObj.urlList).toEqual([]);
    });
  });
});
