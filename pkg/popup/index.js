
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
        console.log(`LOG - Tracking starts for ${url}`);

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
        console.log(`LOG - Tracking exits for ${this.activeUrl}`);

        if (this.activeUrl == null) {
            console.error("Error: activeItem was null when endSession was called.");
            return; // if null nothing to add or update
        }

        const activeItem = this.urlList.find(item => item.url === this.activeUrl);
        const elapsedTime = this.calcTimeElapsed(this.startTime, currentTime);

        // update or add new url to urlList
        if (activeItem) {
            activeItem.totalTime += elapsedTime;
            console.log(`LOG - ${this.activeUrl} totalTime updated to ${activeItem.totalTime}`);

        } else {
            // TODO: update tests to cover this case
            // add item to list
            this.urlList.push( {
                url: this.activeUrl,
                totalTime: elapsedTime
            });
            console.log(`LOG - ${this.activeUrl} added to urlList`);
        }

        console.log(`LOG - activeUrl was: ${this.activeUrl}`)
        if (this.activeUrl != null) {
            this.lastActiveUrl = this.activeUrl;
            console.log(`LOG - lastActiveUrl is: ${this.lastActiveUrl}`)
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


// ==================================================== \\
// ==================================================== \\
// functions dependent on chrome API                    \\
// ==================================================== \\
// ==================================================== \\

/**
 * Asynchronously removes a single item from the Chrome extension's local storage.
 *
 * This function attempts to remove the item associated with the provided key.
 *  It wraps the callback-based `chrome.storage.local.remove` API in a Promise
 *  for easier asynchronous handling. The Promise resolves upon successful
 *  removal and rejects if an error occurs. The function also logs messages
 *  to the console indicating success or failure.
 *
 * @async
 * @function removeChromeLocalStorageItem
 * @param {string} key The key of the item to be removed from local storage.
 * @returns {Promise<void>} A Promise that resolves when the item is successfully
 *      removed, or rejects if an error occurs.
 */
function removeChromeLocalStorageItem(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.remove(key, () => {
            if (chrome.runtime.lastError) {
                console.error("Error removing item from local storage:", chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                console.log(`LOG - Item with key "${key}" removed from local storage.`);
                resolve();
            }
        });
    });
}

/**
 * Asynchronously stores data in Chrome's local storage.
 *
 * This function saves the provided data under the specified key in Chrome's
 *  local storage, returning a Promise that resolves upon successful storage
 *  or rejects if an error occurs. It also logs the outcome of the storage
 *  operation to the console.
 *
 * @async
 * @function storeChromeLocalData
 * @param {string} key - The key under which to store the data.
 * @param {any} data - The data to be stored. This can be any JavaScript
 *      object that is serializable.
 * @returns {Promise<void>} A Promise that resolves when the data is
 *      successfully stored, or rejects if an error occurs.
 */
function storeChromeLocalData(key, data) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: data}, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving to local storage:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError); // Indicate failure with the error
            } else {
                console.log(`LOG - Stored: key: ${key}`);
                resolve(); // Indicate successful completion
            }
        });
    });
}

/**
 * Stores site data to Chrome local storage.
 *
 * @async
 * @function setSiteObjData
 * @param {any} siteDataObj - The site data object to store.
 * @returns {Promise<void>} A Promise that resolves when the data is successfully stored.
 */
async function setSiteObjData(siteDataObj) {
    const siteDataString = siteDataObj.toJSONString();
    storeChromeLocalData(getDateKey(), siteDataString);
}

/**
 * Asynchronously saves a list of URLs to be blocked in Chrome's local storage.
 * The provided list is first converted to a JSON string before being stored.
 * This function overwrites any existing blocked URL list in storage.
 *
 * @async
 * @param {Array<string>} blockedUrlList - An array of URLs representing the complete list of sites to be blocked.
 * @returns {Promise<void>} - A Promise that resolves when the data is successfully stored.
 */
async function setBlockedSiteList(blockedUrlList) {
    const blockedUrlString = JSON.stringify(blockedUrlList);
    storeChromeLocalData("blockedUrlList", blockedUrlString);
}

