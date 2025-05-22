/**
 * @fileoverview This file contains the implementation and tests for the UrlDataObj
 * class, which is responsible for tracking and storing the time spent on different
 * URLs.
 *
 * @author: Calvin Bullock
 * @date Date of creation: April, 2025
 */

import { __logger__, isTimeElapsedWithinInterval } from './utils.js';

// ===================================================== \\
// ===================================================== \\
//                     UrlDataObj
// ===================================================== \\
// ===================================================== \\

class UrlDataObj {
  constructor() {
    this.activeUrl = null;
    this.lastActiveUrl = null;
    this.startTime = null;
    this.lastDateCheck = null;
    this.urlList = [];
  }

  /**
   * Adds elapsed time to the currently active URL's total tracking time.
   *
   * If an `activeUrl` is set:
   * - It finds the corresponding URL item in `urlList`.
   * - If the URL exists, it increments its `totalTime` by the `elapsedTime`.
   * - If the URL does not exist, it adds a new entry to `urlList` with the `activeUrl`
   * and an initial `totalTime` equal to the `elapsedTime`.
   *
   * If `activeUrl` is null, an error is logged, and the function returns without
   * making any changes.
   *
   * @param {number} elapsedTime - The time duration in milliseconds to add to the active URL's total time.
   */
  addActiveTime(elapsedTime) {
    // check if there is an active url
    if (this.activeUrl == null) {
      __logger__('activeItem was null when addTime was called was called.');
      return;
    }

    // find url item (if exists)
    const activeItem = this.urlList.find((item) => item.url === this.activeUrl);

    // update or add new url to urlList
    if (activeItem) {
      activeItem.totalTime += elapsedTime;
      __logger__(
        `${this.activeUrl} totalTime updated to ${activeItem.totalTime}`
      );
    } else {
      // add item to list
      this.urlList.push({
        url: this.activeUrl,
        totalTime: elapsedTime,
      });
      __logger__(`${this.activeUrl} added to urlList`);
    }
  }

  /**
   * Checks if an active URL is currently set (i.e., not null).
   * @returns {boolean} True if an active URL string is present, false otherwise.
   */
  hasActiveUrl() {
    return this.activeUrl !== null;
  }

  /**
   * Retrieves the currently active URL being tracked.
   *
   * @returns {string} - The currently active URL, or an empty string if no URL is active.
   */
  getActiveUrl() {
    return this.activeUrl;
  }

  /**
   * Retrieves the last active URL that was being tracked.
   *
   * @returns {string|null} - The last active URL, or null if no URL has been active yet.
   */
  getLastActiveUrl() {
    return this.lastActiveUrl;
  }

  /**
   * Retrieves when the current url was set.
   *
   * @returns {Date|null} - The date the url was set as active.
   */
  getStartDate() {
    return this.startTime;
  }

  /**
   * Retrieves the last recorded date and time a check or update was performed.
   * This is typically used to track when the data was last synchronized or refreshed.
   *
   * @returns {Date|null} - The last date and time of the check, or null if it has not been set.
   */
  getLastDateCheck() {
    return this.lastDateCheck;
  }

  /**
   * Sets the last recorded date and time a check or update was performed.
   * This updates the internal timestamp for when the data was last synchronized or refreshed.
   *
   * @param {Date} date - The Date object representing the last check time.
   */
  setLastDateCheck(date) {
    this.lastDateCheck = date;
  }

  /**
   * Appends a new URL to the tracking list if it doesn't already exist.
   * If the URL is new, it's added to the list with an initial total tracking time of 0.
   *
   * @param {string} url - The URL to add to the tracking list.
   * @returns {boolean} - True if the URL was successfully appended (it was new),
   *      false otherwise (the URL already existed in the list).
   */
  appendListItem(url) {
    if (!this.urlList.some((item) => item.url === url)) {
      this.urlList.push({ url: url, totalTime: 0 });
      return true; // new item was appended
    }
    return false; // item already existed
  }

  /**
   * Starts a new tracking session for a given URL.
   * It sets the 'activeUrl' to the provided URL and the 'startTime' to the
   * provided 'currentTime' (or the current timestamp if not provided).
   * Logs an error and returns false if 'startTime' or 'activeUrl' are already
   * truthy when attempting to start a new session.
   *
   * @param {string} url - The URL to set as the currently active one to start tracking.
   * @param {Date} [currentTime=new Date()] - An optional Date object representing the
   * starting time of the session. Defaults to the current timestamp if not provided,
   * allowing for easier testing.
   * @returns {boolean} - True if the session was started successfully, false otherwise
   * (e.g., if a session was already active).
   */
  startSession(url, currentTime = new Date()) {
    if (this.startTime || this.activeUrl) {
      console.error(
        'Error: startTime / activeUrl should never be true on enter ',
        'old startTime: ',
        this.startTime,
        'old activeUrl: ',
        this.activeUrl,
        'new startTime: ',
        currentTime,
        'new activeUrl: ',
        url
      );
    }
    __logger__(`Tracking starts for ${url}`);

    this.activeUrl = url;
    this.startTime = currentTime;
  }

