# WebPlatform

[[عربي]](widgets.ar.md)

[[Back]](../readme.md)

## Widgets

### Widget

The base class for all widgets.

#### Abstract Properties

The following are the abstract properties declared in this class that must be implemented in child classes.

```
handler this.id: String as_ptr;

handler this.className: ref[String] as_ptr;
handler this.className = temp_ref[String] as ptr;

handler this.style: SrdRef[StyleSet] as_ptr;
handler this.style = SrdRef[StyleSet] as_ptr;
```

* `id` a unique identifier to distinguish each widget from the other.
* `className`: Class name of the widget, used for applying styles by class name.
* `style`: This property allows updating the style of the widget. You can assign a StyleSet object to it, which
  will be useful in sharing styles between multiple instances of a widget. If you try to update the styles
  without setting a StyleSet upfront it will create a new StyleSet object for this widget and return it.

#### Abstract Events

The following are abstract events delcared in this class and must be implemented in child classes.

##### onResize

```
def onResize: ref[DomEventSignal[Widget, Int]] as_ptr;
```

Signals that the widget's dimensions changed.

##### onMouseEnter

```
def onMouseEnter: ref[DomEventSignal[Widget, Int]] as_ptr;
```

Signals that the cursor entered the widget's region.

##### onMouseOut

```
def onMouseOut: ref[DomEventSignal[Widget, Int]] as_ptr;
```

Signals that the cursor exited the widget's region.

##### onMouseDown

```
def onMouseDown: ref[DomEventSignal[Widget, MouseButtonPayload]] as_ptr;
```

Signals that the mouse button has been pressed.

##### onMouseUp

```
def onMouseUp: ref[DomEventSignal[Widget, MouseButtonPayload]] as_ptr;
```

Signals that the mouse button has been released.

##### onMouseMove

```
def onMouseMove: ref[DomEventSignal[Widget, MouseMovePayload]] as_ptr;
```

Signals that the cursor moved over the widget.

##### onTouchStart

```
def onTouchStart: ref[DomEventSignal[Widget, Array[TouchPayload]]] as_ptr;
```

Signals the start of a touch on devices with touch screens.

##### onTouchEnd

```
def onTouchEnd: ref[DomEventSignal[Widget, Array[TouchPayload]]] as_ptr;
```

Signals the end of a touch on devices with touch screens.

##### onTouchMove

```
def onTouchMove: ref[DomEventSignal[Widget, Array[TouchPayload]]] as_ptr;
```

Signals the change of touch positions on devices with touch screens.

##### onClick

```
def onClick: ref[DomEventSignal[Widget, Int]] as_ptr;
```

Signals that a mouse click occurred.

#### Methods

##### getDimensions

```
handler this.getDimensions(): Dimensions;
```

A method to get the widget's dimensions.

##### getBoundingRect

```
handler this.getBoundingRect(): Rectangle;
```

A method to get the widget's position and dimensions relative to the upper left corner of the
viewport.

##### requestPointerLock

```
handler this.requestPointerLock();
```

Requests for locking the pointer to the specified widget. This results in hiding the mouse cursor
and sending all mouse actions to this widget, which is useful for developing games.

##### requestFullScreen

```
handler this.requestFullScreen();
```

Requests to activate full screen mode for this widget. This will result in this widget being
enlarged to full the entire screen.

##### scrollIntoView

```
handler this.scrollIntoView();
```

Requets the browser to be scrolled to the element on which the method is called.


### BasicWidget

The base class of all basic widgets. It implements the operations that are shared between all basic widgets.

It also adds the following definitions:

* `hint`: `String`. A property for setting a string to be displayed as a tooltip when the cursor hovers over
  the element.


### Box

This class represents a rectangle area that contains other widgets.

#### Variables

* `children`: `Array[SrdRef[Widget]]`. The array of widgets contained in this class.

#### Operations

##### addChildren

```
handler this.addChildren (count: Int, children: ...temp_ref[SrdRef[Widget]]);
```

A method to add a new child or more to this box.

parameters:

* `count` number of children we want to add.

* `children` the children we want to add, which are widgets.

##### insertChild

```
handler this.insertChild (index: Int, child: SrdRef[Widget]);
```

