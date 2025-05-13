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


// TODO: Release - 2
// - block list - (site blocker dialog)
// - day selector - day selector right above the table as a carasell ` < day X   day Y >`
// - storage - clear data button
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

// BEGIN_IMPORT_HERE

// ===================================================== \\
// ===================================================== \\
//                      Main Script
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
 * Asynchronously retrieves website tracking data and displays it in an HTML table
 * within the element having the ID 'content-div'.
 * It fetches the data using 'getSiteObjData', formats it into an HTML table using
 * 'getUrlListAsTable', and then injects the HTML into the specified DOM element.
 *
 * @async
 * @returns {Promise<void>} - A Promise that resolves after the data is fetched and displayed.
 */
async function dispayUrlData() {
    // get the data on display (live update???)
    let data = await getSiteObjData();

    // sort by highest usage time
    let sortedUrlList = data.urlList.sort((a, b) => {
        // Compare the totalTime property of the two objects
        if (a.totalTime < b.totalTime) {
            return 1; // a comes before b
        }
        if (a.totalTime > b.totalTime) {
            return -1;  // a comes after b
        }
        return 0;    // a and b are equal
    });

    // format the data
    let html = getUrlListAsTable(sortedUrlList);

    // inject the data
    setHtmlById('content-div', html);
}

dispayUrlData();

// ===================================================== \\
// ===================================================== \\
//                      Nav Script
// ===================================================== \\
// ===================================================== \\

const timeSpentLink = document.getElementById('timeSpentLink');
const doNotTrackLink = document.getElementById('doNotTrackLink');
const lockOutLink = document.getElementById('lockOutLink');
const menuLinks = document.querySelectorAll('.menu-link');

// Function to remove 'active' from all menu links
function removeActiveClassFromAll() {
  menuLinks.forEach(link => link.classList.remove('active'));
}

timeSpentLink.addEventListener('click', function(event) {
    event.preventDefault()
    dispayUrlData();

    // set active link item
    removeActiveClassFromAll();
    this.classList.add('active');

})

doNotTrackLink.addEventListener('click', function(event) {
    event.preventDefault()
    // TODO: build page
    setHtmlById('content-div', "Work In Progress");

    // set active link item
    removeActiveClassFromAll();
    this.classList.add('active');
})

lockOutLink.addEventListener('click', function(event) {
    event.preventDefault()
    // TODO: build page
    setHtmlById('content-div', "Work In Progress");

    // set active link item
    removeActiveClassFromAll();
    this.classList.add('active');
})

// END_IMPORT_HERE
