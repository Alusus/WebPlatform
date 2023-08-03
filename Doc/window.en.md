# WebPlatform

[[عربي]](window.ar.md)

[[Back]](../readme.md)

## Window

A class representing the main window of the application, which corresponds to the tab/window in
a browser or the application window in the case of web applications.

#### instance

```
@shared def instance: Window(0~cast[ptr]);
```

The singleton that represents the main window.

#### style

```
handler this.style: SrdRef[StyleSet];
```

Gets the StyleSet of the window. This will create the StyleSet if it's not already created.

#### sessionStorage

```
def sessionStorage: Storage(0);
```

Storage used to save data to the session.

#### localStorage

Storage used to save data to the local storage.

#### setView

```
handler this.setView(v: SrdRef[Widget]);
```

Sets the main view of the app.

#### unsetView

```
handler this.unsetView();
```

Removes the main view of the app.

#### location

```
handler this.location: String;
```

Fetches the complete URL of the current page.

#### locationProtocol

```
handler this.locationProtocol: String;
```

Fetches the protocol of the current URL (http or https).

#### locationHost

```
handler this.locationHost: String;
```

Fetches the host from the current URL.

#### locationPath

```
handler this.locationPath: String;
```

Fetches the path from the current URL.

#### locationQuery

```
handler this.locationQuery: String;
```

Fetches the query string from the URL, i.e the part of the URL follwing the ? mark.

#### locationHash

```
handler this.locationHash: String;
```

Fetches the part of the URL following the # symbol.

#### getQueryParam

```
handler this.getQueryParam(paramName: CharsPtr): String;
```

Fetches the value of a specific query param. Returns an empty string if no param was found with the given name.

#### pushLocation

```
handler this.pushLocation (url: ptr[array[Char]]);
```

A function to add a path to the browser's history. This function allows changing the browser's
address without reloading the page.

#### visible

```
handler this.visible: Bool;
```

Returns true if the page is currently visible, and false if it's not (for example, the browser window
is minimized or the browser's focus is currently on a different tab).

#### postMessage

```
handler this.postMessage (msgType: CharsPtr, msgBody: CharsPtr);
```

Used to send arbitrary messages to the current window. The message will be sent as a JSON object having two
properties: type & body, whose values are from the function params.

#### postMessageToParent

```
handler this.postMessageToParent (msgType: CharsPtr, msgBody: CharsPtr);
```

Similar to `postMessage` except that it sends the message to the owner of this window, which only applies
in cases where this site is opened inside the iframe of another site, in which case the message is sent
to the site owning the iframe.

#### onKeyDown

```
def onKeyDown: DomEventSignal[Window, String];
```

Fires when a keyboard key has been pressed.

#### onKeyUp

```
def onKeyUp: DomEventSignal[Window, String];
```

Fires when a keyboard key has been released.

#### onPointerLockChange

```
def onPointerLockChange: DomEventSignal[Window, Bool];
```

Fires when the pointer lock changes.

#### onFullScreenChange

```
def onFullScreenChange: DomEventSignal[Window, Bool];
```

Fires when the full screen mode changes.

#### onGamepadConnected

```
def onGamepadConnected: DomEventSignal[Window, String];
```

Fires when a gamepad is connected.

#### onGamepadDisconnected

```
def onGamepadDisconnected: DomEventSignal[Window, String];
```

Fires when a gamepad is disconnected.

#### onLocationChanged

```
def onLocationChanged: DomEventSignal[Window, Int];
```

Triggered when the browser's path changes without page reload. This event is triggered when the
pushLocation function is called or when the user presses the browser's back or forward button.

#### onVisibilityChanged

```
def onVisibilityChanged: DomEventSignal[Window, Int];
```

Triggered when the visibility state of the page is changed from visible to non-visible or
vice versa.

#### onMessage

```
def onMessage: DomEventSignal[Window, Json];
```

Triggered when a message is posted to this window.

