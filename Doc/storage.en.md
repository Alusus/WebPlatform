# WebPlatform

[[عربي]](storage.ar.md)

[[Back]](../README.md)

## Storage

A class used to store information to the session or to local storage in the browser.

#### getLength

```
handler this.getLength(): Int;
```

Used to retrieve the number of items currently stored.

#### getKey

```
handler this.getKey(index: Int): String;
```

Gets the key of the item with the given index.

#### getItem

```
handler this.getItem(key: CharsPtr): String;
```

Gets the item with the given key.

#### setItem

```
handler this.setItem(key: CharsPtr, value: CharsPtr);
```

Sets an item to be stored under the given key.

#### removeItem

```
handler this.removeItem(key: CharsPtr);
```

Removes the item stored under the given key.
ل.
#### clear

```
handler this.clear();
```

Removes all items from the storage.

