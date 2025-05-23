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

import { UrlDataObj } from './urlDataObj.js';
import { getDateKey } from './utils.js';
import { __logger__ } from './utils.js';

const BLOCK_LIST_DATA_KEY = 'blockedUrlList';

// ==================================================== \\
// ==================================================== \\
// functions dependent on chrome API                    \\
// ==================================================== \\
// ==================================================== \\

/**
 * Asynchronously retrieves all keys stored in the Chrome extension's local storage.
 * This function utilizes the `chrome.storage.local` API, which is specifically designed
 * for extensions to persist user data locally.
 *
 * @returns {Promise<string[]>} A Promise that resolves with an array of strings,
 * where each string is a key found in `chrome.storage.local`.
 * The Promise will reject if there's an error during the retrieval process,
 * logging the error using `__logger__` and rejecting with `null`.
 *
 * @example
 * // Usage in an async function:
 * async function retrieveAndLogKeys() {
 * try {
 * const keys = await getAllChromeLocalStorageKeys();
 * console.log("All local storage keys:", keys);
 * } catch (error) {
 * console.error("Failed to get local storage keys:", error);
 * }
 * }
 * retrieveAndLogKeys();
 */
async function getAllChromeLocalStorageKeys() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, function (items) {
      if (chrome.runtime.lastError) {
        __logger__(
          'Error retrieving all chrome local storage keys. Runtime Error:',
          chrome.runtime.lastError
        );
        reject(null);
        return;
      }
      resolve(Object.keys(items));
    });
  });
}

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
        console.error(
          'Error removing item from local storage:',
          chrome.runtime.lastError
        );
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
    chrome.storage.local.set({ [key]: data }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving to local storage:',
          chrome.runtime.lastError
        );
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
 * @param {UrlDataObj} siteDataObj - The site data object to store.
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
  storeChromeLocalData(BLOCK_LIST_DATA_KEY, blockedUrlString);
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
    console.error('Error retrieving data:', error);
    return null;
  }
}

/**
 * Retrieves site data from Chrome local storage.  If no data exists,
 *  it creates a new tracking object.
 *
 * @async
 * @function getSiteObjData
 * @returns {Promise<UrlDataObj>} A Promise that resolves with the site data object.
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
    console.error(
      'Error: siteData is not instance of UrlDataObj - in getSiteObjData()'
    );
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
  let blockedSiteList = await getChromeLocalData(BLOCK_LIST_DATA_KEY);

  // create blockList if empty
  if (!blockedSiteList) {
    __logger__('Created new blockList');
    return [];
  }

  return JSON.parse(blockedSiteList);
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

export {
  getAllChromeLocalStorageKeys,
  removeChromeLocalStorageItem,
  setSiteObjData,
  setBlockedSiteList,
  getSiteObjData,
  getBlockedSiteList,
};
