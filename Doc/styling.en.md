# WebPlatform

[[عربي]](styling.ar.md)

[[Back]](../readme.md)

## Styling

Styling allows the user to control the appearance of the user interface by manipulating the visual
properties of the widgets.

### Style

The main class for controlling the visual properties of a specific widget in a certain state.
It provides the following properties:

```
borderStyle: BorderStyle
outlineStyle: BorderStyle
float: Floating
position: Position
flexDirection: Layout
justifyContent: Justify
alignItems: Align
textAlign: TextAlign
textDecoration: TextDecoration
textDecorationstyle": TextDecorationStyle
direction: Direction
fontFamily: String
overflowX: Overflow
overflowY: Overflow
display: Display
cursor: Cursor
animation: Animation
wordBreak: WordBreak
width: Length
height: Length
minWidth: Length
minHeight: Length
maxWidth: Length
maxHeight: Length
borderWidth: Length4
borderColor: Color
borderRadius: Length4
outlineWidth: Length4
outlineOffset: Length4
outlineColor: Color
zIndex: Int
flex: Flex
margin: Length4
textDecorationColor: Color
textDecorationThickness: Length
padding: Length4
fontSize: Length
color: Color
fontWeight: Length
lineHeight: Length
opacity: Int
transform: Transform
boxShadow: Shadow
top: Length
left: Length
right: Length
bottom: Length
background: Background
```

Following is the description of each style prop. For possible values refer to the documentaiton of each
style type.

* `borderStyle` The style of the border.
* `outlineStyle` Outline style. Used with input widgets.
* `floating` Determines whether/how elements float in the containing box (div).
* `position` Item's position style.
* `layout` Determine the layout of the item when using `FLEX` display mode.
* `justify` The style used to specify how items are placed in a row.
* `align` The style related to aligning an item inside its container.
* `textAlign` The style related to aligning a text inside its container. 
* `textDecoration` The style of text decoration.
* `textDecorationStyle` The style of text decoration shape.
* `direction` Item direction.
* `fontFamily` Font family that the text written using a font in it.
* `overflowX` Overflow on x axis.
* `overflowY` Overflow on y axis.
* `display` The way the item is displayed.
* `cursor` Cursor style.
* `animation` Animations we want to apply on the item.
* `wordBreak` How we should break the words on line end.
* `width` Item width.
* `height` Item height.
* `minWidth` The minimum width of the item.
* `minHeight` The minimum height of the item.
* `maxWidth` The maximum width of the item.
* `maxHeight` The maximum height of the item.
* `borderWidth` Border width.
* `borderColor` Border color.
* `borderRadius` Border radius, used to soften border corners (it takes a round shape)
* `outlineWidth` The width of outline.
* `outlineOffset` The offset of the outline from the border.
* `outlineColor` The color of outline.
* `zIndex` This used to order items when they are on top of each other.
* `flex` The flex style, determine a layout for items placement.
* `margin` Margin around the item.
* `textDecorationColor` Text decoration color.
* `textDecorationThickness` Text decoration thickness.
* `padding` Padding of the item.
* `fontSize` Font size.
* `fontColor` Font color.
* `fontWeight` Font weight.
* `lineHeight` Line height. Useful in increasing or decreasing the space between lines.
* `opacity` Item opacity.
* `transform` Transformations applied on the item.
* `boxShadow` The shadow of the box containing the item.
* `top` The distance of the item from the top of its container or the screen (depending on
  `position` property).
* `left` The distance of the item from the left of its container or the screen (depending on
  `position` property).
* `right` The distance of the item from the right of its container or the screen (depending on
  `position` property).
* `bottom` The distance of the item from the bottom of its container or the screen (depending on
  `position` property).
* `background` Item background.


### StyleSet

This class allows the user to define multiple styles for a widget in different states. It also
allows specifying styles for the widget's branches, enabling the programmer to control the initial
appearance of the widget and its appearance when its state changes (e.g., when the mouse hovers
over it). It also allows controlling the styles of the widget's branches when its state changes.
Widgets do not directly interact with the `Style` class, instead they interact with a `StyleSet`.

#### Applying Styles on a Component

We could apply a style on a component using the `style` property, in which we put the style we want
to apply.

As an example:

