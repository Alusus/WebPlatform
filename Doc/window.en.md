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

Fetches the current location.

#### hash

```
handler this.hash: String;
```

Fetches the part of the URL following the # symbol.

#### query

```
handler this.query: String;
```

Fetches the query string from the URL, i.e the part of the URL follwing the ? mark.

#### pushLocation

```
handler this.pushLocation (url: ptr[array[Char]]);
```

A function to add a path to the browser's history. This function allows changing the browser's
address without reloading the page.

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

