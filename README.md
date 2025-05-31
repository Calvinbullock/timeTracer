![Workflow Status](https://github.com/Calvinbullock/timeTracer/actions/workflows/lint.yaml/badge.svg)
![Workflow Status](https://github.com/Calvinbullock/timeTracer/actions/workflows/test.yaml/badge.svg)
![Workflow Status](https://github.com/Calvinbullock/timeTracer/actions/workflows/prettier.yaml/badge.svg)

# TimeTracer - Chrome Extension for Tracking Website Usage

## This is a chrome extension that will track a users time on individual websites and communicate that time back to the user.

## Features:

- All data is stored locally in chrome local and not sent anywhere else.
- Records time spent on all sites visited.

### Planned features:

- Can flag / block URLs to redirect and keep you off that particular site.
- See multiple days.
- add sites that you don't want to see time on.

## File Layout:

- buildFiles/ -- the chrome packaged files, production builds.
- TimeTracer/ -- The source code.
- test.sh -- This will run all the test files / scripts.
- todo.sh -- a script that will print all `TODO:` to the console from this directory.

### npm scripts:

- `npm run test`
- `npm run lint`

## Install Instructions:

- Can be found on the chrome store [HERE](https://chromewebstore.google.com/detail/timetracer/oalkfnhcckpeghkjmaoidcckokidaoap).

### Manual install from source (unpacked):

1. Download the extension files.
2. Open Chrome and navigate to chrome://extensions.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the `TimeTracer/` directory.  

### Manual install from source (packed):

1. Download the extension files.
2. Open Chrome and navigate to chrome://extensions.
3. Enable "Developer mode" in the top right corner.
4. Then in the top left click `Pack extension` and select the `TimeTracer/` directory. This will create a `.crx` file.
5. Drag that `.crx` file into the extensions page and it will load it.

## Resources:

- [Basics of Chrome Extensions](https://www.youtube.com/watch?v=Zt_6UXvoKHM)
- [Basics of Chrome Extensions Strange](https://www.youtube.com/watch?v=Is_ZA4yxliE)
- [Chrome API docs](https://developer.chrome.com/docs/extensions/reference/api/storage#local)

## Future plans / Road map

### Clean up / bug fixes
- add file header comments to files missing them
- move calcTime function / tests (??)
- isTimeElapsedWithinInterval needs tests (and re-design?)
- WARN: nulls might be being added to the url list - NOTE: unconfirmed...
- TODO: have a function that fires once a day at a set time to do data clean up (is this passable?)

### Release - 4
 - block list - (site blocker dialog)
      - DONE - add
      - DONE - remove
      - ---- - redirect
 - storage - clear data older then 28 days

### Future...
 - MAINTENANCE -- see if there is a way to easily test extension performance impact
 - MAINTENANCE -- make the different pages css consistent (margin, spacing, etc)
 - MAINTENANCE -- when date key changes need to run endSesstion

 - FEATURE -- add a total time count?
 - FEATURE -- add a button to clear / reset all local data (check the chrome API)
 - FEATURE -- add % of total time spent on each site (later)
 - FEATURE -- allow pausing of tracking
