
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

// ADD_TO_FRONT_END_START

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
                __logger__(`Item with key "${key}" removed from local storage.`);
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
                __logger__(`Stored: key: ${key}`);
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
        __logger__(`Retrieve: key: ${key}`);
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
        __logger__(`Created new blockList`);
        return [];
    }

    return JSON.parse(blockedSiteList);
}

// ADD_TO_FRONT_END_END

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
    __logger__(`${logMsg} ${activeUrl}`, true);
}

// ===================================================== \\
// ===================================================== \\
//              Chromium API Event Listeners             \\
// ===================================================== \\
// ===================================================== \\


// ===================================================== \\
//                      Lock / Sleep                     \\
// ===================================================== \\

// Set the detection interval for the 'idle' state (in seconds)
chrome.idle.setDetectionInterval(300); // 300 seconds = 5 minutes.
chrome.idle.onStateChanged.addListener((newState) => {
    __logger__(`Idle state changed to: ${newState}`);

    // idle is when system is locked or screen savor is active
    if (newState === "idle") {
        // User has been inactive for the set duration
        __logger__("[LOGIC] User is likely inactive.");
        updateActiveUrlSession("", true); // true means exit only

    } else if (newState === "active") {
        // User is active again
        __logger__("[LOGIC] User is active.");

        // When focused, query for the active tab in the currently focused window.
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];
                tabEnterOrChangeAction(activeTab.url, `Active tab url on focus`);

            } else {
                __logger__("No active tab found in the newly focused window.");
            }
        });
    } else if (newState === "locked") {
        // System is locked (likely sleep or explicit lock)
        __logger__(`Lock state changed to: ${newState}`);
        __logger__("[LOGIC] System locked/sleeping.");
        updateActiveUrlSession("", true); // true means exit only
    }
});

// ===================================================== \\
//                    Tab / URL change                   \\
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

// ===================================================== \\
//                      Window Change                    \\
// ===================================================== \\

// chrome window leave, enter
chrome.windows.onFocusChanged.addListener(function(windowId) {
    // BUG: this is not trigger at the right times
    __logger__(`Chrome window ID ${windowId}.`);

    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // BUG: this is not trigger at the right times
        __logger__("All Chrome windows are now unfocused.", true);
        updateActiveUrlSession("", true);

    } else {
        __logger__(`Chrome window with ID ${windowId} is now focused.`, true);

        // When focused, query for the active tab in the currently focused window.
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];
                tabEnterOrChangeAction(activeTab.url, `Active tab url on focus`);

            } else {
                __logger__("No active tab found in the newly focused window.");
            }
        });
    }
});



