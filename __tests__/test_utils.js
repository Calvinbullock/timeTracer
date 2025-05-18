
//import { unmuteConsole, muteConsole } from "./testHelpers.js";
import {
  // formatDateTime,
  __logger__,
  searchDataUrls,
  cleanUrl,
  getDateKey,
  minutesFromMilliseconds,
  formatMillisecsToHoursAndMinutes,
} from "./../TimeTracer/utils/utils.js";

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