Inserts a child at the spefcified index.

parameters:

* `index` The index at which to insert the widget.

* `child` the widget to be inserted.

##### removeChildren

```
handler this.removeChildren (count: Int, children: ...temp_ref[SrdRef[Widget]]);
```

A method to remove children from this box.

parameters:

* `count` number of children we want to remove.

* `children` the children we want to remove, which are widgets.

##### removeAllChildren

```
handler this.removeAllChildren ();
```

Removes all children of this box.


### Canvas

This represents an area to be used for free drawing.

#### Variables

* `resourceId`: `ArchInt`. a unique identifier to distinguish each canvas from the other. 

#### Mixins

* `drawing`: `Drawing`. This mixin adds support for drawing operatios to this class. Visit the
  documentation of `Drawing` for details about available operations.

#### Properties

* `bitmapWidth`: `SrdRef[Length]`. The width of the drawing area.

* `bitmapHeight`: `SrdRef[Length]`. The height of the drawing area.


### Image

A class that represents an image.

#### Properties

* `url`: `String`. The URL of the image's source.


### Video

A class that represents a video.

#### Properties

* `sourceArray`: ` Array[VideoSource]`. The sources and types  of the video.
* `trackArray`: ` Array[VideoTrack]`. The tracks and subtitles of the video.
* `controls`: ` bool`. The video have controls button or not.
* `autoplay`: ` bool`. The video will be auto played or not.


### VideoSource

A class that represents a video source.

#### Properties

* `src`: ` String`. The source of the video.
* `videoType`: ` String`. The type of the video.


### VideoTrack

A class that represents a video track like subtitle.

#### Properties

* `src`: ` String`. The source of the track.
* `kind`: ` String`. The kind of the track.
* `srclang`: ` String`. The language of the track.
* `label`: ` String`. The label of the track.

### Picture

A class that represents a picture HTML element.

#### Properties

* `sourceArray`: ` Array[ImageSource]`. The sources and max width  of the Picture.

#### Operations

##### setChild

```
handler this.setChild (child: temp_ref[SrdRef[Image]]);
```

Sets the child component of this Picture.

parameters:

* `child` the Image we want displayed inside the Picture.


### ImageSource

A class that represents a Picture source.

#### Properties

* `src`: ` String`. The source of the Image.
* `maxWidth`: ` String`. The max width of the Image.


### Text

A class for displaying static text.

#### Initialization

```
Text();
Text(text: String);
Text(tag: String, text: String);
```

The third version of the initialization function allows the user to specify the HTML tag to use
to render the text. By default this widget uses `span`, but with the third init function the user
can specify a different tag, like `h1` for example.

#### Properties

* `text`: `String`. The text of this component.

* `targetId`: `String`. The identifier of the object that is linked to this text, for example a text
  beside text input field that tell us that this text input is for username.


### Button

Displays a button.

#### Properties

* `text`: `String`. The text we want to show on the button.


### TextInput

A text entry box.

#### Properties

* `text`: `String`. The entered text.

* `placeholder`: `String`. A value that appears before the user enters anything, to clarify what
  to enter.

#### Events

##### onChanged

```
def onChanged: DomEventSignal[TextInput, Int];
```

Gets fired when the entered text changes.

##### onKeyPress

```
def onKeyPress: DomEventSignal[TextInput, String];
```

Gets fired when a key is pressed.


##### onKeyUp

```
def onKeyUp: DomEventSignal[TextInput, String];
```

Gets fired when we a keypress ends.


### Input

A user input field.

#### Properties

* `text`: `String`. The entered value.

* `inputType`: `String`. The type of input values.

* `disabled`: `Bool`. Whether the input box is disabled.

* `placeholder`: `String`. A value that appears before the user enters anything, to clarify what
  to enter.

#### Events

##### onChanged

```
def onChanged: DomEventSignal[Input, Int];
```

Gets fired when the entered value changes.

##### onKeyPress

```
def onKeyPress: DomEventSignal[Input, String];
```

Gets fired when a key is pressed.

##### onKeyUp

```
def onKeyUp: DomEventSignal[Input, String];
```

Gets fired when we a keypress ends.


### Select

A widget that displays a multi-choice input.

