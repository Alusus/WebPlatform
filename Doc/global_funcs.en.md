# WebPlatform

[[عربي]](global_funcs.ar.md)

[[Back]](../readme.md)

## Global Functions and Variables

### webPlatformPath

```
def webPlatformPath: String;
```

Path to WebPlatform source files.


### getBuildDependencies

```
func getBuildDependencies(): Array[String];
```

A function that return an array of libraries and packages required to build a binary version of the
application.


### createElement

```
function createElement (type: ptr[Char], name: ptr[Char], parent: ptr[Char]);
```

Creates an element in the DOM of the browser. This is what widgets use to display themselves in the
browser.

Parameters:

`type` the type of the component we want to create.

`name` the name of the component we want to create.

`parent` the component we want to add the created component to it.


### setElementAttribute

```
function setElementAttribute (name: ptr[Char], prop: ptr[Char], value: ptr[Char])
```

Sets an attribute for a given DOM element. Used by the widgets to set the attributes of
corresponding DOM elements.

Parameters:

`name` component's name.

`prop` the name of the attribute we want to set its value.

`value` the value of the attribute we want to set


### getElementAttribute

```
function getElementAttribute (name: ptr[Char], prop: ptr[Char]): CharsPtr;
```

Gets an attribute for a given DOM element.

Parameters:

`name` component's name.

`prop` the name of the attribute we want to retrieve.


### removeElementAttribute

```
function removeElementAttribute (name: ptr[Char], prop: ptr[Char]);
```

Removes an attribute from a given DOM element.

Parameters:

`name` component's name.

`prop` the name of the attribute we want to remove.


### setStyleRule

```
function setStyleRule (name: ptr[Char], selector: ptr[Char], css: ptr[Char])
```

Sets the body of a style in the browser. Used by styling classes to apply the styles in the browser.

Parameters:

`name` the name of the rule we want to add.

`selector` the selector responsible for selecting the components to apply the style on them.

`css` the styles of the rule.


### runEventLoop

```
function runEventLoop;
```

Processes the event loop infinitely. The user needs to process the events periodically, otherwise
events won't fire and the app won't respond to user actions.


### dispatchEvents

```
function dispatchEvents;
```

Process all queued events and returns without waiting for more events.


### waitForEvent

```
function waitForEvent;
```

Blocks the execution until an event arrives in the queue.


### startServer

```
func startServer [modules: ast_ref = Root] (
    mainAssetsPath: String, uiEndpointsPath: String, options: Array[CharsPtr]
): ptr[ServerSession];
```

A function used to start the server. This function is responsible for discovering UI and backend endpoints to serve
in the server, but it does not handle building the UI files required by the browser to render the UI.
To generate the UI files, use the `buildUiEndpoints` function or the `buildAndStartServer` function.

Parameters:

`modules`: The modules where endpoint definitions should be searched for. This parameter can refer to a specific module
or a group of modules, as shown in the example below.

`mainAssetsPath`: The path where the main assets generated by the web platform during UI building are stored. This path
must match the one provided to the `buildUiEndpoints` function.

`uiEndpointsPath`: The path where the UI endpoint files generated by the web platform during UI building are stored.
This path must match the one provided to the buildUiEndpoints function.

`options`: The server options to be passed to the HTTP server. Refer to the Http library documentation for more details
on available options.

Return Value:

A pointer to the server session data, or 0 if the server fails to start. This pointer must later be passed to the
`stopServer` function.

Example for creating a server that searches for endpoint definitions in multiple modules:

```
def serverModules: { Module1, Module2 };
startServer[serverModules](mainAssetsPath, uiEndpointsPath, options);
```


### stopServer

```
func stopServer(serverSession: ptr[ServerSession]);
```

Stops the server that was started using the `startServer` function.

Parameters:

`serverSession`: A pointer to the session data received from the startServer function.


### ServerSession

A class containing data related to the server session. It includes the following variable:

`httpContext: ptr[Http.Context]`: A pointer to the context that can be used to interact directly with the Http library.


### runServer

```
func runServer [modules: ast_ref = Root] (
    mainAssetsPath: String, uiEndpointsPath: String, options: Array[CharsPtr]
);
```

Similar to `startServer`, but it starts the server and never returns, keeping the program running to serve requests.
See `startServer` for more details on parameters.


### buildAndStartServer

```
func buildAndStartServer [modules: ast_ref = Root] (options: Array[CharsPtr]): ptr[ServerSession];
```

Similar to `startServer`, but it builds the UI endpoints before starting the server. This function places the generated
files in a temporary directory. See startServer for more details on parameters and return values.


