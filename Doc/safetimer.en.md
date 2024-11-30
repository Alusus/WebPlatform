# WebPlatform

[[عربي]](safetimer.ar.md)

[[Back]](../readme.md)

### SafeTimer

```
class SafeTimer {
    handler this.start(duration: Word, cb: closure (Json));
    handler this.stop();
}
```

This class is used to create a safe recurring timer that is automatically stopped if it is removed
from memory. This is especially useful when the timer is defined within a UI page that might be
removed from memory, such as when the user navigates to another page.

The `start` function is similar to the global `startTimer` function, with a single difference: the
timer is automatically stopped when this class is removed from memory.

