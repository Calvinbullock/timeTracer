/**
 * @fileoverview This files has the front-end code that interacts
 * with the DOM (Not easily tested).
 * As well as the entry point for displaying the data for each website
 * and its time data.
 *
 * @author: Calvin Bullock
 * @date Date of creation: April, 2025
 */

// TODO: clean up
//    - move calcTime function / tests (??)
//    - isTimeElapsedWithinInterval needs tests (and re-design?)

// TODO: Release - 3
// - block list - (site blocker dialog)
//      - DONE - add
//      - DONE - remove
//      - ---- - redirect
// - storage - clear data button
//
// TODO: Release - 4
// - data continuity - clean up old data (Date based)
// - build DoNotTrack ui page
// - add a total time count?
// - when date key changes need to run endSesstion
// - make the UI window wider / remove the count from the table

// TODO: - Future..
// - MAINTENANCE -- see if there is a way to easily test extension performance impact
// - MAINTENANCE -- clean up test names across all tests files (some have "test" in the name others don't)
// - MAINTENANCE -- make the different pages css consistent (margin, spacing, etc)
//
// - FEATURE -- add a button to clear / reset all local data (check the chrome API)
// - FEATURE -- add % of total time spent on each site (later)
// - FEATURE -- get the data on display (live update???)
// - FEATURE -- allow pausing of tracking
// - FEATURE -- store dates in a obj and use dates as the key for a days url tracking
//          { dayX: date-xyz, dayY: date-abc } also if you can get a list of keys stored in
//          local this will be easy to clean up and check if days need to be cleaned

import { UrlDataObj } from '../utils/urlDataObj.js';
import {
  __logger__,
  calcAverages,
  combineAndSumTimesWithOccurrences,
  convertMillisecondsToMinutes,
  filterDateKeys,
  formatMillisecsToHoursAndMinutes,
  getDateKey,
  sortByUrlUsageTime,
} from '../utils/utils.js';
import {
  getSiteObjData,
  getBlockedSiteList,
  setBlockedSiteList,
  getAllChromeLocalStorageKeys,
  getChromeLocalDataByKey,
  // setSiteObjData
} from '../utils/chromeStorage.js';

const MAX_URL_DISPLAY_LIST_LENGTH = 20; // the number of urls displayed

// ===================================================== \\
// ===================================================== \\
//                Multi Page functions
// ===================================================== \\
// ===================================================== \\

/**
 * Sets the innerHTML of a specified HTML element by its ID.
 * If the element with the given ID is not found, it logs an error to the console.
 *
 * @param {string} htmlId - The ID of the HTML element to modify.
 * @param {string} htmlContent - The HTML string to inject into the element.
 */
function setHtmlById(htmlId, htmlContent) {
  const contentDiv = document.getElementById(htmlId);

  if (contentDiv) {
    contentDiv.innerHTML = htmlContent;
  } else {
    console.error(`HTML element with ID "${htmlId}" not found.`);
  }
}

/**
 * Generates an HTML table string from a list of URL objects, displaying usage data.
 * The table includes columns for the entry number, the site URL, and the time spent.
 * Only URLs with a total time greater than 1 minute are included in the table.
 * The table display is limited to a maximum length defined by `MAX_URL_DISPLAY_LIST_LENGTH`.
 *
 * @param {Array<object>} urlList - An array of objects, where each object is expected to have
 * a 'url' (string) and a property identified by the 'key' parameter,
 * representing time in milliseconds.
 * @param {string} [key] - The name of the property in each URL object that holds
 * the time in milliseconds.
 * @returns {string} - An HTML string representing a table displaying the filtered and formatted URL data.
 */
function getUrlListAsTable(urlList, key) {
  let display = '<table>';
  display +=
    '<thead><tr><th>#</th><th>Site Name</th><th>Time</th></tr></thead>';
  display += '<tbody>';

  // take the list size or max at 20
  let tableSize = Math.min(MAX_URL_DISPLAY_LIST_LENGTH, urlList.length);

  // list top 20 Urls time was spent on
  for (let i = 0; i < tableSize; i++) {
    // only show items that have more then 1 minute total
    if (convertMillisecondsToMinutes(urlList[i][key]) > 1) {
      const time = formatMillisecsToHoursAndMinutes(urlList[i][key]);
      display += '<tr>';
      display += `<td>${i + 1}</td>`; // Example 'Ex' column (row number)
      display += `<td>${urlList[i].url}</td>`;
      display += `<td>${time}</td>`;
      display += '</tr>';
    }
  }

  display += '</tbody>';
  display += '</table>';
  return display;
}

// ===================================================== \\
// ===================================================== \\
//                  BlockList Page JS
// ===================================================== \\
// ===================================================== \\

/**
 * Creates an HTML table to display the list of blocked URLs.
 * It also includes a button to add the currently active URL to the block list.
 *
 * @param {Array<string>} blockedUrlList - An array of URLs that are currently blocked.
 * @param {string} activeUrl - The URL of the currently active tab.
 * @returns {string} - An HTML string representing the blocked URL table and the "add current URL" button.
 */
