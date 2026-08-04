# WebSocket Browser Api

The browser-side counterpart to the server-side `WsConnection`.

Read the [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) docs first
to understand the underlying browser object this class wraps.

#### construction of the object

```
class WebSocket {
    def onOpen: Signal[WebSocket, Int];
    def onMessage: Signal[WebSocket, WsMessageInfo];
    def onError: Signal[WebSocket, Int];
    def onClose: Signal[WebSocket, WsCloseInfo];

    func create(url: ptr[Char], protocols: ptr[Char]): SrdRef[WebSocket];
    func create(url: ptr[Char]): SrdRef[WebSocket];

    handler this.sendText(data: ptr[Char]): ptr[array[Char]];
    handler this.sendBinary(data: ptr[Char], dataLen: ArchWord): ptr[array[Char]];

    handler this.close(): ptr[array[Char]];
    handler this.close(code: Int): ptr[array[Char]];
    handler this.close(code: Int, reason: ptr[Char]): ptr[array[Char]];

    handler this.getState(): Int;
    handler this.getUrl(): ptr[array[Char]];
    handler this.getProtocol(): ptr[array[Char]];
    handler this.getExtensions(): ptr[array[Char]];
    handler this.getBufferedAmount(): ArchWord;
}
```

#### create a websocket instance

```
func create(url: ptr[Char], protocols: ptr[Char]): SrdRef[WebSocket];
func create(url: ptr[Char]): SrdRef[WebSocket];
```

You get an instance by calling `WebSocket.create(url)` (or `WebSocket.create(url, protocols)` to
offer subprotocols) — this is the *only* way to get one; there is no public constructor. It returns
a `SrdRef[WebSocket]`.

Always check whether the returned `SrdRef[WebSocket]` `.isNull()` before using it. It will be null if
something went wrong constructing the underlying browser WebSocket object — an invalid URL, a bad
scheme, malformed protocols, a URL containing a fragment, etc.

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket#exceptions) for the
exact list of exception cases.
This mirrors the real API: if the browser constructor throws, you never get an object back, so this
library never hands you a broken instance either — `create()` builds the object, attempts the
connection, and releases it again before returning if that attempt failed synchronously.

```
def ws: SrdRef[WebSocket] = WebSocket.create("ws://localhost:8060/echo");
if ws.isNull() {
    // bad URL/protocols - the connection never started
}
```

A `true` return from `create()`/a non-null `SrdRef` only means the connection attempt has started —
it does **not** mean the connection is open yet. Wait for `onOpen` for that.

### events

#### onOpen

```
def onOpen: Signal[WebSocket, Int];
```

Fires once the connection is established. Payload is unused (`Int`, always `0`).

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/open_event) for exactly when
this event fires.

#### onMessage

```
def onMessage: Signal[WebSocket, WsMessageInfo];
```

Fires once per received message. Payload is a `WsMessageInfo`, carrying the message's type (text or
binary) and its data:

```
class WsMessageInfo {
    def data: String;
    def isBinary: Bool;
}
```

* `data`: the message content. For text messages, the text itself. For binary messages, the raw bytes wrapped in a `String`.
* `isBinary`: `true` if the message was sent as binary, `false` if sent as text.

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event) for exactly when
this event fires.

#### onError

```
def onError: Signal[WebSocket, Int];
```

Fires on a genuine connection-level error. Payload is unused (`Int`, always `0`).

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event) for exactly when
this event fires.

#### onClose

```
def onClose: Signal[WebSocket, WsCloseInfo];
```

Fires once the connection is fully closed, whether initiated locally or by the server. Payload is a
`WsCloseInfo`:

```
class WsCloseInfo {
    def code: Int;
    def reason: String;
    def wasClean: Bool;
}
```

* `code`: the WebSocket close code.
* `reason`: the close reason string, if any.
* `wasClean`: whether the closing handshake completed cleanly.

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event) for exactly when
this event fires.

## websocket object methodes

#### sendText

```
handler this.sendText(data: ptr[Char]): ptr[array[Char]];
```

Sends a text message.

Returns a null pointer if the browser doesn't throw an exception,
or returns a pointer to the error message if an exception is thrown.

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send#exceptions) for exactly
when the underlying exception is raised.

#### sendBinary

```
handler this.sendBinary(data: ptr[Char], dataLen: ArchWord): ptr[array[Char]];
```

Sends `dataLen` raw bytes starting at `data`. Same return convention as `sendText`.

## close

```
handler this.close(): ptr[array[Char]];
handler this.close(code: Int): ptr[array[Char]];
handler this.close(code: Int, reason: ptr[Char]): ptr[array[Char]];
```

Closes the connection. The no-argument form uses code `1000` (normal closure) with no reason; the
other overloads let you specify a code and/or reason.

Returns a null pointer if the browser doesn't throw an exception,
or returns a pointer to the error message if an exception is thrown.

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close#exceptions) for exactly
when the underlying exception is raised.

## state

these methodes return the properties in the [Websocket browser API object](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

They all keep working after the connection has closed, same as the real `WebSocket` object does —
closing a connection doesn't make it stop being queryable. They only stop being valid once the
`WebSocket` object itself is destroyed.

#### getState

```
handler this.getState(): Int;
```

return the [readyState](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState) prop on the Websocket browser object.

#### getUrl

```
handler this.getUrl(): ptr[array[Char]];
```
return the [url](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/url) prop on the Websocket browser object.

#### getProtocol

```
handler this.getProtocol(): ptr[array[Char]];
```

return the [protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/protocol) prop on the Websocket browser object.

#### getExtensions

```
handler this.getExtensions(): ptr[array[Char]];
```
return the [extensions](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/extensions) prop on the Websocket browser object.

#### getBufferedAmount

```
handler this.getBufferedAmount(): ArchWord;
```

return the [bufferedAmount](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/bufferedAmount) prop on the Websocket browser object.

## lifetime

There's no explicit "disconnect and free" method — destroying the `SrdRef[WebSocket]` (it going out
of scope, being reassigned, or `.release()` being called on it) closes the connection with status code (1000) and cleans
everything up automatically.
