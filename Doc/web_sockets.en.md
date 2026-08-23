# WebPlatform

[[عربي]](web_sockets.ar.md)

[[Back]](../README.md)

## Overview

WebSocket support in WebPlatform has two independent halves that mirror each other:

* **`WsRoute`** — the server-side endpoint. An instance is created for every client connection made
  to a route you define, and it stays alive for the lifetime of that connection.
* **`WsClient`** — the browser-side client, a thin wrapper around the browser's native `WebSocket`
  object. Read the
  [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) docs first to
  understand the underlying object this class wraps.

You'll typically use both together: a `WsRoute` endpoint on the backend, and a `WsClient` connecting
to it from a `uiEndpoint` page on the frontend.

## Server Side: WsRoute

### Creating a WsRoute Endpoint

You can create a websocket endpoint by writing a regular class, adding the `wsRoute` modifier to it
with the URI it should listen on, and injecting `WsRoute` into it using the `@injection` modifier.

```
@wsRoute["/chat"]
class ChatSocket {
    @injection def wsRoute: WsRoute;
}
```

Now you have a websocket endpoint listening at `/chat`. A new instance of `ChatSocket` is created for
every client connection and stays alive for the lifetime of that connection.

### Timeouts

When you start the server (`runServer`, `startServer`, `buildAndRunServer`, etc.), you can override
`websocket_timeout_ms` through the `options: Array[CharsPtr]` argument. It controls how long a
`WsRoute` connection can sit without a response before the server treats it as unresponsive and closes
it. It defaults to `10000` (10 seconds) if you don't set it yourself.

```
runServer[serverModules](
    mainAssetsPath, uiEndpointsPath,
    Array[CharsPtr]({ "listening_ports", "8010", "websocket_timeout_ms", "30000" })
);
```

Don't change this value casually — test it against your own expected load first before relying on a
different value in production.

The server also enables CivetWeb's built-in ping/pong handling for all websocket connections: it
auto-replies to client PING frames with PONG and filters PONG frames out before they ever reach
`onData`, so you never need to handle those yourself.

### Overriding Handlers

`WsRoute` gives you four handlers you can override to react to the connection's lifecycle:

* `onConnect`: called when a client starts the handshake to establish a connection. At this point
  `this.connection` (a raw `ptr[Http.Connection]`) is already set, so you can inspect the handshake
  request (headers, query string, etc.) via `Http.getRequestInfo(this.connection)`. Return `0` to
  accept the connection, or `1` to reject it.

* `onReady`: called once the handshake is done and the connection is open. This is the first point at
  which you can send data.

* `onData`: called once per complete message (text or binary), after any fragmentation across
  multiple frames has been reassembled internally. The message bytes are passed as
  `data: ref[Array[Char]]`.

* `onClose`: called after the connection has been closed.

Because these handlers live on the injected `WsRoute`, you override them with this syntax, matching
the original signature exactly:

```
handler (this: WsRoute).onConnect() : Int set_ptr {
    Console.print("request method: %s\n", Http.getRequestInfo(this.connection)~cnt.requestMethod);
    Console.print("we have new connection now\n");
    return 0;
}
```

`(this: WsRoute)` tells the compiler you're providing an implementation for one of `WsRoute`'s
handlers, and `set_ptr` installs it as the one used for this class instead of the default. You don't
have to override all four — any handler you skip keeps `WsRoute`'s default (no-op) behavior.

Putting it together:

```
@wsRoute["/chat"]
class ChatSocket {
    @injection def wsRoute: WsRoute;

    handler (this: WsRoute).onConnect() : Int set_ptr {
        Console.print("request method: %s\n", Http.getRequestInfo(this.connection)~cnt.requestMethod);
        Console.print("we have new connection now\n");
        return 0;
    }

    handler (this: WsRoute).onReady() : Void set_ptr {
        this.sendText("hello!");
        Console.print("the socket is ready now\n");
    }

    handler (this: WsRoute).onData(data: ref[Array[Char]], isBinary: Bool) : Void set_ptr {
        Console.print("we received this data: %s\n", data.buf);
    }

    handler (this: WsRoute).onClose() : Void set_ptr {
        Console.print("connection closed\n");
    }
}
```

### Custom Data

You can set custom data on the class, for example a custom id for each connection made to that
endpoint:

```
@wsRoute["/chat"]
class ChatSocket {
    @injection def wsRoute: WsRoute;

    def id : Int;

    handler (this: WsRoute).onConnect() : Int set_ptr {
        this.id = 5;
        return 0;
    }

    handler (this: WsRoute).onClose() : Void set_ptr {
        Console.print("the connection with id %i is closed\n", this.id);
    }
}
```

### WsRoute Reference

