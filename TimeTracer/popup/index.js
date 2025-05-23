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
  convertMillisecondsToMinutes,
  filterDateKeys,
  formatMillisecsToHoursAndMinutes,
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
 * Generates an HTML table string from an array of URL objects.
 * The table includes columns for an example index, the site URL, and the time spent (in hours).
 * It assumes each object in the urlList has 'url' and 'totalTime' properties (in milliseconds).
 *
 * @param {Array<object>} urlList - An array of objects, where each object contains
 * at least 'url' (string) and 'totalTime' (number in milliseconds) properties.
 * @returns {string} - An HTML string representing a table displaying the URL data.
 */
function getUrlListAsTable(urlList) {
  let display = '<table>';
  display +=
    '<thead><tr><th>#</th><th>Site Name</th><th>Time</th></tr></thead>';
  display += '<tbody>';

  // take the list size or max at 20
  let tableSize = Math.min(MAX_URL_DISPLAY_LIST_LENGTH, urlList.length);

  // list top 20 Urls time was spent on
  for (let i = 0; i < tableSize; i++) {
    // only show items that have more then 1 minute total
    if (convertMillisecondsToMinutes(urlList[i].totalTime) > 1) {
      const totalTime = formatMillisecsToHoursAndMinutes(urlList[i].totalTime);
      display += '<tr>';
      display += `<td>${i + 1}</td>`; // Example 'Ex' column (row number)
      display += `<td>${urlList[i].url}</td>`;
      display += `<td>${totalTime}</td>`;
      display += '</tr>';
    }
  }

  display += '</tbody>';
  display += '</table>';
  return display;
}

// ===================================================== \\
// ===================================================== \\
//                WeeklySum Page JS
// ===================================================== \\
// ===================================================== \\

/**
 * Creates an HTML string representing a carousel container populated with weekly summary data.
 * Each slide in the carousel corresponds to a date key and displays a table of URL usage for that day.
 *
 * @param {Array<object>} dataList - An array of objects, where each object represents a day's data.
 * Each object should have the following structure:
 * - `dateKey`: {string} The date string (e.g., "2023-10-27") for the slide's heading.
 * - `data`: {Array<object>} An array of URL data objects for that day,
 * which will be used by `getUrlListAsTable` to generate the table content.
 * @returns {string} A complete HTML string for the carousel container, including slides and navigation buttons.
 */
function createWeeklySumContainer(dataList) {
  let slides = '';

  // create each carousel-slide
  dataList.forEach((element) => {
    let slide = '';
    slide += '   <div class="carousel-slide">';
    slide += `     <h2>${element.dateKey}</h2>`;
    slide += getUrlListAsTable(element.data);
    slide += '   </div>';

    slides += slide;
  });

  // create the main carousel-container
  let container = '';
  container += '<div class="carousel-container">';
  container += ' <div class="carousel-wrapper">';
  container +=
    ' <button class="carousel-button prev" aria-label="Previous slide">&#10094;</button>';
  container +=
    ' <button class="carousel-button next" aria-label="Next slide">&#10095;</button>';
  container += slides;
  container += ' </div>';
  container += '</div>';

  return container;
}

/**
 * Asynchronously retrieves and displays weekly summary data of URL usage.
 * parse it into html and injects that html into the proper page.
 *
 * @async
 * @function displayWeeklySumPage
 * @returns {Promise<void>} A promise that resolves when the page content has been updated.
 */
// TODO: have this or a part or it calc the total time for each day and
//    graph it for at a glance? --- OR just have total time shown each day
async function displayWeeklySumPage() {
  // get a list of dates in storage
  const chromeKeyList = await getAllChromeLocalStorageKeys();
  let dateKeyList = filterDateKeys(chromeKeyList);

  // map each key data pair to a promise
  const dataPromises = dateKeyList.map(async (key) => {
    const urlObj = new UrlDataObj();
    const urlData = urlObj.fromJSONString(await getChromeLocalDataByKey(key));
    let urlList = sortByUrlUsageTime(urlData.urlList);

    // return the obj that we want to add to dataList
    return {
      dateKey: key,
      data: urlList,
    };
  });

  // resolve each promise and add the dateKey / data obj to the list
  const dataList = await Promise.all(dataPromises);

  // build the carousel of data
  let carousel = createWeeklySumContainer(dataList);

  // inject the data / carousel
  setHtmlById('content-div', carousel);
}

// ===================================================== \\
// ===================================================== \\
//                TimeTracking Page JS
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
  let html = getUrlListAsTable(sortedUrlList);

  // inject the data
  setHtmlById('content-div', html);
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
//                  Nav Script / Listeners
// ===================================================== \\
// ===================================================== \\

const timeSpentLink = document.getElementById('timeSpentLink');
const weeklySum = document.getElementById('weeklySum');
const doNotTrackLink = document.getElementById('doNotTrackLink');
const blockListkLink = document.getElementById('blockListLink');
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

weeklySum.addEventListener('click', function (event) {
  event.preventDefault();

  // BUG: just need to get carasole JS script to work
  displayWeeklySumPage();

  // set active link item
  removeActiveClassFromAll();
  this.classList.add('active');
});

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

// first function that is called on enter
dispayUrlTimePage();
