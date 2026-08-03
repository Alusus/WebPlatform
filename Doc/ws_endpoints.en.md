# WebPlatform

[[عربي]](websocketEndpoint.ar.md)

[[Back]](../README.md)

## Creating WebSocket Endpoints

You can create a websocket endpoint by writing a regular class, adding the `wsEndpoint` modifier to
it with the URI it should listen on, and injecting `WsConnection` into it using the `@injection`
modifier.

```
@wsEndpoint["/chat"]
class Chatwebsocket {
    @injection def WsConnection: WsConnection;
}
```

Now you have a websocket endpoint listening at `/chat`. A new instance of `Chatwebsocket` is created
for every client connection and stays alive for the lifetime of that connection.

## Timeouts

When you start the server (`runServer`, `startServer`, `buildAndRunServer`, etc.), you can override
`websocket_timeout_ms` through the `options: Array[CharsPtr]` argument. It controls how long a
WebSocket connection can sit without a response before the server treats it as unresponsive and
closes it. It defaults to `10000` (10 seconds) if you don't set it yourself.

```
runServer[serverModules](
    mainAssetsPath, uiEndpointsPath,
    Array[CharsPtr]({ "listening_ports", "8010", "websocket_timeout_ms", "30000" })
);
```

Don't change this value casually — test it against your own expected load first before relying on a
different value in production.

## Overriding Handlers

`WsConnection` gives you four handlers you can override to react to the connection's lifecycle:

* `onConnect`: called when a client starts the handshake to establish a connection. It receives the
  raw `connection: ptr[Http.Connection]`, which you can use to inspect the handshake request (headers,
  query string, etc.) via `Http.getRequestInfo(connection)`. Don't store this pointer for later use; it's only meant to be read from within
  `onConnect` itself. Return `0` to accept the connection, or `1` to reject it.

* `onReady`: called once the handshake is done and the connection is open. This is the first point
  at which you can send data.

* `onData`: called once per complete message (text or binary), after any fragmentation across
  multiple frames has been reassembled internally.

* `onClose`: called after the connection has been closed.

Because these handlers live on the injected `WsConnection`, you override them with this syntax,
matching the original signature exactly:

```
handler (this: WsConnection).onConnect(connection : ptr[Http.Connection]) : Int set_ptr {
    Console.print("request method: %s\n", Http.getRequestInfo(connection)~cnt.requestMethod);
    Console.print("we have new connection now\n");
    return 0;
}
```

`(this: WsConnection)` tells the compiler you're providing an implementation for one of
`WsConnection`'s handlers, and `set_ptr` installs it as the one used for this class instead of the
default. You don't have to override all four — any handler you skip keeps `WsConnection`'s default
behavior.

Putting it together:

```
@wsEndpoint["/chat"]
class Chatwebsocket {
    @injection def WsConnection: WsConnection;

    handler (this: WsConnection).onConnect(connection : ptr[Http.Connection]) : Int set_ptr {
        Console.print("request method: %s\n", Http.getRequestInfo(connection)~cnt.requestMethod);
        Console.print("we have new connection now\n");
        return 0;
    }

    handler (this: WsConnection).onReady() : Void set_ptr {
        this.sendText("hello!");
        Console.print("the Socket is Ready Now\n");
    }

    handler (this: WsConnection).onData(data: ref[String], isBinary: Bool) : Void set_ptr {
        Console.print("we received this data: %s\n", data.buf);
    }

    handler (this: WsConnection).onClose() : Void set_ptr {
        Console.print("connection closed\n");
    }
}
```

## Custom Data

You can set custom data on the class, for example a custom id for each connection made to that
endpoint:

```
@wsEndpoint["/chat"]
class Chatwebsocket {
    @injection def WsConnection: WsConnection;

    def id : Int;

    handler (this: WsConnection).onConnect(connection : ptr[Http.Connection]) : Int set_ptr {
        this.id = 5;
        return 0;
    }

    handler (this: WsConnection).onClose() : Void set_ptr {
        Console.print("the connection with id %i is closed\n", this.id);
    }
}
```

## WsConnection

This is the class you inject into the class you create with the `wsEndpoint` modifier, representing
a single websocket connection. An instance of it (through your class) is what `this` refers to
inside every handler you override.

It can be in one of the following statuses, exposed as `WsStatus` values:

* `WsStatus.CONNECTING`: the initial status, until the handshake completes.

* `WsStatus.OPENED`: the only status in which you can send and receive data frames; you can also
  close the connection while in this status.

* `WsStatus.CLOSING`: the status between calling `close` and the `onClose` handler being invoked.

* `WsStatus.CLOSED`: the final status, indicating the connection is closed.

#### getStatus

```
handler this.getStatus(): WsStatus;
```

Returns the connection's current status.

#### sendText

```
handler this.sendText(data: CharsPtr);
```

Sends a text message through the connection.

#### sendBinary

```
handler this.sendBinary(data: CharsPtr, dataLen: ArchWord);
```

Sends binary data through the connection.

* `dataLen`: the length of `data`, in bytes.

`sendText` and `sendBinary` both check if the connection is still opened before send any data. 
in cause that the connection is closed then nothing happened.

#### close

```
handler this.close();
handler this.close(statusCode: word[16], reasonMessage: CharsPtr);
```

Closes the connection: moves the status to `WsStatus.CLOSING` and sends a close frame to the
client; `onClose` fires once the close handshake completes.

* The no-argument form closes with status code `1000` (normal closure) and no reason message.
* The second form lets you specify a status code and a reason message. Application-defined codes
  must be in the `4000`-`4999` range — see the
  [RFC 6455 spec on status codes](https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.2).

#### Message size limit

By default, a connection closes with code `1009` ("Message too big") if an incoming message —
assembled across all its fragments — exceeds 1024 bytes. You can change this limit per connection,
for example from `onConnect`:

```
handler this.setMaxMessageSize(size: ArchInt);
```
