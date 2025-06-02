![Workflow Status](https://github.com/Calvinbullock/timeTracer/actions/workflows/lint.yaml/badge.svg)
![Workflow Status](https://github.com/Calvinbullock/timeTracer/actions/workflows/test.yaml/badge.svg)
![Workflow Status](https://github.com/Calvinbullock/timeTracer/actions/workflows/prettier.yaml/badge.svg)

# TimeTracer - Chrome Extension for Tracking Website Usage

This is a chrome extension that will track a users time on individual websites and communicate that time back to the user.

## Features:

- All data is stored locally in chrome local and not sent anywhere else.
- Records time spent on all sites visited.
- Shows data from yesterday and averages for the last 7 days.

### Planned features:

- Can flag / block URLs to redirect and keep you off that particular site.

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

## File Layout:

- buildFiles/ -- the chrome packaged files, production builds.
- TimeTracer/ -- The source code.
- todo.sh -- a script that will print all `TODO:` to the console from this directory.

### npm scripts:

- `npm run test`
- `npm run lint`

## Resources:

- [Basics of Chrome Extensions](https://www.youtube.com/watch?v=Zt_6UXvoKHM)
- [Basics of Chrome Extensions Strange](https://www.youtube.com/watch?v=Is_ZA4yxliE)
- [Chrome API docs](https://developer.chrome.com/docs/extensions/reference/api/storage#local)
