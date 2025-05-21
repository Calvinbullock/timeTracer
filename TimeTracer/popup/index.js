/**
 * @fileoverview This files has the front-end code that interacts
 * with the DOM (Not easily tested).
 * As well as the entry point for displaying the data for each website
 * and its time data.
 *
 * NOTE: all code in this file has no automated tests.
 *
 * @author: Calvin Bullock
 * @date Date of creation: April, 2025
 */

// TODO: clean up
//    - fix tests comments / file names
//    - move calcTime function / tests (??)
//    - test convertMinutesToMilliseconds
//    - rename the other converstion func in utils

// TODO: Release - 2
// - block list - (site blocker dialog)
//      - DONE - add
//      - DONE - remove
//      - ---- - redirect
// - day selector - day selector right above the table as a carasell ` < day X   day Y >`
// - storage - clear data button
// - publicly list the extension
//
// TODO: Release - 3
// - data continuity - run exit session when computer sleeps ( NOTE: is this possible? )
// - data continuity - when opening report pop up the data for current tab's time session is not shown until you leave that tab
// - data continuity - set a heart beat check the elapsed time every x amount of time and trough away values outside that range
// - data continuity - clean up old data (Date based)
// - build DoNotTrack ui page
// - add a total time count?
// - when date key changes need to run endSesstion
// - make the UI window wider / remove the count from the table

// TODO: - Future..
// - MAINTENANCE -- see if there is a way to easily test extension performance impact
// - MAINTENANCE -- clean up test names across all tests files (some have "test" in the name others don't)
//
// - FEATURE -- add a button to clear / reset all local data (check the chrome API)
// - FEATURE -- add % of total time spent on each site (later)
// - FEATURE -- get the data on display (live update???)
// - FEATURE -- allow pausing of tracking
// - FEATURE -- store dates in a obj and use dates as the key for a days url tracking
//          { dayX: date-xyz, dayY: date-abc } also if you can get a list of keys stored in
//          local this will be easy to clean up and check if days need to be cleaned

// import { UrlDataObj } from "../utils/urlDataObj.js";
import {
  __logger__,
  formatMillisecsToHoursAndMinutes,
} from '../utils/utils.js';
import {
  getSiteObjData,
  getBlockedSiteList,
  setBlockedSiteList,
  // setSiteObjData
} from '../utils/chromeStorage.js';

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

// ===================================================== \\
// ===================================================== \\
//                TimeTracking Page JS
// ===================================================== \\
// ===================================================== \\

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
  let tableSize = Math.min(20, urlList.length);

  // list top 20 Urls time was spent on
  for (let i = 0; i < tableSize; i++) {
    const totalTime = formatMillisecsToHoursAndMinutes(urlList[i].totalTime);
    display += '<tr>';
    display += `<td>${i + 1}</td>`; // Example 'Ex' column (row number)
    display += `<td>${urlList[i].url}</td>`;
    display += `<td>${totalTime}</td>`;
    display += '</tr>';
  }

  display += '</tbody>';
  display += '</table>';
  return display;
}

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
  let sortedUrlList = data.urlList.sort((a, b) => {
    // Compare the totalTime property of the two objects
    if (a.totalTime < b.totalTime) {
      return 1; // a comes before b
    }
    if (a.totalTime > b.totalTime) {
      return -1; // a comes after b
    }
    return 0; // a and b are equal
  });

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
      const blockedUrl = blockedUrlList[index];
      html += `
<tr>
<td>${blockedUrl}</td>
<td><button class="removeBlockedUrlBtn outlined-button" data-url="${blockedUrl}">X</button></td>
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
  // TODO: build page
  setHtmlById('content-div', 'Work In Progress');

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