### buildAndRunServer

```
func buildAndRunServer [modules: ast_ref = Root] (options: Array[CharsPtr]);
```

Similar to `runServer`, but it builds the UI endpoints before starting the server. This function places the generated
files in a temporary directory. See startServer for more details on parameters.


### startTimer

```
function startTimer (duration: Word, cb: closure (Json)): ArchInt;
```

Starts a timer to call the given closure periodically.

Parameters:

`duration` the duration between two calls of the closure, in microseconds.

`cb` the closure we want to call periodically.

Return value:

`ArchInt` the id of this timer.


### stopTimer

```
function stopTimer (id: ArchInt);
```

Stops a periodic timer.

Parameters:

`id` a unique identifier for the timer we want to stop.


### setTimeout

```
function setTimeout (duration: Word, cb: closure (Json)): ArchInt;
```

Starts a timer which calls the given closure only once.

Parameters:

`duration` the time until executing the closure, in microseconds.

`cb` the closure we want to execute.

Return value:

`ArchInt` the identifier of the timer.


### cancelTimeout

```
function cancelTimeout (id: ArchInt);
```

Cancels the one-time timer before it's triggered.

Parameters:

`id` the unique identifier of the timer we want to stop.


### sendRequest

```
function sendRequest (
    method: ptr[Char], uri: ptr[Char], headers: ptr[Char], body: ptr[Char], timeoutInMs: Int,
    cb: closure (Json)
): ArchInt;
function sendRequest (
    method: ptr[Char], uri: ptr[Char], headers: ptr[Char], body: ptr[Char], timeoutInMs: Int
): SrdRef[Promise[Json]];
```

A function to send an HTTP request. The first form of the function invokes the callback (cb) when
the request is complete, while the second form returns a promise with the result of the request.
The response data is formatted as JSON and has the following structure:

```
{
    "eventData": {
        "status": <number>,
        "headers": { "key1": "val1", "key2": "val2", ... },
        "body": <string>
    }
}
```

The callback form of this function returns an ID that can later be used to cancel the request using
cancelRequest.


### cancelRequest

```
function cancelRequest (requestId: ArchInt);
```

Cancels an ongoing request. The provided ID is the ID obtained from sendRequest.


### loadFont

```
function loadFont (fontName: ptr[Char], url: ptr[Char]): SrdRef[Promise[Int]];
```

A function used to load some font.

Parameters:

`fontName` A name to give the loaded font. This is used later on to reference this font in the UI.

`url` the path where font file exist.


### loadJsScript

```
function loadJsScript (url: ptr[Char]): SrdRef[Promise[Int]];
```

A function used to load a JavaScript script. This is useful for integrating with third party JS
libraries.

Parameters:

`url` script path.


### callCustomJsFn

```
function callCustomJsFn (fnName: ptr[Char], arg: ptr[Char]): ptr[Char];
```

A function used to call an arbitrary JavaScript function. Useful for calling external libraries.

Parameters:

`fnName` the name of the function we want to call.

`arg` arguments we want to pass to the js function.

Return value:

`ptr[Char]` the result returned by the called js function.


### callCustomAsyncJsFn
```
function callCustomAsyncJsFn (fnName: ptr[Char], arg: ptr[Char]): SrdRef[Promise[String]];
```

Calls an async JavaScript function. Useful for calling external libraries.

Parameters:

`fnName` the name of the function we want to call.

`arg` arguments we want to pass to the js function.

Return value:

`ptr[Char]` the result of the call as a promise because the call is async.


### requestWakeLock

```
function requestWakeLock (): SrdRef[Promise[Bool]];
```

Requests disabling screen lock while the app is running. Returns true when successful, 0
when unsuccessful or if the browser does not support this operation.


### exitWakeLock

```
function exitWakeLock (): SrdRef[Promise[Bool]];
```

Exists the wake lock state. Returns true on success, false on failure or if the browser
does not support this operation.


### getUserLanguages

```
func getUserLanguages(): Array[String];
```

Returns user language preferences as set in the browser.


### getPreferredLanguage

```
func getPreferredLanguage(availableLangues: Array[String]): String;
```

A function that returns the user's preferred language from a set of languages. This function
returns the first language from the preferred user languages that matches one of the given
languages. If no match is found, it returns the first language from the given languages.

Parameters:

`availableLangues` the available languages to select from it.


### isDarkColorSchemePreferred

```
function isDarkColorSchemePreferred (): Bool;
```

Returns whether dark mode is preferred on the user's OS.


