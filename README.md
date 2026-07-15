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

## Building and Packing
### 1. Local Development (Recommended)
You do not need to pack the extension to test your changes.
  - Open Chrome and navigate to chrome://extensions/.
  - Toggle Developer mode (top-right corner) to ON.
  - Click Load unpacked (top-left corner).
  - Select your extension-source directory.
  - To apply code changes: Simply click the Refresh (🔄) icon on the extension card.

### 2. Packaging the Extension (.crx)
When you are ready to compile a distributable production file:
  **First-Time Build (Generates your Private Key)**
  - Go to chrome://extensions/ and click Pack extension.
  - For Extension root directory, browse to and select your extension-source folder.
  - Leave Private key file blank.
  - Click Pack extension.
  - This outputs two files in your parent (timetracer/) directory:
  - extension-source.crx (The packed extension)
  - extension-source.pem (Your private key — keep this safe!)

  **Building an Update (Preserves Extension ID)**
  - To update your extension without changing its ID, you must sign it with your existing .pem key:
  - Increment the "version" field in your manifest.json.
  - Delete any old .crx files in your parent folder to prevent "file in use" errors.
  - Go to chrome://extensions/ and click Pack extension.
  - Set Extension root directory to your source folder.
  - Set Private key file to your existing extension-source.pem file.
  - Click Pack extension.

### 3. Installing the Packed .crx
- Go to chrome://extensions/ and ensure Developer mode is ON.
- Drag and drop your .crx file directly into the browser window to install.