/**
 * Retrieves data from Chrome's local storage.
 *
 * This asynchronous function retrieves data from Chrome's local storage using the provided key.
 *  It handles potential errors during retrieval and returns the data or undefined if an error occurs.
 *
 * @param {string} key - The key of the data to retrieve.
 * @returns {Promise<any | undefined>} A Promise that resolves with the retrieved
 *      data, or undefined if an error occurred.
 */
async function getChromeLocalData(key) {
    try {
        const result = await chrome.storage.local.get([key]);
        //console.log(`LOG - retrieve: key: ${key}, value: ${result[key]}`);
        console.log(`LOG - retrieve: key: ${key}`);
        return result[key];

    } catch (error) {
        console.error("Error retrieving data:", error);
        return null;
    }
}

/**
 * Retrieves site data from Chrome local storage.  If no data exists,
 *  it creates a new tracking object.
 *
 * @async
 * @function getSiteObjData
 * @returns {Promise<any>} A Promise that resolves with the site data object.
 */
async function getSiteObjData() {
    let siteDataString = await getChromeLocalData(getDateKey());

    let siteDataObj = new UrlDataObj();

    // if the data exists parse it into siteDataObj
    if (siteDataString) {
        siteDataObj = siteDataObj.fromJSONString(siteDataString);
    }

    // check the obj is of the right type
    if (!(siteDataObj instanceof UrlDataObj)) {
        console.error( "Error: siteData is not instance of UrlDataObj - in getSiteObjData()",);
    }
    return siteDataObj;
}

/**
 * Asynchronously retrieves the list of blocked URLs from Chrome's local storage.
 * The stored data, which is expected to be a JSON string, is parsed back into an array.
 * If no blocked URL list is found in storage, or if the stored data is falsy,
 * an empty array `[]` is returned.
 *
 * @async
 * @returns {Promise<Array<string>>} - A Promise that resolves with the array of blocked URLs.
 * Returns an empty array `[]` if no list is found or if parsing fails.
 */
async function getBlockedSiteList() {
    let blockedSiteList = await getChromeLocalData("blockedUrlList");

    // create blockList if empty
    if (!blockedSiteList) {
        console.log(`log - created new blockList`)
        return [];
    }

    return JSON.parse(blockedSiteList);
}


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
        if (blockedList[index] === newBlockedUrl) {return false}
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
    blockedList = blockedList.filter(item => item !== targetUrl);
    await setBlockedSiteList(blockedList);
}

// NOTE: listener for removing url from block list
// checks all clicks of button matching the target class then gets the dataset of the
//      triggered button prevents error from selecting un-loaded dynamic content.
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("removeBlockedUrlBtn")) {
        const urlToRemove = event.target.dataset.url;
        removeBlockedUrl(urlToRemove);

        console.log(`log - ${urlToRemove} removed from blockList`);
        displayBlockListPage();
    }
});

// NOTE: listener for adding url to block list
// checks all clicks of button matching the target class then looks for the
//      id of the clicked button prevents error on selecting un-loaded dynamic content
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("addNewBlockedUrlBtn")) {
        const addBlockedUrlBtn = document.getElementById("addNewBlockedUrlBtn");
        addNewBlockedUrl(addBlockedUrlBtn.value);
        console.log(`log - ${addBlockedUrlBtn.value} added blockList`)
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
  menuLinks.forEach(link => link.classList.remove('active'));
}

timeSpentLink.addEventListener('click', function(event) {
    event.preventDefault()
    dispayUrlTimePage();

    // set active link item
    removeActiveClassFromAll();
    this.classList.add('active');
})

weeklySum.addEventListener('click', function(event) {
    event.preventDefault()
    // TODO: build page
    setHtmlById('content-div', "Work In Progress");

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

blockListkLink.addEventListener('click', function(event) {
    event.preventDefault()
    //displayBlockListPage(); // TODO: this front end is ready the backend is not

    setHtmlById('content-div', "Work In Progress");

    // set active link item
    removeActiveClassFromAll();
    this.classList.add('active');
})


// first function that is called on enter
dispayUrlTimePage();