### getTimestamp

```
function getTimestamp (): Int[64];
```

A function used to get the current timestamp, in milliseconds.


### getDate

```
function getDate(type: CharsPtr, timestamp: Int[64]): CharsPtr;
```

Returns the date as a string.

`type`: The requested format for the returned string. It can be `iso`, `locale`, or an empty string.

`timestamp`: The timestamp for which we want the date string. If this is -1 the current timestamp
will be used.


### exitPointerLock

```
function exitPointerLock();
```

Removes the lock on the pointer.


### exitFullScreen

```
function exitFullScreen();
```

Exists full screen mode.


### getGamepadsCount

```
function getGamepadsCount (): Int;
```

Retrieves the number of connected gamepads.


### getGamepadId

```
function getGamepadId (gpIndex: Int): ptr[array[Char]];
```

Retreives the id of the gamepad with the given index.


### getGamepadAxesCount

```
function getGamepadAxesCount (gpIndex: Int): Int;
```

Retrieves the number of axes of the gamepad with the given index.


### getGamepadButtonsCount

```
function getGamepadButtonsCount (gpIndex: Int): Int;
```

Retrieves the number of buttons of the gamepad with the given index.


### getGamepadAxis

```
function getGamepadAxis (gpIndex: Int, axisIndex: Int): Float;
```

Retrieves the value of given axis on the gamepad with the given index.

Parameters:

`gpIndex` gamepad index.

`axisIndex` the axis index that we want its value.


### getGamepadButton

```
function getGamepadButton (gpIndex: Int, btnIndex: Int): Float;
```

Retrieves the value of some button on the gamepad with the given index.

Parameters:

`gpIndex` gamepad index.

`btnIndex` the button we want its value.


### httpRedirect

```
function httpRedirect (address: ptr[Char]);
```

Performs an HTTP redirect.

Parameters:

`address` the address we want to redirect to.


### logToConsole

```
function logToConsole (msg: ptr[Char]);
```

Prints some message to the browser's console.


### matchRegex

```
function matchRegex (str: ptr[array[Char]], regex: ptr[array[Char]], lastIndex: ref[Int]): Array[String];
function matchRegex (str: ptr[array[Char]], regex: ptr[array[Char]]): Array[String];
function matchRegex (str: ptr[array[Char]], regexId: ArchInt, lastIndex: ref[Int]): Array[String];
function matchRegex (str: ptr[array[Char]], regexId: ArchInt): Array[String];
```

A function used to match between a text and a pattern, and has four versions:

Version 1 parameters:

* `str` the text we want to match it with the pattern.
* `regex` the pattern used for matching.
* `lastIndex` this parameter determine the index that we should start next matching process from it.

Version 2 parameters:

* `str` the text we want to match it with the pattern.
* `regex` the pattern used for matching.

Version 3 parameters:

* `str` the text we want to match it with the pattern.
* `regexId` the pattern id used for matching.
* `lastIndex` this parameter determine the index that we should start next matching process from it.

Version 4 parameters:

* `str` the text we want to match it with the pattern.
* `regexId` the pattern id used for matching.


### isAppUpdateAvailable

```
function isAppUpdateAvailable (): Bool;
```

Returns true if an update is available for the app, which is when the version number is updated in
the args of `@webApp` modifier.


### updateApp

```
function updateApp();
```

Updates the web app to the version that has been loaded into the browser and is awaiting activation.


### getAppDisplayMode

```
function getAppDisplayMode(): ptr[Char];
```

Returns the current mode of the web app. The return value can be one of the following:
* `browser`: The app is running in the browser.
* `twa`: The app is running as a Trusted Web Activity.
* `standalone`: The app is running as a standalone app.


### isAppInstallPromptAvailable

```
function isAppInstallPromptAvailable (): Bool;
```

Returns 1 if the app can be installed to the device. This happens when all the followings
conditions are met:
* The UI endpoint has the `@webApp` modifier.
* The site is running in HTTPS.
* The browser supports Progressive Web Apps.
* The app is not already installed.


### showAppInstallPrompt

```
function showAppInstallPrompt(): Bool;
```

Triggers the system's app installation prompt. Returns 1 if successful, and 0 if no install
prompt is available.


### suspendAudioContext

```
function suspendAudioContext();
```

Suspends the audio context which results in pausing all sounds.


### resumeAudioContext

```
function resumeAudioContext();
```

Resumes the operation of the audio context. You need to call this function when the app's visibility
changes from non-visible to visible because the operating system may suspend the audio context when
the app is pushed to the background (as is the case with iOS).

