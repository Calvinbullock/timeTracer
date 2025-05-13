
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

// BEGIN_IMPORT_HERE

// ===================================================== \\
// ===================================================== \\
//                      Utilities
// ===================================================== \\
// ===================================================== \\

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
    };
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
        if (baseUrl.startsWith("https://")) {
            return baseUrl.substring(8);
        }

        return baseUrl;

    } catch (error) {
        console.error("Invalid URL:", url, error);
        return null;
    }
}

// ADD_TO_FRONT_END_START

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
 * Calculates the number of minutes from a given number of milliseconds.
 *
 * @param {number} milliseconds - The number of milliseconds.
 * @returns {number} The number of minutes.
 */
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
        return "0 min";
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
 * Generates an HTML table string from an array of URL objects.
 * The table includes columns for an example index, the site URL, and the time spent (in hours).
 * It assumes each object in the urlList has 'url' and 'totalTime' properties (in milliseconds).
 *
 * @param {Array<object>} urlList - An array of objects, where each object contains
 * at least 'url' (string) and 'totalTime' (number in milliseconds) properties.
 * @returns {string} - An HTML string representing a table displaying the URL data.
 */
function getUrlListAsTable(urlList) {
    let display = "<table>";
    display += "<thead><tr><th>#</th><th>Site Name</th><th>Time</th></tr></thead>";
    display += "<tbody>";

    // take the list size or max at 20
    let tableSize = Math.min(20, urlList.length);

    // list top 20 Urls time was spent on
    for (let i = 0; i < tableSize; i++) {
        const totalTime = formatMillisecsToHoursAndMinutes(urlList[i].totalTime);
        display += `<tr>`;
        display += `<td>${i + 1}</td>`; // Example 'Ex' column (row number)
        display += `<td>${urlList[i].url}</td>`;
        display += `<td>${totalTime}</td>`;
        display += `</tr>`;
    }

    display += "</tbody>";
    display += "</table>";
    return display;
}

// ADD_TO_FRONT_END_END

// ===================================================== \\
// ===================================================== \\
//                    Test Helpers
// ===================================================== \\
// ===================================================== \\

// this mute code is from:
//   https://www.bomberbot.com/javascript/how-to-silence-your-javascript-console-for-cleaner-unit-testing/
console.original = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  trace: console.trace
};

function muteConsole() {
  console.log = function() {};
  console.info = function() {};
  console.warn = function() {}
  console.error = function() {};
  console.trace = function() {};
}

function unmuteConsole() {
  console.log = console.original.log;
  console.info = console.original.info;
  console.warn = console.original.warn;
  console.error = console.original.error;
  console.trace = console.original.trace;
}

// ===================================================== \\
// ===================================================== \\
//                   Run Tests
// ===================================================== \\
// ===================================================== \\

function runAllTests() {
    let testCount = 0;
    let passRate = 0;

    passRate += searchDataUrls_found();
    passRate += searchDataUrls_notFound();
    testCount += 2;

    passRate += cleanUrl_basicReddit();
    passRate += cleanUrl_basicGoogleMail();
    passRate += cleanUrl_basicGoogleGemini();
    testCount += 3;

    passRate += testGetUrlListDisplay_basic();
    testCount += 1;

    passRate += minutesFromMilliseconds_basic();
    testCount += 1;

    passRate += testFormatMillisecsToHoursAndMinutes_exactHour();
    passRate += testFormatMillisecsToHoursAndMinutes_onlyMinutes();
    passRate += testFormatMillisecsToHoursAndMinutes_hoursAndMinutes();
    passRate += testFormatMillisecsToHoursAndMinutes_zeroMilliseconds();
    passRate += testFormatMillisecsToHoursAndMinutes_invalidNull();
    passRate += testFormatMillisecsToHoursAndMinutes_negativeInput();
    testCount += 6;

    passRate += testGetDateKey_specificDate();
    passRate += testGetDateKey_singleDigitMonthAndDay();
    testCount += 2;

    console.log(`Utils - Total Pass Rate ------------------------- ${passRate}/${testCount} `)
}

runAllTests();



/* ===================================================== *\
|| ===================================================== ||
||                      TESTS START                      ||
|| ===================================================== ||
\* ===================================================== */


// ===================================================== \\
// search index tests
// ===================================================== \\

// test basic string match and search
function searchDataUrls_found() {
    // setup
    let target = "google.com";
    let data = [
        {
            url: target // stored in obj at index 0
        },
        {
            url: "poodle.com"
        }
    ]

    // exercises
    let index = searchDataUrls(target, data);

    // check / test
    if (index == 0) {
        // pass if the string match is found in obj at index 0
        return 1;
    } else {
        console.log(`searchDataUrls_found -------------------------------- ❗ `);
        return 0;
    }
}

// test basic string match and search
//      target obj not in list
function searchDataUrls_notFound() {
    // setup
    let data = [
        {
            url:  "google.com"
        },
        {
            url: "poodle.com"
        }
    ]

    // exercises
    let index = searchDataUrls("taco.com", data); // target not in list

    // check / test
    if (index == -1) {
        // pass if the string match is not found in list (-1 return)
        return 1;
    } else {
        console.log(`searchDataUrls_notFound ----------------------------- ❗ `);
        return 0;
    }
}


// ===================================================== \\
// clean url tests
// ===================================================== \\