This is the class you inject into the class you create with the `wsRoute` modifier, representing a
single websocket connection. An instance of it (through your class) is what `this` refers to inside
every handler you override.

It can be in one of the following statuses, exposed as `WsRouteStatus` values:

* `WsRouteStatus.CONNECTING`: the initial status, until the handshake completes.

* `WsRouteStatus.OPENED`: the only status in which you can send and receive data frames; you can also
  close the connection while in this status.

* `WsRouteStatus.CLOSING`: the status between calling `close` and the `onClose` handler being invoked.

* `WsRouteStatus.CLOSED`: the final status, indicating the connection is closed.

#### getStatus

```
handler this.getStatus(): WsRouteStatus;
```

Returns the connection's current status.

#### sendText

```
handler this.sendText(data: CharsPtr);
```

Sends a text message through the connection. A no-op if the connection isn't currently
`WsRouteStatus.OPENED`.

#### sendBinary

```
handler this.sendBinary(data: CharsPtr, dataLen: ArchWord);
```

Sends binary data through the connection. A no-op if the connection isn't currently
`WsRouteStatus.OPENED`.

* `dataLen`: the length of `data`, in bytes.

#### close

```
handler this.close();
handler this.close(statusCode: word[16], reasonMessage: CharsPtr);
```

Closes the connection: moves the status to `WsRouteStatus.CLOSING` and sends a close frame to the
client; `onClose` fires once the close handshake completes.

* The no-argument form closes with status code `1000` (normal closure) and no reason message.
* The second form lets you specify a status code and a reason message. Application-defined codes must
  be in the `4000`-`4999` range — see the
  [RFC 6455 spec on status codes](https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.2).

#### closeCode and closeReason

```
def closeCode: word[16] = 1006;
def closeReason: String;
```

Once the connection has closed, these hold the status code and reason it closed with — whichever
side, client or server, initiated the close. Read them from `onClose`:

```
handler (this: WsRoute).onClose() : Void set_ptr {
    Console.print("closed with code %i: %s\n", this.closeCode, this.closeReason.buf);
}
```

#### Message size limit

```
handler this.setMaxMessageSize(size: ArchInt);
handler this.getMaxMessageSize(): ArchInt;
```

By default, a connection closes with code `1009` ("Message too big") if an incoming message —
assembled across all its fragments — exceeds 1024 bytes. You can change this limit per connection with
`setMaxMessageSize`.

#### Fragment buffer growth

```
handler this.setFragmentBufferGrowSize(growSize: ArchInt);
```

When a message arrives split across multiple frames, `WsRoute` reassembles it in an internal buffer
that grows on demand as fragments come in. If you expect large fragmented messages on a given route,
you can set a grow size hint here so the buffer reallocates in bigger steps instead of one small
reallocation per fragment.

## Browser Side: WsClient

### Creating a Connection

`WsClient` can be used as a plain value — construct it, then call `connect`:

```
def ws: WsClient;
if not ws.connect("ws://localhost:8070/chat") {
    // the connection attempt couldn't even start (bad URL, bad scheme, malformed
    // protocols, a URL containing a fragment, etc.)
}
```

```
handler this.connect(url: CharsPtr): Bool;
handler this.connect(url: CharsPtr, protocols: CharsPtr): Bool;
```

`protocols` lets you offer subprotocols, same as the second argument to the browser's `WebSocket`
constructor. See
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket#exceptions) for the exact
list of cases where construction fails synchronously — this is what makes `connect` return `false`.
Calling `connect` again while already connected is a no-op that returns `true`.

A `true` return only means the connection attempt has started — it does **not** mean the connection
is open yet. Wait for the open event/callback for that.

If you'd rather get a heap-allocated, shareable reference instead of a plain value, `create` is a
convenience that constructs a `WsClient` and immediately connects it:

```
func create(url: CharsPtr, protocols: CharsPtr): SrdRef[WsClient];
func create(url: CharsPtr): SrdRef[WsClient];
```

```
def ws: SrdRef[WsClient] = WsClient.create("ws://localhost:8060/echo");
if ws.isNull() {
    // bad URL/protocols - the connection never started
}
```

`create` returns a null (`isNull() == true`) `SrdRef[WsClient]` if the connection attempt couldn't be
started, so you don't end up holding a broken instance.

#### connected

```
def connected: Bool = false;
```

`true` while the connection is open (from the open event/callback until the close event/callback
fires). Check it before sending data if you're not sure of the connection's current state.

### Events

`WsClient` exposes four callback fields you assign a `closure` to:

```
def openCallback: closure();
def messageCallback: closure(ref[WsMessageInfo]);
def errorCallback: closure();
def closeCallback: closure(ref[WsCloseInfo]);
```

