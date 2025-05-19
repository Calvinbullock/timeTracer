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
    test('should update totalTime, set activeUrl to null, startTime to null, and lastActiveUrl', () => {
      // setup
      const testUrl = 'test-url.com';
      trackerObj.activeUrl = testUrl;
      trackerObj.startTime = new Date(2024, 0, 1, 10, 0, 0);
      trackerObj.urlList.push({ url: testUrl, totalTime: 4 });
      const endTime = new Date(2024, 0, 1, 10, 30, 0);
      const expectedElapsedTime = endTime - trackerObj.startTime + 4;
      // exercises
      trackerObj.endSession(endTime);
      // test / check
      const targetItem = trackerObj.urlList.find(
        (item) => item.url === testUrl
      );
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
      expect(trackerObj.lastActiveUrl).toBe(testUrl);
      expect(targetItem).toBeDefined();
      expect(targetItem.totalTime).toBe(expectedElapsedTime);
    });

    test('should handle ending a session when no session is active', () => {
      // setup
      // exercises
      trackerObj.endSession();
      // test / check
      expect(trackerObj.urlList.length).toBe(0);
      expect(trackerObj.activeUrl).toBeNull();
      expect(trackerObj.startTime).toBeNull();
      expect(trackerObj.lastActiveUrl).toBeNull();
    });
  });

  describe('calcTimeElapsed', () => {
    test('should calculate time elapsed in milliseconds (minutes)', () => {
      // setup
      const startDate = new Date(2024, 0, 7, 10, 30, 0, 0);
      const endDate = new Date(2024, 0, 7, 10, 40, 0, 0);
      // exercises
      const time = trackerObj.calcTimeElapsed(startDate, endDate);
      // test / check
      expect(time).toBe(600000);
    });

    test('should calculate time elapsed in milliseconds (hours)', () => {
      // setup
      const startDate = new Date(2024, 0, 7, 10, 30, 0, 0);
      const endDate = new Date(2024, 0, 7, 11, 30, 0, 0);
      // exercises
      const time = trackerObj.calcTimeElapsed(startDate, endDate);
      // test / check
      expect(time).toBe(3600000);
    });

    test('should return null for an invalid startDate', () => {
      // setup
      const invalidStartDate = 'not a date';
      const endDate = new Date();
      // exercises
      const time = trackerObj.calcTimeElapsed(invalidStartDate, endDate);
      // test / check
      expect(time).toBeNull();
    });

    test('should return null for an invalid endDate', () => {
      // setup
      const startDate = new Date();
      const invalidEndDate = 'also not a date';
      // exercises
      const time = trackerObj.calcTimeElapsed(startDate, invalidEndDate);
      // test / check
      expect(time).toBeNull();
    });

    test('should return null if startDate is not a Date object', () => {
      // setup
      const startDate = 'January 7, 2024, 11:00 AM';
      const endDate = new Date(2024, 0, 7, 11, 30, 0, 0);
      // exercises
      const time = trackerObj.calcTimeElapsed(startDate, endDate);
      // test / check
      expect(time).toBeNull();
    });

    test('should correctly calculate time elapsed when startDate is a Date object created from JSON', () => {
      // setup
      let startDate = new Date(2024, 0, 7, 11, 0, 0, 0);
      const endDate = new Date(2024, 0, 7, 11, 0, 0, 0);
      startDate = JSON.stringify(startDate.toISOString());
      startDate = JSON.parse(startDate);
      startDate = new Date(startDate);
      // exercises
      const time = trackerObj.calcTimeElapsed(startDate, endDate);
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
      trackerObj.activeUrl = testUrl1;
      trackerObj.lastActiveUrl = 'last-active.com';
      trackerObj.startTime = startTime;
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
        urlList: [
          { url: testUrl1, totalTime: 1800 },
          { url: testUrl2, totalTime: 0 },
        ],
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
      const jsonString = JSON.stringify({
        activeUrl: testUrl1,
        lastActiveUrl: 'lastActiveUrl',
        startTime: startTime.toISOString(),
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
      expect(parsedTrackerObj.urlList).toEqual([
        { url: testUrl1, totalTime: 1800 },
        { url: testUrl2, totalTime: 0 },
      ]);
    });
  });

  describe('toJSONString and fromJSONString integration', () => {
    test('should correctly serialize and then deserialize a UrlDataObj', () => {
      // setup
      const testUrl1 = 'test-url-1.com';
      const testUrl2 = 'test-url-2.com';
      const startTime = new Date(2024, 0, 1, 10, 0, 0);
      const originalTrackerObj = new UrlDataObj();
      originalTrackerObj.activeUrl = testUrl1;
      originalTrackerObj.lastActiveUrl = 'lastActiveUrl';
      originalTrackerObj.startTime = startTime;
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
      expect(reconstructedTrackerObj.urlList).toEqual(
        originalTrackerObj.urlList
      );
    });
  });
});
