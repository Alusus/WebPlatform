# WebPlatform

[[عربي]](safetimeout.ar.md)

[[Back]](../readme.md)

### SafeTimeout

```
class SafeTimeout {
    handler this.set(duration: Word, cb: closure (Json));
    handler this.cancel();
}
```

This class is used to create a safe timer that is automatically canceled if it is removed from memory
before it is triggered. This is particularly useful when the timer is defined within a UI page that
might be removed from memory, such as when the user navigates to another page. 

The `set` function is similar to the global `setTimeout` function, with a single difference: the timer
is automatically canceled when this class is removed from memory.