function cleanUrl_basicReddit() {
    // setup
    let dirtyUrl = "https://www.reddit.com/r/linux/";

    // exercises
    let cleanedUrl = cleanUrl(dirtyUrl);

    // check / test
    if (cleanedUrl == "www.reddit.com") {
        return 1;
    } else {
        console.log(`cleanUrl_basicReddit -------------------------------- ❗ `);
        return 0;
    }
}

// does this read as a sub domain of google?
function cleanUrl_basicGoogleMail() {
    // setup
    let dirtyUrl = "https://mail.google.com/mail/u/0/#inbox";

    // exercises
    let cleanedUrl = cleanUrl(dirtyUrl);

    // check / test
    if (cleanedUrl == "mail.google.com") {
        return 1;
    } else {
        console.log(`cleanUrl_basicGoogleMail ---------------------------- ❗ `);
        return 0;
    }
}

// does this read as a sub domain of google?
function cleanUrl_basicGoogleGemini() {
    // setup
    let dirtyUrl = "https://gemini.google.com/app/";

    // exercises
    let cleanedUrl = cleanUrl(dirtyUrl);

    // check / test
    if (cleanedUrl == "gemini.google.com") {
        return 1;
    } else {
        console.log(`cleanUrl_basicGoogleGemini -------------------------- ❗ `);
        return 0;
    }
}

// minutes from milli-secs test
function minutesFromMilliseconds_basic() {
    //setup
    let milliSecs = 600000;

    //exercise
    const time = minutesFromMilliseconds(milliSecs);

    // check / test
    if (time == 10) { // should come to 10 minutes
        return 1;
    } else {
        console.log(`minutesFromMilliseconds ----------------------------- ❗ `);
        return 0;
    }
}

function testGetUrlListDisplay_basic() {
    // setup
    const testData = {
        activeUrl: null,
        startTime: null,
        urlList: [
            { url: "reddit.com", totalTime: 0},
            { url: "google.com", totalTime: 0}
        ],
    };
    const expectedOutput = `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Site Name</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>reddit.com</td>
              <td>0 min</td>
            </tr>
            <tr>
              <td>2</td>
              <td>google.com</td>
              <td>0 min</td>
            </tr>
          </tbody>
        </table>
    `.split('\n').map(line => line.trim()).filter(line => line !== '').join(''); // removes the newlines and tabs

    // exercise
    const actualOutput = getUrlListAsTable(testData.urlList);

    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`testGetUrlListDisplay_basic ------------------------- ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log()
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}

function testFormatMillisecsToHoursAndMinutes_exactHour() {
    // setup
    const testData = 3600000;
    const expectedOutput = "1 hr";

    // exercise
    const actualOutput = formatMillisecsToHoursAndMinutes(testData);

    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`testFormatMillisecsToHoursAndMinutes_exactHour ------ ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}

function testFormatMillisecsToHoursAndMinutes_onlyMinutes() {
    // setup
    const testData = 1800000; // 30 minutes
    const expectedOutput = "30 min";
    // exercise
    const actualOutput = formatMillisecsToHoursAndMinutes(testData);
    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`formatMillisecsToHoursAndMinutes (30 min) ----------- ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}

function testFormatMillisecsToHoursAndMinutes_hoursAndMinutes() {
    // setup
    const testData = 7500000; // 2 hours and 5 minutes
    const expectedOutput = "2 hr, 5 min";
    // exercise
    const actualOutput = formatMillisecsToHoursAndMinutes(testData);
    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`formatMillisecsToHoursAndMinutes (2 hr, 5 min) ------ ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}

function testFormatMillisecsToHoursAndMinutes_zeroMilliseconds() {
    // setup
    const testData = 0;
    const expectedOutput = "0 min";
    // exercise
    const actualOutput = formatMillisecsToHoursAndMinutes(testData);
    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`formatMillisecsToHoursAndMinutes (0 ms) ------------- ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}

function testFormatMillisecsToHoursAndMinutes_invalidNull() {
    // setup
    const testData = null;
    const expectedOutput = "0 min";
    // exercise
    const actualOutput = formatMillisecsToHoursAndMinutes(testData);
    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`formatMillisecsToHoursAndMinutes (null) ------------- ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}

function testFormatMillisecsToHoursAndMinutes_negativeInput() {
    // setup
    const testData = -1000;
    const expectedOutput = "0 min";
    // exercise
    const actualOutput = formatMillisecsToHoursAndMinutes(testData);
    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`formatMillisecsToHoursAndMinutes (negative) --------- ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}

function testGetDateKey_specificDate() {
    // setup
    const testDate = new Date(2023, 10, 15); // November 15, 2023 (month is 0-indexed)
    const expectedOutput = "2023-11-15";

    // exercise
    const actualOutput = getDateKey(testDate);

    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`getDateKey (specific date) ------------------ ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}

function testGetDateKey_singleDigitMonthAndDay() {
    // setup
    const testDate = new Date(2024, 5, 9); // June 9, 2024
    const expectedOutput = "2024-06-09";

    // exercise
    const actualOutput = getDateKey(testDate);

    // check / test
    if (actualOutput === expectedOutput) {
        return 1;
    } else {
        console.log(`getDateKey (single digit month/day) -------- ❗`);
        console.log(`Expected: "${expectedOutput}"`);
        console.log(`Actual:   "${actualOutput}"`);
        return 0;
    }
}
