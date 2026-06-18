# WebPlatform

[[عربي]](signals.ar.md)

[[Back]](../README.md)

## Signals

Signals enable the user to receive events from the asynchronous operations, wether from the UI or
other async operations.

### Signal

```
class Signal [ownerType: type, payloadType: type] {
    handler this.connect(slot: closure (ref[ownerType], payload: ref[payloadType]));
    handler this.disconnect(slot: closure (ref[ownerType], payload: ref[payloadType]));
    handler this.disconnect(id: ArchInt);
    handler this.getConnectionCount (): Int;
    handler this.emit(owner: ref[ownerType], payload: ref[payloadType]);
    def onConnectionsChanged: closure (connectionCount: Int);
}
```

A signal that can be subscribed to for handling events. It allows more than one subscriber.

#### Template Arguments

`ownerType`: The class that owns this signal, meaning the class within which this signal is
defined, such as `Widget`. This attribute specifies the type of the first argument in the
closure that will receive the events. The closure arg type is a reference to this class.

`payloadType`: The class of data that is passed to the closure. This attribute specifies
the type of the second closure argument, which is a reference to this class.

For example, if we define the signal as `Signal[Widget, String]`, the closure is defined as
follows:

```
closure (ref[Widget], ref[String]) { ... }
```

#### connect

```
handler this.connect(slot: closure (ref[ownerType], payload: ref[payloadType]));
```

a method to connect a closure to the signal, so that when the signal is emitted the closure is called and the payload is passed to it.

#### disconnect

```
handler this.disconnect(slot: closure (ref[ownerType], payload: ref[payloadType]));
handler this.disconnect(id: ArchInt);
```

a method used to disconnect a closure connected by the previous method from the signal.

#### getConnectionCount

```
handler this.getConnectionCount (): Int;
```

a method that retrieves the number of connections with the signal.

#### emit

```
handler this.emit(owner: ref[ownerType], payload: ref[payloadType]);
```

emits the signal through all current connections.

#### onConnectionsChanged

```
def onConnectionsChanged: closure (connectionCount: Int);
```

a closure to be called when connections change, whether by adding a new connection or removing
an existing one.

### DomEventSignal

```
class DomEventSignal [ownerType: type, payloadType: type] {
    def defaultPrevented: Bool = false;
}
```

This class is derived from `Signal` and is used for DOM events.

#### defaultPrevented

```
def defaultPrevented: Bool = false;
```

Specifies if the default action should be executed or skipped.
