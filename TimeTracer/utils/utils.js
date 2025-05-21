/**
 * @fileoverview This file contains various utility functions (the bulk of the code)
 * used throughout the application. These functions include URL manipulation
 * (cleaning), data searching within arrays, and time format conversions
 * (milliseconds to minutes, milliseconds to hours and minutes). And the tests
 * for said utility functions.
 *
 * @author: Calvin Bullock
 * @date Date of creation: April, 2025
 */

// ===================================================== \\
// ===================================================== \\
//                      Utilities
// ===================================================== \\
// ===================================================== \\

function formatDateTime() {
  const now = new Date();

  // Format time (HH:MM:SS)
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;

  // Format date (YYYY/MM/DD)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}/${month}/${day}`;

  return `${dateString} ${timeString}`;
}

/**
 * Logs a message to the console, optionally adding empty lines before and after for better readability.
 *
 * @param {string} msg The message to be logged.
 * @param {boolean} [buffer=false] If true, adds an empty line before and after the log message. Defaults to false.
 */
function __logger__(msg, buffer = false) {
  let timeStamp = formatDateTime();
  if (buffer) {
    console.log('');
    console.log(`${timeStamp} - ${msg}`);
    console.log('');
  } else {
    console.log(`${timeStamp} - ${msg}`);
  }
}

/**
 * Searches an array of data objects for a specific URL and returns its index.
 *
 * This function iterates through an array of data objects, comparing the 'url' property of each
 * object to the provided target URL.  It returns the index of the first object where the URLs match.
 *
 * @param {string} targetUrl - The URL to search for.
 * @param {Array<{url: string}>} dataList - An array of data objects, each containing a 'url'
 *      property (string).
 * @returns {number} The index of the object with the matching URL, or -1 if no match is found.
 *
 * @example
 * const data = [{ url: 'a' }, { url: 'b' }, { url: 'c' }];
 * // Returns 1
 * searchDataUrls('b', data);
 *
 * @example
 * const data = [{ url: 'a' }, { url: 'b' }, { url: 'c' }];
 * // Returns -1
 * searchDataUrls('d', data);
 */
function searchDataUrls(targetUrl, dataList) {
  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].url === targetUrl) {
      return i;
    }
  }
  return -1;
}

/**
 * Cleans and simplifies a URL string.
 *
 * This function takes a URL string, removes any path, query parameters, or
 *  hash fragments, and optionally removes the "https://" protocol. It returns
 *  the cleaned URL origin.
 *
 * @param {string} url - The URL string to clean.
 * @returns {string|null} The cleaned URL origin (e.g., "example.com"), or
 *      null if the URL is invalid or empty.
 *
 * @example
 * // Returns "example.com"
 * cleanUrl("https://example.com/path/to/resource?query=string#hash");
 */
// TODO: maybe change this function name??
function cleanUrl(url) {
  if (!url) {
    return null;
  }

  try {
    // remove all other gunk after target
    const urlObj = new URL(url);
    let baseUrl = urlObj.origin;

    // remove `https://`
    if (baseUrl.startsWith('https://')) {
      return baseUrl.substring(8);
    }

    return baseUrl;
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return null;
  }
}

/**
 * Formats a Date object into a 'yyyy-mm-dd' string.
 * If no Date object is provided, the current date will be used.
 *
 * @param {Date} [dateKey=new Date()] - The Date object to format. Defaults to the current date.
 * @returns {string} The date formatted as 'yyyy-mm-dd'.
 *
 * @example
 * const todayKey = getDateKey(); // Returns the current date in 'yyyy-mm-dd' format (e.g., '2025-05-09')
 * const specificDateKey = getDateKey(new Date(2023, 11, 25)); // Returns '2023-12-25'
 */
