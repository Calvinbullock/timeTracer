import { UrlDataObj } from '../utils/urlDataObj.js';
import {
  cleanUrl,
  __logger__,
  checkInterval,
  convertMillisecondsToMinutes,
} from '../utils/utils.js';
import { getSiteObjData, setSiteObjData } from '../utils/chromeStorage.js';

const TIME_CHECK_ALARM = 'timeCheck';
const TIME_CHECK_INTERVAL_MILLISEC = 2 * 60000; // minutes * milliseconds

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
    console.error(
      'Error: siteData not instance of UrlDataObj - updateStoredData'
    );
  }

  siteDataObj.endSession(TIME_CHECK_INTERVAL_MILLISEC);
  if (!stopTracking) {
    siteDataObj.startSession(newActiveUrl);
  }

  setSiteObjData(siteDataObj);
}

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

  // TODO: check and redirect
  //checkBlockedUrls(activeUrl);

  updateActiveUrlSession(activeUrl, false);
  __logger__(`${logMsg} ${activeUrl}`, true);
}

/**
 * Asynchronously checks and updates the accuracy of the time spent on a website by
 *  comparing time stamps at set time periods to see if the users device is active or
 *  asleep.
 *
 * This function acts as a wrapper that allows the await key word.
 *
 * @returns {Promise<void>} A Promise that resolves when the operation is complete.
 */
async function checkIntervalWraper() {
  __logger__('Alarm fired.');
  let urlData = await getSiteObjData();
  urlData = checkInterval(urlData, TIME_CHECK_INTERVAL_MILLISEC);
  setSiteObjData(urlData);
}

/**
 * Creates a repeating alarm using the Chrome Alarms API.
 * This alarm will fire periodically at the specified interval.
 *
 * @param {string} alarmName - The unique name for the alarm.
 * @param {number} alarmIntervalMinutes - The interval in minutes after which the alarm should repeat.
 */
function createRepeatingAlarm(alarmName, alarmIntervalMinutes) {
  chrome.alarms.create(alarmName, {
    periodInMinutes: alarmIntervalMinutes,
  });
  __logger__(
    `Alarm '${alarmName}' created to fire every ${alarmIntervalMinutes} minutes.`
  );
}

// ===================================================== \\
// ===================================================== \\
//              Chromium API Event Listeners             \\
// ===================================================== \\
// ===================================================== \\

// ===================================================== \\
//                         Alarm                         \\
// ===================================================== \\

// Listen for the alarm event
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TIME_CHECK_ALARM) {
    checkIntervalWraper();
  }
});

// Create the alarm when the service worker starts or when the extension is installed/updated
//    (Chrome will not run the same alarm twice, they will not stack)
chrome.runtime.onStartup.addListener(() => {
  createRepeatingAlarm(
    TIME_CHECK_ALARM,
    convertMillisecondsToMinutes(TIME_CHECK_INTERVAL_MILLISEC)
  );
});
chrome.runtime.onInstalled.addListener(() => {
  createRepeatingAlarm(
    TIME_CHECK_ALARM,
    convertMillisecondsToMinutes(TIME_CHECK_INTERVAL_MILLISEC)
  );
});

// ===================================================== \\
//                      Lock / Sleep                     \\
// ===================================================== \\

// Set the detection interval for the 'idle' state (in seconds)
chrome.idle.setDetectionInterval(300); // 300 seconds = 5 minutes.
chrome.idle.onStateChanged.addListener((newState) => {
  __logger__(`Idle state changed to: ${newState}`);

  // idle is when system is locked or screen savor is active
  if (newState === 'idle') {
    // User has been inactive for the set duration
    __logger__('[LOGIC] User is likely inactive.');
    updateActiveUrlSession('', true); // true means exit only
  } else if (newState === 'active') {
    // User is active again
    __logger__('[LOGIC] User is active.');

    // When focused, query for the active tab in the currently focused window.
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        tabEnterOrChangeAction(activeTab.url, 'Active tab url on focus');
      } else {
        __logger__('No active tab found in the newly focused window.');
      }
    });
  } else if (newState === 'locked') {
    // System is locked (likely sleep or explicit lock)
    __logger__(`Lock state changed to: ${newState}`);
    __logger__('[LOGIC] System locked/sleeping.');
    updateActiveUrlSession('', true); // true means exit only
  }
});

// ===================================================== \\
//                    Tab / URL change                   \\
// ===================================================== \\

// checking if the current tab URL / site has changed
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // use them to remove eslint warnings
  tab;
  tabId;

  if (changeInfo.url) {
    tabEnterOrChangeAction(changeInfo.url, 'URL changed:');
  }
});

// get current URL on tab change
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    // handle tab errors
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError); // DEBUG:
      return;
    }
    tabEnterOrChangeAction(tab.url, 'Active Tab Url:');
  });
});

// ===================================================== \\
//                      Window Change                    \\
// ===================================================== \\

// chrome window leave, enter
chrome.windows.onFocusChanged.addListener(function (windowId) {
  // BUG: this is not trigger at the right times
  __logger__(`Chrome window ID ${windowId}.`);

  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // BUG: this is not trigger at the right times
    __logger__('All Chrome windows are now unfocused.', true);
    updateActiveUrlSession('', true);
  } else {
    __logger__(`Chrome window with ID ${windowId} is now focused.`, true);

    // When focused, query for the active tab in the currently focused window.
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        tabEnterOrChangeAction(activeTab.url, 'Active tab url on focus');
      } else {
        __logger__('No active tab found in the newly focused window.');
      }
    });
  }
});
