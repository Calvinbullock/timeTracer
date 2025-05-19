
// ===================================================== \\
// ===================================================== \\
//                    Test Helpers
// ===================================================== \\
// ===================================================== \\

// this mute code is from:
//   https://www.bomberbot.com/javascript/how-to-silence-your-javascript-console-for-cleaner-unit-testing/
console.original = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  trace: console.trace
};

function muteConsole() {
  console.log = function() {};
  console.info = function() {};
  console.warn = function() {}
  console.error = function() {};
  console.trace = function() {};
}

function unmuteConsole() {
  console.log = console.original.log;
  console.info = console.original.info;
  console.warn = console.original.warn;
  console.error = console.original.error;
  console.trace = console.original.trace;
}


export {
  muteConsole,
  unmuteConsole
};
