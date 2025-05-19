
/**
 * @fileoverview This file contains the implementation and tests for the UrlDataObj
 * class, which is responsible for tracking and storing the time spent on different
 * URLs.
 *
 * @author: Calvin Bullock
 * @date Date of creation: April, 2025
 */

import { __logger__ } from "./utils.js";

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
    this.urlList = [];
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
     * Appends a new URL to the tracking list if it doesn't already exist.
     * If the URL is new, it's added to the list with an initial total tracking time of 0.
     *
     * @param {string} url - The URL to add to the tracking list.
     * @returns {boolean} - True if the URL was successfully appended (it was new),
     *      false otherwise (the URL already existed in the list).
     */
  appendListItem(url) {
    if (!this.urlList.some(item => item.url === url)) {
      this.urlList.push( { url: url, totalTime: 0 } );
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
      console.error("Error: startTime / activeUrl should never be true on enter ",
        "old startTime: ", this.startTime,
        "old activeUrl: ", this.activeUrl,
        "new startTime: ", currentTime,
        "new activeUrl: ", url
      );
    }
    __logger__(`Tracking starts for ${url}`);

    this.activeUrl = url;
    this.startTime = currentTime;
  }

  /**
     * Ends the currently active tracking session and records the elapsed time.
     * It finds the active URL in the urlList, calculates the time elapsed since
     * the 'startTime', adds it to the 'totalTime' of the corresponding item,
     * and resets the 'startDate' and 'isActive' properties of that item.
     * It also resets the 'activeUrl' and 'startTime' of the TrackingData object.
     * Logs an error if no active item is found.
     *
     * @param {Date} [currentTime=new Date()] - An optional Date object representing the
     * ending time of the session. Defaults to the current timestamp if not provided,
     * allowing for easier testing.
     */
  endSession(currentTime = new Date()) {
    __logger__(`Tracking exits for ${this.activeUrl}`);

    if (this.activeUrl == null) {
      console.error("Error: activeItem was null when endSession was called.");
      return; // if null nothing to add or update
    }

    const activeItem = this.urlList.find(item => item.url === this.activeUrl);
    const elapsedTime = this.calcTimeElapsed(this.startTime, currentTime);

    // update or add new url to urlList
    if (activeItem) {
      activeItem.totalTime += elapsedTime;
      __logger__(`${this.activeUrl} totalTime updated to ${activeItem.totalTime}`);

    } else {
      // TODO: update tests to cover this case
      // add item to list
      this.urlList.push( {
        url: this.activeUrl,
        totalTime: elapsedTime
      });
      __logger__(`${this.activeUrl} added to urlList`);
    }

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
      urlList: this.urlList.map(item => ({
        url: item.url,
        totalTime: item.totalTime
      }))
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
      if (!(typeof jsonString === "string")) {
        console.error("Error: jsonString not instance of String - fromJSONString()");
        console.error("jsonString Typeof:", typeof jsonString);
      }
      const jsonObj = JSON.parse(jsonString);

      const trackingData = new UrlDataObj();
      trackingData.activeUrl = jsonObj.activeUrl;
      trackingData.lastActiveUrl = jsonObj.lastActiveUrl;
      trackingData.startTime = jsonObj.startTime ? new Date(jsonObj.startTime) : null;
      trackingData.urlList = jsonObj.urlList ? jsonObj.urlList.map(item => ({
        url: item.url,
        totalTime: item.totalTime
      })) : [];

      return trackingData;

    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }

  /**
     * Calculates the time elapsed between a given start date and the current time, in milliseconds.
     *
     * @param {Date} useStartDate - The starting date to calculate the elapsed time from.
     * @returns {number} The time elapsed in milliseconds.
     */
  calcTimeElapsed(startDate, endDate) {

    // check if startDate is valid
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      console.error("TypeError: Parameter 'startDate' in calcTimeElapsed() must be a Date object.", startDate);
      console.trace();
      return null;
    }

    // check if endDate is valid
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      console.error("TypeError: Parameter 'endDate' in calcTimeElapsed() must be a Date object.", endDate);
      console.trace();
      return null;
    }

    return endDate - startDate;
  }
}

export {
  UrlDataObj
};