#### Properties

* `items`: `Map[String, String]`. The choices we want the user to choose from.

#### Events

##### onChanged

```
def onChanged: DomEventSignal[Select, Int];
```

Gets fired when the selected value is changed.

#### Operations

##### getSelectedValue

```
handler this.getSelectedValue(): String;
```

Returns the value of the currently selected item.

##### selectValue

```
handler this.selectValue(newValue: String);
```

Changes the current selection.


### Hyperlink

A class that displays a hyperlink.

#### Properties

* `url`: `String`. The address of the target page.

* `child`: `SrdRef[Widget]`. The widget contained in the hyperlink, like a text or an image.

* `newTab`: `Bool`. Determins if the address will be opened in a new tab or the current one.

#### Operations

##### setChild

```
handler this.setChild (child: temp_ref[SrdRef[Widget]]);
```

Sets the child component of this hyperlink.

parameters:

* `child` the widget we want displayed inside the hyperlink.


### DocView

A class used to show an HTML or Markdown document.

#### Initialization

```
DocView();
DocView(html: String);
```

The second version of the initialization function creates a new DocView and initializes it with
the provided HTML text.

#### Operations

##### setHtml

```
handler this.setHtml(html: String);
```

Sets an HTML document as the scene.

##### setMarkdown

```
handler this.setMarkdown(md: String);
handler this.setMarkdown(md: String, linksInNewTab: Bool);
```

Sets a Markdown document as the scene. The second form allows specifying whether hyperlinks in the
document opens in the same browser tab or a new one. The first form opens links in the same tab.


### Browser

An area in which you can view another web page, i.e. an iframe.

#### Properties

* `url`: `String`. The URL of the page to view.

#### Operations

##### postMessage

```
handler this.postMessage(msgType: CharsPtr, msgBody: CharsPtr);
```

Posts an arbitrary message to the window of the loaded site.


## Related Classes

### MouseMovePayload

```
class MouseMovePayload {
    def posX: Float;
    def posY: Float;
    def deltaX: Float;
    def deltaY: Float;
}
```

A class that holds mouse move payload information.

`posX` cursor x coordinate.

`posY` cursor y coordinate.

`deltaX` the change in position on x axis.

`deltaY` the change in position on y axis.


### MouseButtonPayload

```
class MouseButtonPayload {
    def button: Int;
    def posX: Float;
    def posY: Float;
}
```

A class that holds mouse button payload information.

`button` the clicked button.

`posX` cursor x coordinate.

`posY` cursor y coordinate.


### TouchPayload

```
class TouchPayload {
    def identifier: String;
    def screenX: Float;
    def screenY: Float;
    def clientX: Float;
    def clientY: Float;
    def pageX: Float;
    def pageY: Float;
    def radiusX: Float;
    def radiusY: Float;
    def rotationAngle: Float;
    def force: Float;
    def changed: Bool;
}
```

This class carries information of a single touch in a touch event. A touch event has an array of
this type representing all touches happening simultaneously.

`identifier` A unique identifier to enable differentiating touchs from each other in consecutive
touch events.

`screenX` The X coordinate of the touch relative to the screen.

`screenY` The Y coordinate of the touch relative to the screen.

`clientX` The X coordinate of the touch relative to the browser.

`clientY` The Y coordinate of the touch relative to the browser.

`pageX` The X coordinate of the touch relative to the document. This value takes into consideration
the scroll status of the page and gives the coordinate as if the entire page is visible on the
screen.

`pageY` The Y coordinate of the touch relative to the document. This value takes into consideration
the scroll status of the page and gives the coordinate as if the entire page is visible on the
screen.

`radiusX` The X radius of the ellipse that most closely circumscribes the area of contact with the
screen.

`radiusY` The Y radius of the ellipse that most closely circumscribes the area of contact with the
screen.

`rotatoinAngle` The angle (in degrees) that the ellipse described by radiusX and radiusY must be
rotated, clockwise, to most accurately cover the area of contact between the user and the surface.

`force` The amount of pressure being applied to the surface by the user, as a float between 0.0
(no pressure) and 1.0 (maximum pressure).

`changed` Specifies whether this touch has been changed or added in the current event.

