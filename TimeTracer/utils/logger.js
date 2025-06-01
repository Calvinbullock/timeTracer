import { formatDateTime } from './utils';

/**
 * Logs a message to the console, optionally adding empty lines before and after for better readability.
 *
 * @param {string} msg The message to be logged.
 * @param {boolean} [buffer=false] If true, adds an empty line before and after the log message. Defaults to false.
 */
function __logger__(msg, buffer = false) {
  let timeStamp = formatDateTime();
  if (buffer) {
    console.log('');
    console.log(`${timeStamp} - ${msg}`);
    console.log('');
  } else {
    console.log(`${timeStamp} - ${msg}`);
  }
}

export { __logger__ };
