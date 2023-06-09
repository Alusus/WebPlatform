# WebPlatform

[[عربي]](regexp.ar.md)

[[Back]](../readme.md)

### RegExp

```
class RegExp {
    handler this.initialize(regStr: ptr[array[Char]]);
    handler this.release();
    handler this.match(str: ptr[array[Char]], lastIndex: ref[Int]): Array[String];
    handler this.match(str: ptr[array[Char]]): Array[String];
}
```

Enables using a single regular expression in multiple match operations without re-interpretting the
regex on every operation.

#### initialize

Initializes the object with the required pattern.

#### release

Releases the resource used for this object.

#### match

Match the expression against the given string.

Parameters:

* `str` The text we want to match.
* `lastIndex` Returns the index that we should start next matching process from.