function getDateKey(dateKey = new Date()) {
  // TODO: this needs to store the key and when the key changes run a end Session somehow...
  const year = dateKey.getFullYear();
  const month = String(dateKey.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
  const day = String(dateKey.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// END_IMPORT_HERE

// ===================================================== \\
// ===================================================== \\
//                      Utilities
// ===================================================== \\
// ===================================================== \\

/**
 * Converts a given number of minutes into milliseconds.
 *
 * @param {number} minutes - The duration in minutes that needs to be converted.
 * @returns {number} The equivalent duration in milliseconds.
 */
function convertMinutesToMilliseconds(minutes) {
  return minutes * 60 * 1000;
}

/**
 * Calculates the number of minutes from a given number of milliseconds.
 *
 * @param {number} milliseconds - The number of milliseconds.
 * @returns {number} The number of minutes.
 */
// TODO: add a converts to the name here
function minutesFromMilliseconds(milliseconds) {
  return milliseconds / (1000 * 60);
}

/**
 * Converts a given number of milliseconds into hours and minutes.
 *
 * @param {number} miliSecs - The total number of milliseconds.
 * @returns {string} A string representing the time in "X hr, Y min" format.
 * Returns "0 minutes" if the input is invalid.
 */
function formatMillisecsToHoursAndMinutes(miliSecs) {
  let minutes = minutesFromMilliseconds(miliSecs);

  // Input validation: Check if minutes is a valid number and is not negative
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return '0 min';
  }

  const hours = Math.trunc(minutes / 60);
  const remainingMinutes = Math.trunc(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes} min`;
  } else if (remainingMinutes === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr, ${remainingMinutes} min`;
  }
}

/**
 * Adjusts and updates URL activity time based on elapsed time since the last check.
 * This function calculates the time elapsed since the URL's start date and its last check,
 * then adds "active time" to the URL data based on whether this elapsed time falls
 * within or exceeds a specified interval. It also logs diagnostic messages for
 * significant time discrepancies.
 *
 * @param {UrlDataObj} urlData - An object containing URL-related data and methods.
 * Expected methods:
 * - `getStartDate()`: Returns the initial start date/timestamp of the URL.
 * - `getLastDateCheck()`: Returns the timestamp of the last time this URL was checked.
 * - `calcTimeElapsed(diff)`: Calculates elapsed time from a given difference (e.g., milliseconds to minutes).
 * - `addActiveTime(time)`: Adds the specified time (in minutes) to the URL's total active duration.
 * - `setLastDateCheck(date)`: Updates the last check date for the URL.
 * @param {number} timeInterval - The expected interval (in minutes) between checks.
 * @param {Date} [currentTime=new Date()] - The current time used for calculations. Defaults to the current system time.
 * @returns {UrlDataObj} The updated `urlData` object.
 */
function checkTimeAcuraccy(urlData, timeInterval, currentTime = new Date()) {
  // return if no active url
  if (!urlData.hasActiveUrl()) {
    return urlData;
  }

  // clac both elapsed times
  const startElapsed = urlData.calcTimeElapsed(urlData.getStartDate(), currentTime);
  const lastCheckElapsed = urlData.calcTimeElapsed(urlData.getLastDateCheck(), currentTime);

  // get the smaller of start and lastCheck in (milli secs)
  timeInterval = convertMinutesToMilliseconds(timeInterval);
  let timeElapsed = Math.min(startElapsed, lastCheckElapsed);

  // check if time Elapsed is less then / grater then the interval
  if (timeElapsed <= timeInterval) {
    urlData.addActiveTime(timeElapsed);

  } else if (timeElapsed > timeInterval * 2) {
    // no time is added here, this is invalid time path
    __logger__(`timeCheck was over, Elapsed = ${minutesFromMilliseconds(timeElapsed)} Minites, likly asleep.`);

  } else if (timeElapsed > timeInterval) {
    __logger__(
      `timeCheck was over timeInterval (${timeInterval} minutes) Elapsed = ${minutesFromMilliseconds(timeElapsed)} Minites.`
    );
    urlData.addActiveTime(timeInterval);
  }

  urlData.setLastDateCheck(currentTime);
  return urlData;
}

export {
  formatDateTime,
  __logger__,
  searchDataUrls,
  cleanUrl,
  getDateKey,
  minutesFromMilliseconds,
  convertMinutesToMilliseconds,
  formatMillisecsToHoursAndMinutes,
  checkTimeAcuraccy,
};
