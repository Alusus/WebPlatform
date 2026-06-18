# WebPlatform

[[عربي]](resources.ar.md)

[[Back]](../README.md)

## Resources

### ImageResource

```
class ImageResource {
    def id: ArchInt = 0;
    handler this.load(u: ptr[array[Char]]): SrdRef[Promise[Int]];
    handler this.initFromCanvas(canvas: ref[CanvasResource]): SrdRef[Promise[Int]];
    handler this.getDimensions(): Dimensions;
}
```

An image resource that can be used with image operations on a canvas.

#### id

```
def id: ArchInt = 0;
```

a unique identifier to distinguish this resource from the others.

#### load

```
handler this.load(u: ptr[array[Char]]): SrdRef[Promise[Int]];
```

this method is used to load the resource from a given path.

#### initFromCanvas

```
handler this.initFromCanvas(canvas: ref[CanvasResource]): SrdRef[Promise[Int]];
```

This method is used to initialize the resource from a given canvas.

#### getDimensions

```
handler this.getDimensions(): Dimensions;
```

this method is used to get the resource's dimensions.

### CanvasResource

```
class CanvasResource {
    def id: ArchInt = 0;
    handler this.init(w: Int, h: Int);
    handler this.resize(w: Int, h: Int);
}
```

An offline canvas that can be used to dynamically generate images. Similar to the Canvas widget,
this class inherits the `Drawing` mixin to enable drawing operations. Refer to the `Drawing`
class to learn about the graphical operations supported by this class.

#### id

```
def id: ArchInt = 0;
```

a unique identifier to distinguish this resource from the others.

#### init

```
handler this.init(w: Int, h: Int);
```

a method used to initialize the canvas with a given width and height.

#### resize

```
handler this.resize(w: Int, h: Int);
```

a method used to change the size of the canvas to the given width and height.

### AudioResource

```
class AudioResource {
    def id: ArchInt = 0;
    handler this.load(u: ptr[array[Char]]): SrdRef[Promise[Int]];
    handler this.play(loop: Bool);
    handler this.play(loop: Bool, stopPrevious: Bool);
    handler this.stop();
    handler this.pause();
    handler this.resume();
    handler this.volume = Float;
    handler this.volume:Float;
    handler this.isPlaying(): Bool;
}
```

A class used for audio resources.

#### id

```
def id: ArchInt = 0;
```

a unique identifier to distinguish this resource from the others.

#### load

```
handler this.load(u: ptr[array[Char]]): SrdRef[Promise[Int]];
```

loads the resource with the given path.

#### play

```
handler this.play(loop: Bool);
handler this.play(loop: Bool, stopPrevious: Bool);
```

starts the playback from the beginning. If called again before the previous playback
is over the sound will be played again alongside the previous playback, which will continue
until the end of the sound buffer. The second version of this method accepts `stopPrevious`
which allows the user to stop the previous playback before starting the new playback.

* `loop` determine if the mode is repeating the resource or stopping it when finished.

#### stop

```
handler this.stop();
```

a method used to stop the resource.

#### pause

```
handler this.pause();
```

pauses the playback.

#### resume

```
handler this.resume();
```

resumes the playback from where it was paused.

#### volume

```
handler this.volume = Float;
handler this.volume:Float;
```

volume property, used to get or set the audio volume.

#### isPlaying

```
handler this.isPlaying(): Bool;
```

a method used to check if the resource is playing or not.
