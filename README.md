# TimeTracer - Chrome Extension for Tracking Website Usage

## This is a chrome extension that will track a users time on individual websites and communicate that time back to the user.

## Features
- All data is stored localy and not sent anywhere.
- Records time spent on all sites visited.

### Planned features
- Can flag / block URLs to redirect and keep you off that particular site
- See multiple days
- add sites that you don't want to see time on

## File Layout
- pkg/      -- The code in it's production script files
- src/      -- The source code in its files for testing and building (the html / css is only in pkg/popup)
- test.sh   -- This will run all the test files / scripts
- build.sh  -- This will parse all my src files into the production script files
- watch.sh  --  TODO: this is similar to nodemon, it will watch the src files and rebuild production on change
- todo.sh   -- a script that will print all `TODO:` to the console from `src/`

## Install Instructions
- Can be found on the chrome store [HERE](link) (not up yet).

### Manual install from src
1. Download the extension files (only need files in `pkg/`).
2. Open Chrome and navigate to chrome://extensions.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the extension's `pkg/` directory.   

## Resources:
- [Basics of Chrome Extensions](https://www.youtube.com/watch?v=Zt_6UXvoKHM)
- [Basics of Chrome Extensions Strange](https://www.youtube.com/watch?v=Is_ZA4yxliE)
- [Chrome API docs](https://developer.chrome.com/docs/extensions/reference/api/storage#local)