```
ws.openCallback = closure () {
    Console.print("connected!\n");
};
ws.messageCallback = closure (info: ref[WsMessageInfo]) {
    Console.print("received: %s\n", info.strData.buf);
};
ws.errorCallback = closure () {
    Console.print("a connection-level error occurred\n");
};
ws.closeCallback = closure (info: ref[WsCloseInfo]) {
    Console.print("closed with code %i: %s\n", info.code, info.reason.buf);
};
```

Internally these are invoked from four virtual handlers — `onOpen`, `onMessage`, `onError`, and
`onClose` — that call the corresponding callback if one is set. If you'd rather subclass `WsClient`
instead of assigning closures, you can override these handlers directly the same way you override
`WsRoute`'s handlers.

#### onOpen / openCallback

Fires once the connection is established. See
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/open_event) for exactly when this
event fires.

#### onMessage / messageCallback

Fires once per received message. The payload is a `WsMessageInfo`:

```
class WsMessageInfo {
    def isBinary: Bool;
    def binaryData: ptr[array[Word[8]]];
    def binaryDataLength: ArchInt;
    def strData: String;
}
```

* `isBinary`: `true` if the message was sent as binary, `false` if sent as text.
* `strData`: the message text. Only meaningful when `isBinary` is `false`.
* `binaryData` / `binaryDataLength`: the raw bytes and their length. Only meaningful when `isBinary`
  is `true`.

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event) for exactly when
this event fires.

#### onError / errorCallback

Fires on a genuine connection-level error. See
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event) for exactly when this
event fires.

#### onClose / closeCallback

Fires once the connection is fully closed, whether initiated locally or by the server. The payload is
a `WsCloseInfo`:

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
this event fires. By the time this fires, the connection's underlying resources have already been
released — `connected` is `false` and the state getters below are no longer valid (see
[State](#state)).

### Sending Data

```
handler this.sendText(data: CharsPtr): CharsPtr;
handler this.sendBinary(data: CharsPtr, dataLen: ArchWord): CharsPtr;
```

Sends a text message, or `dataLen` raw bytes starting at `data`, respectively. Both return a null
pointer if the browser doesn't throw an exception, or a pointer to the error message if an exception
is thrown.

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send#exceptions) for exactly
when the underlying exception is raised.

### Closing the Connection

```
handler this.close(): CharsPtr;
handler this.close(code: Int): CharsPtr;
handler this.close(code: Int, reason: CharsPtr): CharsPtr;
```

Closes the connection. The no-argument form uses code `1000` (normal closure) with no reason; the
other overloads let you specify a code and/or reason. Same return convention as `sendText`.

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close#exceptions) for exactly
when the underlying exception is raised.

### State

```
handler this.getState(): Int;
handler this.getUrl(): CharsPtr;
handler this.getProtocol(): CharsPtr;
handler this.getExtensions(): CharsPtr;
handler this.getBufferedAmount(): ArchWord;
```

These return the matching property from the underlying
[WebSocket browser object](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket): `getState`
returns [`readyState`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState),
`getUrl` returns [`url`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/url), `getProtocol`
returns [`protocol`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/protocol),
`getExtensions` returns
[`extensions`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/extensions), and
`getBufferedAmount` returns
[`bufferedAmount`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/bufferedAmount).

Once the connection has actually closed (the close event/callback has fired), the library releases
its tracking of the underlying browser object automatically. Don't call these after `onClose` /
`closeCallback` has fired — read whatever state you need from the `WsCloseInfo` payload instead.

### Lifetime

Destroying a `WsClient` (it going out of scope, being reassigned, or `.release()` being called on a
`SrdRef[WsClient]`) only stops the library from tracking the connection — it does **not** send a
close frame on your behalf. Call `close()` yourself first if you want the connection to shut down
cleanly before releasing the object.

## Putting It Together

A minimal chat-style endpoint, matched with a browser client that reconnects with backoff on an
unclean disconnect:

```
@wsRoute["/chat"]
class ChatSocket {
    @injection def wsRoute: WsRoute;

    handler (this: WsRoute).onData(data: ref[Array[Char]], isBinary: Bool) : Void set_ptr {
        if isBinary return;
        this.sendText(data.buf);
    }
}
```

```
def ws: WsClient;
ws.openCallback = closure () {
    Console.print("status: connected\n");
};
ws.messageCallback = closure (info: ref[WsMessageInfo]) {
    Console.print("echo: %s\n", info.strData.buf);
};
ws.closeCallback = closure (info: ref[WsCloseInfo]) {
    if not info.wasClean {
        Console.print("status: connection lost, reconnecting...\n");
        // schedule a reconnect attempt here
    }
};
ws.connect("ws://localhost:8070/chat");
```

For a complete, runnable two-peer example — including reconnection with exponential backoff and
jitter — see `Examples/ws_chat.alusus`.