  /**
   * Ends the currently active URL tracking session and updates the tracked time.
   * This function calculates the elapsed time using `calcTimeElapsed` (which considers
   * both `startTime` and `lastDateCheck`). If this elapsed time falls within a
   * specified `timeInterval`, it adds the time to the active URL's total duration.
   * Finally, it updates the `lastActiveUrl`, clears the `activeUrl` and `startTime`
   * for this tracking object, and logs relevant status messages.
   *
   * @param {number} timeInterval - The expected interval (in minutes) used for comparison
   * when determining whether to add active time.
   * @param {Date} [currentTime=new Date()] - An optional Date object representing the
   * current time to use for calculations. Defaults
   * to the current timestamp if not provided.
   */
  // TODO: might be a better way to access timeInterval then passing it here
  endSession(timeInterval, currentTime = new Date()) {
    __logger__(`Tracking exits for ${this.activeUrl}`);

    if (this.activeUrl == null) {
      console.error('Error: activeItem was null when endSession was called.');
      return; // if null nothing to add or update
    }

    // find time elapsed, if its within timeInterval add the time
    let timeElapsed = this.calcTimeElapsed(timeInterval, currentTime);
    if (isTimeElapsedWithinInterval(timeElapsed, timeInterval)) {
      this.addActiveTime(timeElapsed);
    }

    // set active and last active urls
    __logger__(`ActiveUrl was: ${this.activeUrl}`);
    if (this.activeUrl != null) {
      this.lastActiveUrl = this.activeUrl;
      __logger__(`LastActiveUrl is: ${this.lastActiveUrl}`);
    }
    this.activeUrl = null;
    this.startTime = null;
  }

  /**
   * Converts the TrackingData object into a JSON string.
   * Date objects are converted to ISO 8601 string format for serialization.
   *
   * @returns {string} - A JSON string representing the TrackingData.
   * The string includes 'activeUrl', 'lastActiveUrl', 'startTime' (as an ISO string or null),
   * and 'urlList' (an array of objects with 'url' and 'totalTime' properties).
   */
  toJSONString() {
    const jsonObject = {
      activeUrl: this.activeUrl,
      lastActiveUrl: this.lastActiveUrl,
      startTime: this.startTime ? this.startTime.toISOString() : null,
      lastDateCheck: this.lastDateCheck
        ? this.lastDateCheck.toISOString()
        : null,
      urlList: this.urlList.map((item) => ({
        url: item.url,
        totalTime: item.totalTime,
      })),
    };
    return JSON.stringify(jsonObject);
  }

  /**
   * Creates a new UrlDataObj instance from a JSON string.
   * It attempts to parse the JSON string and populate the properties
   * of a new UrlDataObj. Date strings in the JSON are converted back
   * to Date objects. Handles potential JSON parsing errors and returns null
   * in case of an error.
   *
   * @param {string} jsonString - The JSON string to parse.
   * @returns {UrlDataObj|null} - A new UrlDataObj instance populated with
   * data from the JSON string, or null if an error occurred during parsing.
   */
  fromJSONString(jsonString) {
    try {
      // check the obj is of the right type
      if (!(typeof jsonString === 'string')) {
        console.error(
          'Error: jsonString not instance of String - fromJSONString()'
        );
        console.error('jsonString Typeof:', typeof jsonString);
      }
      const jsonObj = JSON.parse(jsonString);

      const trackingData = new UrlDataObj();
      trackingData.activeUrl = jsonObj.activeUrl;
      trackingData.lastActiveUrl = jsonObj.lastActiveUrl;

      trackingData.lastDateCheck = jsonObj.lastDateCheck
        ? new Date(jsonObj.lastDateCheck)
        : null;

      trackingData.startTime = jsonObj.startTime
        ? new Date(jsonObj.startTime)
        : null;
      trackingData.urlList = jsonObj.urlList
        ? jsonObj.urlList.map((item) => ({
            url: item.url,
            totalTime: item.totalTime,
          }))
        : [];

      return trackingData;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  }

  /**
   * Calculates the smaller of two elapsed times:
   * 1. Time elapsed since an initial start time (`this.startTime`).
   * 2. Time elapsed since the last recorded check time (`this.lastDateCheck`).
   *
   * @param {Date} [currentTime=new Date()] - The current time to use for calculations.
   *    Defaults to the current system time if not provided.
   * @returns {number} The minimum elapsed time in milliseconds.
   * @throws {AssertionError} If either `startElapsed` or `lastCheckElapsed` is
   *    negative, indicating a logical error where `currentTime` is earlier than a stored time.
   */
  calcTimeElapsed(currentTime = new Date()) {
    // clac both elapsed times
    let startElapsed = currentTime - this.startTime;
    let lastCheckElapsed = currentTime - this.lastDateCheck;

    // error check logs
    if(startElapsed < 0) {
      console.error('startElapsed was negative in calc elapsed time');
      startElapsed = 0;
    }
    if (lastCheckElapsed < 0) {
      console.error('lastCheckElapsed was negative in calc elapsed time');
      lastCheckElapsed = 0;
    }

    // return the smaller of start and lastCheck in (milli secs)
    return Math.min(startElapsed, lastCheckElapsed);
  }
}

export { UrlDataObj };
