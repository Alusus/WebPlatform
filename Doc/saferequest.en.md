# WebPlatform

[[عربي]](saferequest.ar.md)

[[Back]](../README.md)

### SafeRequest

```
class SafeRequest {
    handler this.send (
        method: ptr[Char], uri: ptr[Char], headers: ptr[Char], body: ptr[Char], timeoutInMs: Int, cb: closure (Json)
    ): Bool;
    handler this.cancel();
    handler this.inProgress: Bool;
}
```

This class is used to safely send an HTTP request when the request is initiated from within a function or a class
that might be removed from memory before the request completes. The class provides a `send` function for sending
requests, which is similar in definition and parameters to the global `sendRequest` function but ensures two things:

* Only one request is sent at a time. If `send` is called again before the previous request completes, the function
  will refrain from sending a new request and will return a value of `false` instead.
* If the class is removed from memory, the current request, if any, is canceled to ensure that no access is made to
  elements that have been removed from memory before the request is completed.

The `send` function returns a value of `true` if the request is sent, regardless of the outcome of the request itself.

The `cancel` function cancels the current request, if any. If no request exists, it returns without performing any
action. The `inProgress` property returns `true` if there is an ongoing request at the time.