```
func createHeader (): SrdRef[Widget] {
    // here we create a rectangle area to hold component widgets in it.
    return Box({}).{
        // styles used for this widget.
        style.{
            width = Length.percent(100);
            height = Length.pt(40);
            padding = Length4.pt(5, 0);
            background = Background(PRIMARY_COLOR);
            borderColor = PRIMARY_COLOR;
            borderWidth = Length4.pt(1.5);
            borderStyle = BorderStyle.SOLID;
            display = Display.FLEX;
            layout = Layout.COLUMN;
        };
        // widgets contained in this component.
        addChildren({
            // here we will have only a text clarifying that we are
            // writing an example about the canvas. 
            Text(String("Alusus Web Platform Examples - Canvas")).{ style.{
                fontColor = Color("fff");
                fontSize = Length.pt(21.0);
                width = Length.percent(100);
                height = Length.percent(100);
                background = Background(PRIMARY_COLOR);
                margin = Length4.pt(5, 15);
            } },
        });
    }~cast[SrdRef[Widget]];
}
```

Here as we can see we write a function to create a component and apply some styles to it.

Inside the style we put the value for each property we want, for example we specify that width
should be 100%.

#### Applying Styles in a Specific State

This can be done by passing a state specifier to the `style` to specify the state in which we want
that style to be applied.

For example:

```
Box({}).{
    // Apply some style.
    style.{
        background = Background(LIGHT_COLOR);
    };
    // Override the style when the cursor hovers over the box.
    style(StateSelector.HOVER).{
        background = Background(DARK_COLOR);
    }
}
```

The following states are available for use, and these states correspond to the states used in CSS:

```
def StateSelector: {
    def ACTIVE: ":active";
    def CHECKED: ":checked";
    def DEFAULT: ":default";
    def DISABLED: ":disabled";
    def EMPTY: ":empty";
    def ENABLED: ":enabled";
    def FOCUS: ":focus";
    def FULLSCREEN: ":fullscreen";
    def HOVER: ":hover";
    def IN_RANGE: ":in-range";
    def INTERMEDIATE: ":indeterminate";
    def INVALID: ":invalid";
    def LINK: ":link";
    def OPTIONAL: ":optional";
    def OUT_OF_RANGE: ":out-of-range";
    def READ_ONLY: ":read-only";
    def READ_WRITE: ":read-write";
    def REQUIRED: ":required";
    def TARGET: ":target";
    def VALID: ":valid";
    def VISITED: ":visited";
}
```

* `ACTIVE` When the widget is active.
* `CHECKED` When the widget is checked. This applies to checkbox input widgets.
* `DEFAULT` The default state.
* `DISABLED` When the widget is disabled.
* `EMPTY` When the widget is empty, like an empty TextInput.
* `ENABLED` When the widget is enabled.
* `FOCUS` When the widget is in focus, for example when clicking on a text input field in a form.
* `FULLSCREEN` When the widget is in full screen state.
* `HOVER` When the cursor hovers over the widget.
* `IN_RANGE` The state of value being in a given range.
* `INTERMEDIATE` When the widget is in an intermediate state.
* `INVALID` When the widget is in an invalid state. For example when we enter invalid email in an
  email field.
* `LINK` The state of a link.
* `OPTIONAL` The state of the widget being optional, for example in a form.
* `OUT_OF_RANGE` The state of the widget's value being out of range.
* `READ_ONLY` The state of the widget being in read only mode.
* `READ_WRITE` The state of the widget being in read and write mode.
* `REQUIRED` The state of the widget being required, for example password in login form.
* `TARGET` The state of the widget being a target.
* `VALID` The state of the widget's value being valid.
* `VISITED` The state of the widget being visited, when the widget is a link.

#### Applying Styles on Child Components

We could do this in a similar way to the previous section, but with passing a class name to
the `style` property to specify which widgets to apply the style on.

Also, we could specify the required state of the widget in which the style gets applied to the
child. For example, the having the child style applied only when hovering the cursor over the
parent widget. This can be done by specifying the state in the `style` property before the
class name, as follows:

```
Box({}).{
    // apply some styles
    style.{
        padding = Length4.pt(3);
        background = Background(LIGHT_COLOR);
        display = Display.FLEX;
        layout = Layout.ROW;
        align = Align.CENTER;
    };
    // apply a style on a child widget with the class `icon`
    style(">>icon").{
        padding = Length4.pt(0, 4);
        width = Length.pt(20);
        height = Length.pt(0);
        heightTransition = Transition(0.2);
    }
    // apply a style on a child widget with the class `icon`
    // this style is applied when we hover with the cursor on the icon
    style({ StateSelector.HOVER, ">>icon" }).{
        height = Length.pt(20)
    }

    // children widgets
    addChildren({
        // HyperLink widget
        // which contains an image as child widget
        Hyperlink(link, Image().{
            url = icon;
            // the class of this HyperLink is `icon`
            className = String("icon");
        })
    });
}
```