function createBlockedUrlTable(blockedUrlList, activeUrl) {
  let html = `
    <p id='blockUrl-sentance'>Block
      <button class="addNewBlockedUrlBtn outlined-button" id="addNewBlockedUrlBtn" value="${activeUrl}">${activeUrl}</button>
    </p>
    <table id='blockListTable'>
    <thead>
    <tr>
    <th>Blocked URL</th>
    <th>Remove Item</th>
    </tr>
    </thead>
    <tbody>
    `;

  // if blockedUrlList is empty add a row letting the usr know its empty
  if (blockedUrlList.length === 0) {
    html += `
        <tr>
          <td>No blocked URLs</td>
          <td><button class="outlined-button">-</button></td>
        </tr>
        `;
  } else {
    // add all the list items into the table rows
    for (let index = 0; index < blockedUrlList.length; index++) {
      const blockedItem = blockedUrlList[index];
      html += `
        <tr>
          <td>${blockedItem}</td>
          <td><button class="removeBlockedUrlBtn outlined-button" data-url="${blockedItem}">X</button></td>
        </tr>
      `;
    }
  }
  html += `
    </tbody>
    </table>
  `;
  return html;
}

/**
 * Asynchronously retrieves the blocked URL list and the last active URL,
 * then generates and displays the block list page content in the 'content-div'.
 *
 * @async
 * @returns {Promise<void>} - A Promise that resolves after the block list page content has been successfully displayed.
 */
async function displayBlockListPage() {
  // get lastActiveUrl
  const data = await getSiteObjData();
  const lastActiveUrl = data.getLastActiveUrl();

  let blockedSiteList = await getBlockedSiteList();

  let html = createBlockedUrlTable(blockedSiteList, lastActiveUrl);
  setHtmlById('content-div', html);
}

/**
 * Asynchronously adds a new URL to the list of blocked URLs in Chrome's local storage.
 * It retrieves the existing list, checks if the URL already exists, and appends it if it doesn't.
 * Finally, it saves the updated list.
 *
 * @async
 * @param {string} newBlockedUrl - The URL to add to the blocked sites list.
 * @returns {Promise<boolean>} - A Promise that resolves with true if the URL was added, and false if it already existed.
 */
async function addNewBlockedUrl(newBlockedUrl) {
  let blockedList = await getBlockedSiteList();

  // return if the array already has the item
  for (let index = 0; index < blockedList.length; index++) {
    if (blockedList[index] === newBlockedUrl) {
      return false;
    }
  }

  // added item
  blockedList.push(newBlockedUrl);
  await setBlockedSiteList(blockedList);

  return true;
}

/**
 * Asynchronously removes a specific URL from the list of blocked URLs in Chrome's local storage.
 * It retrieves the existing list, filters out the target URL, and then saves the updated list.
 *
 * @async
 * @param {string} targetUrl - The URL to remove from the blocked sites list.
 * @returns {Promise<void>} - A Promise that resolves when the URL has been successfully removed and the list has been saved.
 */
async function removeBlockedUrl(targetUrl) {
  let blockedList = await getBlockedSiteList();
  blockedList = blockedList.filter((item) => item !== targetUrl);
  await setBlockedSiteList(blockedList);
}

// NOTE: listener for removing url from block list
// checks all clicks of button matching the target class then gets the dataset of the
//      triggered button prevents error from selecting un-loaded dynamic content.
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('removeBlockedUrlBtn')) {
    const urlToRemove = event.target.dataset.url;
    removeBlockedUrl(urlToRemove);

    __logger__(`${urlToRemove} removed from blockList`);
    displayBlockListPage();
  }
});

// NOTE: listener for adding url to block list
// checks all clicks of button matching the target class then looks for the
//      id of the clicked button prevents error on selecting un-loaded dynamic content
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('addNewBlockedUrlBtn')) {
    const addBlockedUrlBtn = document.getElementById('addNewBlockedUrlBtn');
    addNewBlockedUrl(addBlockedUrlBtn.value);
    __logger__(`${addBlockedUrlBtn.value} added blockList`);
    displayBlockListPage();
  }
});

// ===================================================== \\
// ===================================================== \\
//                WeeklySum Page JS
// ===================================================== \\
// ===================================================== \\

// TODO: func comment / clean up func
async function displayWeeklyAvgPage() {
  // get a list of dates in storage
  const chromeKeyList = await getAllChromeLocalStorageKeys();
  let dateKeyList = filterDateKeys(chromeKeyList);
  dateKeyList.sort();

  // check today's date is at the top
  const todaysDateKey = getDateKey(); // default is today's key
  if (dateKeyList[0] !== todaysDateKey) {
    __logger__('weeklyAvg - Todays date was not in the right place.');
  }

  // get last 7 days or up to dateKeyList length if shorter
  let itLength = Math.min(dateKeyList.length, 7);
  let dataList = [];

  // get the data for each key up to itLength
  for (let index = 0; index < itLength; index++) {
    const key = dateKeyList[index];

    const urlObj = new UrlDataObj();
    const promise = await getChromeLocalDataByKey(key);
    dataList.push(urlObj.fromJSONString(promise));
  }

  // resolve promises and grab only what we need (urlList)
  dataList = await Promise.all(dataList);
  dataList = dataList.map((item) => {
    return item.urlList;
  });

  dataList = combineAndSumTimesWithOccurrences(dataList);
  dataList = calcAverages(dataList);

  // sort: highest avg time at top
  dataList.sort((a, b) => {
    return b.avg - a.avg;
  });

  // inject the data
  let html = getUrlListAsTable(dataList, 'avg');
  setHtmlById('content-div', html);
}

