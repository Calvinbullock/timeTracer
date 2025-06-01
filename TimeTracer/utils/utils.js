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
//                        Start Utils                    \\
// ===================================================== \\
// ===================================================== \\

/**
 * Formats a given date and time into a string with the format "YYYY/MM/DD HH:MM:SS".
 * If no date is provided, the current date and time will be used.
 *
 * @param {Date} [currDate=new Date()] - The date object to format. Defaults to the current date and time.
 * @returns {string} The formatted date and time string.
 */
function formatDateTime(currDate = new Date()) {
  // Format time (HH:MM:SS)
  const hours = String(currDate.getHours()).padStart(2, '0');
  const minutes = String(currDate.getMinutes()).padStart(2, '0');
  const seconds = String(currDate.getSeconds()).padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;

  // Format date (YYYY/MM/DD)
  const year = currDate.getFullYear();
  const month = String(currDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(currDate.getDate()).padStart(2, '0');
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
 * Filters a list of strings to return only those that match the 'YYYY-MM-DD' date format.
 *
 * This function uses a regular expression to identify strings that strictly adhere to
 * the 4-digit year, 2-digit month (01-12), and 2-digit day (01-31) pattern, separated by hyphens.
 * It does not validate if the extracted date is a mathematically valid calendar date
 * (e.g., '2023-02-30' would match the format even though February doesn't have 30 days).
 *
 * @param {string[]} chromeKeyList An array of strings, typically representing keys
 * retrieved from Chrome's local storage or similar lists.
 * @returns {string[]} A new array containing only the strings from the input list
 * that match the 'YYYY-MM-DD' date format. If no matches are found,
 * an empty array is returned.
 *
 * @example
 * const keys = ['2025-05-18', 'userName', '2024-10-01', 'item_id_123', '1999-12-31'];
 * const dateKeys = filterDateKeys(keys);
 * // dateKeys will be ['2025-05-18', '2024-10-01', '1999-12-31']
 *
 * @example
 * const noDateKeys = ['apple', 'banana', 'orange'];
 * const result = filterDateKeys(noDateKeys);
 * // result will be []
 */
function filterDateKeys(chromeKeyList) {
  // filter out strings that match this 2025-05-18, or 2024-10-18, etc
  const dateKeys = chromeKeyList.filter((string) => {
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    return regex.test(string);
  });

  return dateKeys;
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
function convertMillisecondsToMinutes(milliseconds) {
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
  let minutes = convertMillisecondsToMinutes(miliSecs);

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
 * Determines if the `timeElapsed` falls within an acceptable range relative to the `timeInterval`.
 * This function handles three main scenarios:
 * 1. If `timeElapsed` is less than or equal to `timeInterval`, it's considered normal.
 * 2. If `timeElapsed` is more than double the `timeInterval`, it's considered an
 * "over" time, possibly indicating inactivity (e.g., user is asleep), and no time should be added.
 * 3. If `timeElapsed` is greater than `timeInterval` but not more than double,
 * it's still considered within an acceptable range for adding time.
 *
 * @param {number} timeElapsed - The actual time that has elapsed, in milliseconds.
 * @param {number} timeInterval - The expected interval, also in milliseconds.
 * @returns {boolean} `true` if the elapsed time is considered valid for adding
 * to the active duration, `false` otherwise.
 */
// TODO: WARN: need tests
// TODO: this maybe should return values as instead,
//    ex little over interval return timeElapsed / 2
//    ex lot over interval return timeElapsed / 4
function isTimeElapsedWithinInterval(timeElapsed, timeInterval) {
  // check if time Elapsed is less then / grater then the interval
  if (timeElapsed <= timeInterval) {
    __logger__(
      `timeCheck was normal, Elapsed = ${convertMillisecondsToMinutes(timeElapsed)} Minutes.`
    );
    return true;
  } else if (timeElapsed > timeInterval * 2) {
    // no time is added here, this is invalid time path
    __logger__(
      `timeCheck was over, Elapsed = ${convertMillisecondsToMinutes(timeElapsed)} Minutes, likly asleep, interval ${convertMillisecondsToMinutes(timeElapsed)}.`
    );
    return false;
  } else if (timeElapsed > timeInterval) {
    __logger__(
      `timeCheck was over timeInterval, Elapsed = ${convertMillisecondsToMinutes(timeElapsed)} Minutes.`
    );
    return true;
  } else {
    console.error(
      `timeCheck did not add time, fell into final else. Elapsed = ${convertMillisecondsToMinutes(timeElapsed)} Minutes. Interval = ${timeInterval}`
    );
    return false;
  }
}

/**
 * Adjusts and updates URL activity time based on elapsed time since the last check.
 * This function calculates the time elapsed since the URL's `startTime` and its `lastDateCheck`.
 * It then adds "active time" to the URL data if the calculated elapsed time is
 * within or exceeds a specified `timeInterval`. It also updates the `lastDateCheck`
 * to the `currentTime`.
 *
 * @param {UrlDataObj} urlData - An object containing URL-related data and methods.
 * Expected properties and methods:
 * - `startTime`: The initial start date/timestamp of the URL.
 * - `lastDateCheck`: The timestamp of the last time this URL was checked.
 * - `hasActiveUrl()`: A method that returns `true` if there's an active URL, `false` otherwise.
 * - `calcTimeElapsed(currentTime)`: Calculates the minimum elapsed time in milliseconds
 * between `currentTime` and both `startTime` and `lastDateCheck`.
 * - `addActiveTime(time)`: Adds the specified time (in milliseconds) to the URL's total active duration.
 * - `setLastDateCheck(date)`: Updates the `lastDateCheck` for the URL.
 * @param {number} timeInterval - The expected interval in **milliSeconds** between checks.
 * @param {Date} [currentTime=new Date()] - The current time used for calculations. Defaults to the current system time.
 * @returns {UrlDataObj} The updated `urlData` object.
 */
function checkInterval(urlData, timeInterval, currentTime = new Date()) {
  // return if no active url
  if (!urlData.hasActiveUrl()) {
    __logger__('timeCheck: activeUrl was null return with out change.');
    return urlData;
  }

  // find time elapsed, if its within timeInterval add the time
  let timeElapsed = urlData.calcTimeElapsed(currentTime);
  if (isTimeElapsedWithinInterval(timeElapsed, timeInterval)) {
    urlData.addActiveTime(timeElapsed);
  }

  urlData.setLastDateCheck(currentTime);
  return urlData;
}

/**
 * Sorts a list of URL data objects by their total usage time in descending order.
 *
 * @param {Array<object>} urlList - An array of URL objects. Each object
 * is expected to have a 'totalTime' property (e.g., `{ url: "example.com", totalTime: 120 }`).
 * @returns {Array<object>} The `urlList` array, sorted in-place, with objects
 * ordered from highest 'totalTime' to lowest.
 */
function sortByUrlUsageTime(urlList) {
  return urlList.sort((a, b) => {
    // Compare the totalTime property of the two objects
    if (a.totalTime < b.totalTime) {
      return 1;
    }
    if (a.totalTime > b.totalTime) {
      return -1;
    }
    return 0;
  });
}

/**
 * Consolidates URL usage data from an array of arrays, summing total times
 * and counting occurrences for each unique URL, then sorts the result by total time.
 *
 * @param {Array<Array<{url: string, totalTime: number}>>} arrays - An array where each element
 * is another array containing objects with 'url' (string) and 'totalTime' (number).
 * @returns {Array<{url: string, totalTime: number, occurrences: number}>} An array of
 * objects, each representing a unique URL with its combined 'totalTime' and 'occurrences'
 * across all input arrays.
 */
function combineAndSumTimesWithOccurrences(arrays) {
  // The value associated with each URL will be an object: { totalTime: number, count: number }
  const combinedData = new Map();

  arrays.forEach((arr) => {
    arr.forEach((obj) => {
      const url = obj.url;
      const totalTime = obj.totalTime;

      if (combinedData.has(url)) {
        // If URL already exists, update totalTime and increment count
        const data = combinedData.get(url);
        data.totalTime += totalTime;
        data.occurrences += 1;
      } else {
        // If URL is new, initialize with current totalTime and count of 1
        combinedData.set(url, { totalTime: totalTime, occurrences: 1 });
      }
    });
  });

  // Convert Map back to an array of objects
  const resultArray = Array.from(combinedData.entries()).map(([url, data]) => ({
    url: url,
    totalTime: data.totalTime,
    occurrences: data.occurrences,
  }));

  return resultArray;
}

/**
 * Calculates the average time based on a given divisor for each URL in a list.
 * The average is computed as `totalTime / divideBy`.
 *
 * @param {Array<{url: string, totalTime: number}>} dataArray - An array of URL objects,
 * where each object has a 'url' (string) and 'totalTime' (number).
 * @param {number} divideBy - The number to divide 'totalTime' by to calculate the average.
 * @returns {Array<{url: string, avg: number}>} A new array of objects, each containing the 'url'
 * and its calculated 'avg' (average time). If `divideBy` is 0, 'avg' will be 0 to prevent
 * division by zero errors.
 */
function calcAverages(dataArray, divideBy) {
  let avgArray = [];

  dataArray.forEach((element) => {
    let totalTime = element.totalTime;
    let avg = 0;

    // ensure no divide by zero
    if (divideBy > 0) {
      avg = totalTime / divideBy;
    }

    avgArray.push({
      url: element.url,
      avg: avg,
    });
  });

  return avgArray;
}

/**
 * Categorizes an array of date keys into two groups: those less than a calculated period date,
 * and those greater than or equal to it.
 *
 * @param {string[]} dateKeysArray - An array of date keys (e.g., "YYYY-MM-DD" strings) to be categorized.
 * @param {number} periodInDays - The number of days to subtract from `today` to determine the `periodDateKey`.
 * @param {Date} [today=new Date()] - The starting date from which `periodInDays` will be subtracted. Defaults to the current date.
 * @returns {{graterEq: string[], less: string[]}} An object containing two arrays:
 * - `graterEq`: An array of date keys that are greater than or equal to the `periodDateKey` (newer or same).
 * - `less`: An array of date keys that are less than the `periodDateKey` (older).
 */
function getGreaterEqualOrLessThenKey(
  dateKeysArray,
  periodInDays,
  today = new Date()
) {
  today.setDate(today.getDate() - periodInDays);
  let periodDateKey = getDateKey(today);

  // organize data
  let dateKeyList = filterDateKeys(dateKeysArray);
  dateKeyList.sort();

  let obj = {
    graterEq: [], // newer
    less: [], // older
  };

  for (const key of dateKeysArray) {
    if (key < periodDateKey) {
      obj.less.push(key);
    } else {
      obj.graterEq.push(key);
    }
  }

  return obj;
}

export {
  filterDateKeys,
  formatDateTime,
  __logger__,
  searchDataUrls,
  cleanUrl,
  getDateKey,
  convertMillisecondsToMinutes,
  convertMinutesToMilliseconds,
  formatMillisecsToHoursAndMinutes,
  checkInterval,
  isTimeElapsedWithinInterval,
  sortByUrlUsageTime,
  combineAndSumTimesWithOccurrences,
  calcAverages,
  getGreaterEqualOrLessThenKey,
};