Notice that we determine tha direct child that has the class `icon` in the first time.

Then we determine the state to be hovering with the cursor by passing `StateSelector.HOVER`.


### Animation

```
class Animation {
    handler this.set(totalDuration: Float, styles: Array[Style]);
    handler this.set(totalDuration: Float, styles: Map[Float, Style]);
}
```

This class is used to create animation for a component.

`set` a method to set the animation we want.

There are two versions for this method, one that accepts the styles as an array, the other as map
where keys represent the time and the value being the style corresponding to that time.


### Dimensions

```
class Dimensions {
    def width: Int = 0;
    def height: Int = 0;
}
```

A class that holds dimensions information.

`width` the width.

`height` the height.

### Color

```
class Color {
    def red: Int = 0;
    def green: Int = 0;
    def blue: Int = 0;
    def alpha: Int = 0;
}
```

A class that holds color information.

`red` red channel value.

`green` green channel value.

`blue` blue channel value.

`alpha` the transparency of the color.


### Length

```
class Length {
    defineInitializer[px, "px"];
    defineInitializer[pt, "pt"];
    defineInitializer[mm, "mm"];
    defineInitializer[vw, "vw"];
    defineInitializer[vh, "vh"];
    defineInitializer[vmin, "vmin"];
    defineInitializer[vmax, "vmax"];
    defineInitializer[em, "em"];
    defineInitializer[percent, "%"];
    handler (this:Length).toString(): String;
}
```

A class that holds distance information.

This class defines many measuring units which are:

`px` number of pixels.

`pt` number of points.

`mm` distance in millimeters.

`vw` a relative distance, proportional to 1% of the browser window width.

`vh` a relative distance, proportional to 1% of the browser window height.

`vmin` a relative distance, proportional to 1% of the browser window minimum side length.

`vmax` a relative distance, proportional to 1% of the browser window maximum side length.

`em` a relative distance, proportional to text font size.

`percent` a percentage of the container component.

Also, it contains the following method:

`toString` a method to convery class information into a string.

### Length4

```
class Length4 {
    defineInitializer[px, "px"];
    defineInitializer[pt, "pt"];
    defineInitializer[mm, "mm"];
    defineInitializer[vw, "vw"];
    defineInitializer[vh, "vh"];
    defineInitializer[vmin, "vmin"];
    defineInitializer[vmax, "vmax"];
    defineInitializer[em, "em"];
    defineInitializer[percent, "%"];
    handler (this:Length).toString(): String set_ptr;
}
```

Similar to `Length` but with 4 values, one for each direction.


### Transition

```
class Transition {
    def duration: Float = 0;
    def fn: String;
    def delay: Float = 0;
    handler this.toString(): String;
}
```

A class that holds transition information.

`duration` transition duration.

`fn` the name of the applied transition function.

`delay` the delay in executing the transition.

`toString` a method to convert the class information to a string.


### Transform

```
module Transform {
    func matrix(a: Float, b: Float, c: Float, d: Float, tx: Float, ty: Float): String;
    func matrix(
            a1: Float, b1: Float, c1: Float, d1: Float,
            a2: Float, b2: Float, c2: Float, d2: Float,
            a3: Float, b3: Float, c3: Float, d3: Float,
            a4: Float, b4: Float, c4: Float, d4: Float
    ): String;
    func rotate(deg: Float): String;
    func rotate(x: Float, y: Float, z: Float, deg: Float): String;
    func scale(x: Float): String;
    func scale(x: Float, y: Float): String;
    func scale(x: Float, y: Float, z: Float): String;
    func translate(x: ref[Length], y: ref[Length]): String;
    func translate(x: ref[Length], y: ref[Length], z: ref[Length]): String;
}
```

A class that holds transform information.

`matrix` a method to define transform matrix.

There are two versions of this method, the first defines a 2D transform matrix, while the other defines 3D transform matrix.

`rotate` a method to apply a rotation transform on a component.

There are two versions of this method, the first do 2D rotation, while the other defines 3D rotation.

In the first method, we need only the angle, while in the second we need the axis vector we want to rotate around it
by specifying its three coordinates.

`scale` a method to scale a shape, with two versions 2D and 3D.

`translate` a method to translate a shape, with two versions 2D and 3D.


### Background

