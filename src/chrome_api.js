
/**
 * @fileoverview This script contains functions that interact with the Chrome
 * extension APIs for managing and retrieving website tracking data from
 * local storage. It also sets up event listeners to track URL changes,
 * active tab changes, and Chrome window focus changes to update the stored data.
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
 * It includes error handling for potential issues during the removal process
 * and logs messages to the console indicating success or failure.
 *
 * Note: While this function uses the asynchronous `chrome.storage.local.remove` API,
 * it is not marked as `async` because `chrome.storage.local.remove` itself uses
 * a callback function instead of returning a Promise.
 *
 * @param {string} key The key of the item to be removed from local storage.
 */
async function removeChromeLocalStorageItem(key) {
  try {
    chrome.storage.local.remove(key, function() {
      if (chrome.runtime.lastError) {
        console.error("Error removing item from local storage:", chrome.runtime.lastError);
      } else {
        console.log(`LOG - Item with key "${key}" removed from local storage.`);
      }
    });
  } catch (error) {
    console.error("An unexpected error occurred while trying to remove from local storage:", error);
  }
}

/**
 * Asynchronously stores data in Chrome's local storage.
 *
 * This function saves the provided data under the specified key in Chrome's
 * local storage, returning a Promise that resolves upon successful storage
 * or rejects if an error occurs. It also logs the outcome of the storage
 * operation to the console.
 *
 * @async
 * @function storeChromeLocalData
 * @param {string} key - The key under which to store the data.
 * @param {any} data - The data to be stored. This can be any JavaScript
 * object that is serializable.
 * @returns {Promise<void>} A Promise that resolves when the data is
 * successfully stored, or rejects if an error occurs.
 */
async function storeChromeLocalData(key, data) {
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
 * Retrieves data from Chrome's local storage.
 *
 * This asynchronous function retrieves data from Chrome's local storage using the provided key.
 * It handles potential errors during retrieval and returns the data or undefined if an error occurs.
 *
 * @param {string} key - The key of the data to retrieve.
 * @returns {Promise<any | undefined>} A Promise that resolves with the retrieved data, or undefined if an error occurred.
 */
async function getChromeLocalData(key) {
    try {
        const result = await chrome.storage.local.get([key]);
        //console.log(`LOG - retrieve: key: ${key}, value: ${result[key]}`);
        console.log(`LOG - retrieve: key: ${key}`);
        return result[key];

    } catch (error) {
        console.error("Error retrieving data:", error);
        return undefined;
    }
}

/**
 * Retrieves site data from Chrome local storage.  If no data exists,
 * it creates a new tracking object.
 *
 * @async
 * @function getSiteObjData
 * @returns {Promise<any>} A Promise that resolves with the site data object.
 */
async function getSiteObjData() {
    let key = "siteData";
    let siteDataString = await getChromeLocalData(key);

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
 * Stores site data to Chrome local storage.
 *
 * @async
 * @function setSiteObjData
 * @param {any} siteDataObj - The site data object to store.
 * @returns {Promise<void>} A Promise that resolves when the data is successfully stored.
 */
async function setSiteObjData(siteDataObj) {
    let key = "siteData";
    const siteDataString = siteDataObj.toJSONString();
    storeChromeLocalData(key, siteDataString);
}

// ADD_TO_FRONT_END_END

/**
 * Manages the tracking session for the currently active URL.
 *
 * This asynchronous function retrieves the stored website tracking data,
 * ends the current session (if one exists), and potentially starts a new
 * tracking session for the provided `newActiveUrl`. It then saves the
 * updated tracking data back to Chrome's local storage.
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

// ===================================================== \\
// ===================================================== \\
//              Chromium API Event Listeners             \\
// ===================================================== \\
// ===================================================== \\

// checking if the current tab URL / site has changed
chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        // get url, then update siteList
        let activeUrl = cleanUrl(changeInfo.url);
        updateActiveUrlSession(activeUrl, false);
        console.log("LOG - URL changed: " + activeUrl); // DEBUG:
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

        // get url, then update siteList
        let activeUrl = cleanUrl(tab.url); // get new URL
        updateActiveUrlSession(activeUrl, false);
        console.log("LOG - Active Tab URL: ", activeUrl); // DEBUG:
    });
});

// chrome window leave, enter
chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        console.log("LOG - All Chrome windows are now unfocused.");
        updateActiveUrlSession("", true);

    } else {
        console.log(`LOG - Chrome window with ID ${windowId} is now focused.`);

        // When focused, query for the active tab in the currently focused window.
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
                const activeTab = tabs[0];
                const activeUrl = cleanUrl(activeTab.url);

                console.log("LOG - Active Tab URL on focus:", activeUrl);
                updateActiveUrlSession(activeUrl, false); // Start tracking the newly active URL
            } else {
                console.log("LOG - No active tab found in the newly focused window.");
            }
        });
    }
});



