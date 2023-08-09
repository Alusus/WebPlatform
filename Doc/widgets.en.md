# WebPlatform

[[عربي]](widgets.ar.md)

[[Back]](../readme.md)

## Widgets

### Widget

The base class for all widgets.

#### Variables

* `id` a unique identifier to distinguish each widget from the other.

#### Properties

* `className`: `String`. Class name of the widget, used for applying styles by class name.

#### Events

##### onResize

```
def onResize: DomEventSignal[Widget, Int];
```

Signals that the widget's dimensions changed.

##### onMouseEnter

```
def onMouseEnter: DomEventSignal[Widget, Int];
```

Signals that the cursor entered the widget's region.

##### onMouseOut

```
def onMouseOut: DomEventSignal[Widget, Int];
```

Signals that the cursor exited the widget's region.

##### onMouseDown

```
def onMouseDown: DomEventSignal[Widget, MouseButtonPayload];
```

Signals that the mouse button has been pressed.

##### onMouseUp

```
def onMouseUp: DomEventSignal[Widget, MouseButtonPayload];
```

Signals that the mouse button has been released.

##### onMouseMove

```
def onMouseMove: DomEventSignal[Widget, MouseMovePayload];
```

Signals that the cursor moved over the widget.

##### onTouchStart

```
def onTouchStart: DomEventSignal[Widget, Array[TouchPayload]];
```

Signals the start of a touch on devices with touch screens.

##### onTouchEnd

```
def onTouchEnd: DomEventSignal[Widget, Array[TouchPayload]];
```

Signals the end of a touch on devices with touch screens.

##### onTouchMove

```
def onTouchMove: DomEventSignal[Widget, Array[TouchPayload]];
```

Signals the change of touch positions on devices with touch screens.

##### onClick

```
def onClick: DomEventSignal[Widget, Int];
```

Signals that a mouse click occurred.


#### Operations

##### style

```
handler this.style: SrdRef[StyleSet];
handler this.style = SrdRef[StyleSet];
```

This property allows updating the style of the widget. You can assign a StyleSet object to it, which
will be useful in sharing styles between multiple instances of a widget. If you try to update the
styles without setting a StyleSet upfront it will create a new StyleSet object for this widget and
return it.

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


### Box

This class represents a rectangle area that contains other widgets.

#### Variables

* `children`: `Array[SrdRef[Widget]]`. The array of widgets contained in this class.

#### Operations

##### addChildren

A method to add a new child or more to this box.

parameters:

* `count` number of children we want to add.

* `children` the children we want to add, which are widgets.

##### removeChildren

A method to remove children from this box.

parameters:

* `count` number of children we want to remove.

* `children` the children we want to remove, which are widgets.


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


### Text

A class for displaying static text.

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

