# Capstone - PuttRyte

This is an application for improving the putting swing of the user.
The user can place the camera of their device over the ball and record their putting swing.
The application will analyze the swing and provide feedback based on how the user can improve.

## PuttRyte Architecture
PuttRyte is a mobile application built with Ionic and React with an integrated 
"backend" written in Javascript.

### App
- Mobile Application (To be built with Ionic and run on mobile devices)
- Ionic app (created with ionic start myApp blank --type=react)
- code is located in putt-ryte/app directory

### API (Backend)
- "mimics" node server
- code to be located in putt-ryte/src directory

## Required Technology
- Node
    - https://nodejs.org/en/download/current/
- Java
    - https://java.com/en/download/
- Android Studio
    - https://developer.android.com/studio
    - set up SDK (C:\Users\user\AppData\Local\Android\Sdk)
        - File => Settings => Appearance & Behavior => System Settings => Android SDK
            - SDK Tools => Show Package Details => Android SDK Build-Tools => check 29.0.2 and apply
- Under app/node_modules, open cordova-plugin-video-capture-plus/plugin.xml and comment out :
    -    ```       
                <provider
                         android:name="android.support.v4.content.FileProvider"
                         android:authorities="nl.x-services.plugins.videocaptureplus.provider"
                         android:exported="false"
                         android:grantUriPermissions="true">
                     <meta-data
                             android:name="android.support.FILE_PROVIDER_PATHS"
                             android:resource="@xml/provider_paths"/>
                 </provider>```
                 
        

## Available Scripts
Change to the 'app' directory.

#### `cd app`
In the 'app' directory:
#### `ionic serve`
Runs the app in the development mode.
Open http://localhost:8100 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### To Run On Mobile Device

- Enable USB Debugging on Android Device
    - https://developer.android.com/studio/debug/dev-options

#### `ionic build`
#### `ionic cap copy android` or `ionic cap copy ios`
#### `ionic cap open android` or `ionic cap open ios`

- Run app in Android Studio or Xcode

## Client Development
Please see the [app-specific readme](app/README.md).