// ===================================================== \\
// ===================================================== \\
//                Yesterday Page JS
// ===================================================== \\
// ===================================================== \\

/**
 * Fetches, processes, and displays yesterday's Browse data.
 * It retrieves the date key for yesterday, then uses it to fetch stored URL data.
 * If data is found, it sorts the URLs by usage time and formats them into an HTML table.
 * If no data is found, a "No data" message is displayed. Finally, the generated HTML
 * is injected into the 'content-div' element on the page.
 * @async
 * @returns {Promise<void>} A promise that resolves when the data has been displayed.
 */
async function displayYesterdaysPage() {
  // get yesterdays date key
  const today = new Date();
  let yesterdaysDate = new Date();
  yesterdaysDate.setDate(today.getDate() - 1);
  const yesterdaysDateKey = getDateKey(yesterdaysDate);

  // get yesterdays data
  const urlObj = new UrlDataObj();
  const yesterdaysData = urlObj.fromJSONString(
    await getChromeLocalDataByKey(yesterdaysDateKey)
  );

  let html = '';

  // check if the data was found
  if (yesterdaysData) {
    // sort by highest usage time
    let sortedUrlList = sortByUrlUsageTime(yesterdaysData.urlList);
    // format the data
    html = getUrlListAsTable(sortedUrlList, 'totalTime');
  } else {
    html = 'No data for yesterday found';
  }

  // inject the data
  setHtmlById('content-div', html);
}

// ===================================================== \\
// ===================================================== \\
//             TimeTracking (today) Page JS
// ===================================================== \\
// ===================================================== \\

/**
 * Asynchronously retrieves website tracking data and displays it in an HTML table
 * within the element having the ID 'content-div'.
 * It fetches the data using 'getSiteObjData', formats it into an HTML table using
 * 'getUrlListAsTable', and then injects the HTML into the specified DOM element.
 *
 * @async
 * @returns {Promise<void>} - A Promise that resolves after the data is fetched and displayed.
 */
async function dispayUrlTimePage() {
  // get the data on display (live update???)
  let data = await getSiteObjData();

  // update the data for display (this data is never re-stored to local - non persistent )
  data.endSession();

  // sort by highest usage time
  let sortedUrlList = sortByUrlUsageTime(data.urlList);

  // format the data
  let html = getUrlListAsTable(sortedUrlList, 'totalTime');

  // inject the data
  setHtmlById('content-div', html);
}

// ===================================================== \\
// ===================================================== \\
//                  Nav Script / Listeners
// ===================================================== \\
// ===================================================== \\

const timeSpentLink = document.getElementById('timeSpentLink');
const yesterday = document.getElementById('yesterday');
const weekAvg = document.getElementById('weekAvg');
const menuLinks = document.querySelectorAll('.menu-link');

// Function to remove 'active' from all menu links
function removeActiveClassFromAll() {
  menuLinks.forEach((link) => link.classList.remove('active'));
}

timeSpentLink.addEventListener('click', function (event) {
  event.preventDefault();
  dispayUrlTimePage();

  // set active link item
  removeActiveClassFromAll();
  this.classList.add('active');
});

yesterday.addEventListener('click', function (event) {
  event.preventDefault();
  displayYesterdaysPage();

  // set active link item
  removeActiveClassFromAll();
  this.classList.add('active');
});

weekAvg.addEventListener('click', function (event) {
  event.preventDefault();
  displayWeeklyAvgPage();

  // set active link item
  removeActiveClassFromAll();
  this.classList.add('active');
});

// first function that is called on enter
dispayUrlTimePage();

// ======================================== \\
// ======================================== \\
//           __THIS IS FOR LATER__          \\
// ======================================== \\
// ======================================== \\
/*

const doNotTrackLink = document.getElementById('doNotTrackLink');
const blockListkLink = document.getElementById('blockListLink');

doNotTrackLink.addEventListener('click', function (event) {
  event.preventDefault();
  // TODO: build page
  setHtmlById('content-div', 'Work In Progress');

  // set active link item
  removeActiveClassFromAll();
  this.classList.add('active');
});

blockListkLink.addEventListener('click', function (event) {
  event.preventDefault();
  //displayBlockListPage(); // TODO: this front end is ready the backend is not

  setHtmlById('content-div', 'Work In Progress');

  // set active link item
  removeActiveClassFromAll();
  this.classList.add('active');
});

*/