```
class Background {
    handler this_type(c: ref[Color]): SrdRef[Background];
    handler this_type(
            u: String, repX: Bool, repY: Bool,
            pos: ref[BackgroundPosition],
            s: ref[BackgroundSize]
        ): SrdRef[Background];
    handler this_type(degree: Int, count: Int, args: ...any): SrdRef[Background];
}
```

Describes the properties of an element's background. It has three initializer functions:
* The first initializer creates a background with a solid color.
* The second initializer creates a background with an image.
* The third initializer creates a color gradient background. The first arg to this function is the
  angle of the gradient. The second argument is the number of color tuples that describes the
  gradient. Each touple consists of a `Color` followed by an `Int` representing the percentage
  of the total distance at which that color starts.


### Flex

```
class Flex {
    handler this.toString(): String;
}
```

A class that holds flex information.

`toString` a method to convert the class information to a string.


### Shadow

```
class Shadow {
    handler this.toString(): String;
}
```

A class that holds shadow information.

`toString` a method to convert the class information to a string.


### Position

An enum class that holds possible values for position as enum.
* `STATIC`
* `RELATIVE`
* `FIXED`
* `ABSOLUTE`
* `STICKY`


### Overflow

An enum class that holds possible values for overflow as enum.
* `VISIBLE`
* `HIDDEN`
* `CLIP`
* `SCROLL`
* `AUTO`


### Display

An enum class that holds possible values for display as enum.
* `INLINE`
* `BLOCK`
* `FLEX`
* `GRID`
* `NONE`


### Layout

An enum class that holds possible values for layout as enum.
* `ROW`
* `ROW_REVERSE`
* `COLUMN`
* `COLUMN_REVERSE`


### Align

An enum class that holds possible values for align as enum.
* `START`
* `CENTER`
* `END`
* `STRETCH`


### Justify

An enum class that holds possible values for justify as enum.
* `START`
* `CENTER`
* `END`
* `STRETCH`
* `SPACE_BETWEEN`
* `SPACE_AROUND`
* `SPACE_EVENLY`


### Cursor

An enum class that holds possible values for cursor as enum.
* `AUTO`
* `DEFAULT`
* `HELP`
* `POINTER`
* `PROGRESS`
* `WAIT`
* `CROSSHAIR`
* `TEXT`
* `MOVE`
* `NOT_ALLOWED`
* `GRAB`
* `GRABBING`
* `EW_RESIZE`
* `NS_RESIZE`
* `NESW_RESIZE`
* `NWSE_RESIZE`
* `ZOOM_IN`
* `ZOOM_OUT`


### BorderStyle

An enum class that holds possible values for border style as enum.
* `DOTTED`
* `DASHED`
* `SOLID`
* `DOUBLE`
* `GROOVE`
* `RIDGE`
* `NONE`
* `HIDDEN`


### WordBreak

An enum class that holds possible values for word break as enum.
* `NORMAL`
* `BREAK_ALL`
* `KEEP_ALL`
* `BREAK_WORD`


### Direction

An enum class that holds possible values for direction as enum.
* `LTR`
* `RTL`


### TextDecoration

An enum class that holds possible values for text decoration as enum.
* `NONE`
* `UNDERLINE`
* `OVERLINE`
* `LINE_THROUGH`


### TextDecorationStyle

An enum class that holds possible values for text decoration style as enum.
* `SOLID`
* `DOUBLE`
* `DOTTED`
* `DASHED`
* `WAVY`


### TextAlign

An enum class that holds possible values for text align as enum.
* `LEFT`
* `RIGHT`
* `CENTER`
* `JUSTIFY`


### FontWeight

```
def FontWeight: {
    def NORMAL: 400;
    def BOLD: 700;
}
```

An enum class that holds possible values for font weight.
* `NORMAL`
* `BOLD`


### Floating

An enum class that holds possible values for floating as enum.
* `NONE`
* `LEFT`
* `RIGHT`


### BackgroundPosition

An enumeration to control the position of a background image when its dimensions do not match the
dimension of the containing element. Possible values:
* `CENTER` 
* `RIGHT` 
* `LEFT` 
* `TOP` 
* `BOTTOM` 


### BackgroundSize

An enumeration to control the size of a background image when its dimensions do not match the
dimensions of the containing element. Possible values:
* `CONTAIN`: Scales the image so that it's entirely visible.
* `COVER`: Scales the image so that it covers the entire background. Portions of the image may
  be outside the boundaries of the element and hence won't be visible.

