
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
 * @fileoverview This script contains functions that interact with the Chrome
 *  extension APIs for managing and retrieving website tracking data from
 *  local storage. It also sets up event listeners to track URL changes,
 *  active tab changes, and Chrome window focus changes to update the stored data.
 *
 * NOTE: all code in this file has no automated tests (this code is not easily tested).
 *
 * @author: Calvin Bullock
 * @date Date of creation: April, 2025
 */

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

/**
 * Manages the tracking session for the currently active URL.
 *
 * This asynchronous function retrieves the stored website tracking data,
 *  ends the current session (if one exists), and potentially starts a new
 *  tracking session for the provided `newActiveUrl`. It then saves the
 *  updated tracking data back to Chrome's local storage.
 *
 * @async
 * @function updateActiveUrlSession
 * @param {string} newActiveUrl - The URL of the currently active tab. If
 *      empty, it signifies no active URL.
 * @param {boolean} [stopTracking=false] - A boolean indicating whether to
 *      explicitly end the current tracking session without starting a new
 *      one. This is typically used when the browser loses focus or no tab
 *      is active.
 * @returns {Promise<void>} A Promise that resolves when the tracking session
 *      has been updated and the data has been successfully stored.
 */
async function updateActiveUrlSession(newActiveUrl, stopTracking) {
    let siteDataObj = await getSiteObjData();

    if (!(siteDataObj instanceof UrlDataObj)) {
        console.error("Error: siteData not instance of UrlDataObj - updateStoredData");
    }

    // exit session
    if (stopTracking) {
        siteDataObj.endSession();

    } else {
        siteDataObj.endSession();
        siteDataObj.startSession(newActiveUrl);
    }

    setSiteObjData(siteDataObj);
}

// TODO: finish this
// async function checkBlockedUrls(newActiveUrl) {
//     const blockedUrlsList = await getBlockedSiteList();
//
//     // check if newActive Url is on block list
//     if (blockedUrlsList.includes(newActiveUrl)) {
//         console.log(`--> popup`)
//
//     }
// }

/**
 * Handles actions to be performed when a new tab becomes active or the URL of the current tab changes.
 * It cleans the provided URL, checks if it's blocked and potentially redirects, then if not blocked
 * updates the active URL session, and logs the event.
 *
 * @param {string} activeUrl - The URL of the newly active or changed tab.
 * @param {string} logMsg - A message to be included in the console log for this action.
 * @returns {void} - This function does not return any value.
 */
function tabEnterOrChangeAction(activeUrl, logMsg) {
    activeUrl = cleanUrl(activeUrl);

    // check and redirect
    //checkBlockedUrls(activeUrl);

    updateActiveUrlSession(activeUrl, false);
    console.log("");
    console.log(`LOG - ${logMsg} ${activeUrl}`);
}

// ===================================================== \\
// ===================================================== \\
//              Chromium API Event Listeners             \\
// ===================================================== \\
// ===================================================== \\

// checking if the current tab URL / site has changed
chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        tabEnterOrChangeAction(changeInfo.url, `URL changed:`);
    }
});

// get current URL on tab change
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        // handle tab errors
        if(chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError); // DEBUG:
            return;
        }
        tabEnterOrChangeAction(tab.url, `Active Tab Url:`);
    });
});

// chrome window leave, enter
chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // BUG: this is trigger to often
        console.log("LOG - All Chrome windows are now unfocused.");
        console.log("");
        updateActiveUrlSession("", true);

    } else {
        console.log("");
        console.log(`LOG - Chrome window with ID ${windowId} is now focused.`);

        // When focused, query for the active tab in the currently focused window.
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];
                tabEnterOrChangeAction(activeTab.url, `Active tab url on focus`);

            } else {
                console.log("LOG - No active tab found in the newly focused window.");
            }
        });
    }
});



