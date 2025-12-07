# WebPlatform

[[عربي]](components.ar.md)

[[Back]](../readme.md)

## Components

Components enable users to create reusable parts of the user interface, making it easier for users to create more complex user interfaces. A component consists of a single widget or a tree of widgets, along with the necessary interactions such as event handling for this widget.

### Creating a Component

We can create a component by defining a class for this component derived from `Component`, and
initializing it in the constructor by setting its view with whatever needed styling and events.

In addition to that, it's better to overload the () operator of the class to return a shared
reference to a newly created instance, instead of creating a temp variable.

As an example:

```
class Header {
    @injection def component: Component;

    handler this~init() {
        // define the rectangle aread to hold the widgets
        this.view = Box({}).{
            // apply some styles
            style.{
                width = Length.percent(100) - Length.pt(3);
                height = Length.pt(85);
                padding = Length4.pt(4, 0, 0, 0);
                background = Background(PRIMARY_COLOR);
                borderWidth = Length4.pt(1.5);
                borderStyle = BorderStyle.SOLID;
                borderColor = PRIMARY_COLOR;
                justify = Justify.SPACE_BETWEEN;
                display = Display.FLEX;
                layout = Layout.COLUMN;
            };
            // children widgets
            addChildren({
                // here we add the children widgets for this component
            });
        }
    }

    // We overload `Header()` to return a shared ref instead of a temp var.
    handler this_type(): SrdRef[Header] {
        return SrdRef[Header].construct();
    }
}
```


### Switcher

This component provides a space where a view can be dynamically displayed and switched at any
time, with the ability to apply transition effects on the switching operation.

```
class Switcher {
    handler this.setTransition(name: String, transition: SwitcherTransition);
    handler this.switchTo(child: SrdRef[Widget]);
    handler this.switchTo(child: SrdRef[Widget], transitionName: String);
    def shouldPreserveChild: closure (child: ref[Widget]): Bool;
}
```

#### setTransition

```
handler this.setTransition(name: String, transition: SwitcherTransition);
```

Adds transition effects for later use in the `switchTo` function.

Args:

* `name`: Any name that distinguishes this transition from others.
* `transition`: The definition of the transition we want to apply.

#### switchTo

```
handler this.switchTo(child: SrdRef[Widget]);
handler this.switchTo(child: SrdRef[Widget], transitionName: String);
```

Switching the current view to a new view. The first form switches the view without any transition
effects, while the second form switches the view with the specified transition effects identified
by the given name. The name should match one of the transitions added using the setTransition
function.

#### shouldPreserveChild

```
def shouldPreserveChild: closure (child: ref[Widget]): Bool;
```

A callback that is called when a view exits the scene (i.e., after switching to another view) to
determine whether we want to delete the old view or keep it hidden for later use. In some cases,
you may want to keep the view and not delete it if the user returns to it later, so that the user
does not lose any inputs made in that view. If this callback returns a value of 1, the view will
remain hidden in memory and can be returned to later using the switchTo function with the same
widget. However, if the function returns 0 or the user did not initially specify this callback,
the view will be deleted from the browser and will be recreated when switchTo is called again.
In this case, even if you keep the widget in memory, the corresponding DOM element for that widget
will be deleted from the browser, and as a result, the user will lose any changes made to that
element in the browser.


### SwitcherTransition

```
class SwitcherTransition {
    def currentViewStyle: Style;
    def incomingViewStyle: Style;
    def totalDuration: Int;
}
```

This class carries the properties of transitions used in a switcher. The definition of a transition
relies on styles and their properties for animation and effects.

`currentViewStyle`: The style of the current view that will exit the display area. This style should
contain the definition of animation effects for the view, such as specifying slide-out effects of
the view from the display area.

`incomingViewStyle`: The style of the new view that will enter the display area. This style should
contain the definition of animation effects for the view, such as specifying slide-in effects of the
view from outside the display area to its center.

`totalDuration`: The total duration of the transition.

Refer to the style guides for more information on defining animation effects.


### RoutingSwitcher

A switcher that switches between components based on routes.

```
class RoutingSwitcher {
    def onUnknownRoute: closure(ref[RoutingSwitcher], RoutePayload);
    def currentRouteIndex: Int = -1;
    handler this.route(r: String): ref[RouteCallback];
    handler this.route(r: CharsPtr): ref[RouteCallback];
    handler this.setTransition(forward: SwitcherTransition, backward: SwitcherTransition);
    handler this.determineCurrentRouteIndex(): Int;
    handler this.determineCurrentRouteIndex(rp: ref[RoutePayload]): Int;
}
```

#### onUnknownRoute

```
def onUnknownRoute: closure(ref[RoutingSwitcher], RoutePayload);
```

A callback determine what we want to do when the route is unknown.

#### currentRouteIndex

A integer representing the index of the current route.

#### route

```
handler this.route(r: String): ref[RouteCallback];
handler this.route(r: CharsPtr): ref[RouteCallback];
def RouteCallback: alias closure(RoutePayload): SrdRef[Widget];
```

Allows defining the callback function to be invoked when the route changes to the given route in
this function. The `route` function returns a reference to the callback so that the user can
specify a value for the callback. The callback should return a reference to the widget that will
be displayed in the switcher. The input of the path function is a regular expression.

#### setTransition

```
handler this.setTransition(forward: SwitcherTransition, backward: SwitcherTransition);
```

Specifies the desired transitions in the case of navigating to the previous or next route.

#### determineCurrentRouteIndex

```
handler this.determineCurrentRouteIndex(): Int;
handler this.determineCurrentRouteIndex(rp: ref[RoutePayload]): Int;
```

Infers the sequence of the current route relative to the known routes in this switcher. The second
form allows returning the data of the current path in addition to its sequence.


### Stack

This components allows the user to stack many view in front of each other, with a given animation
on transition if required.

#### setTransition

```
handler this.setTransition(name: String, transition: StackTransition);
```

Adds transition effects for later use in the `push` function.

Args:

* `name`: Any name that distinguishes this transition from others.
* `transition`: The definition of the transition we want to apply.

#### push

```
handler this.push(child: SrdRef[Widget]);
handler this.push(child: SrdRef[Widget], transitionName: String);
```

Used to add a view to the stack. The added view appears in front of the current views. The second
form of the function allows specifying the desired transition (animation effects). Without
specifying the transition, the addition will happen instantly without any effects. The name of the
transition should match the name of one of the transitions added using the `setTransition` function.

#### pop

```
handler this.pop();
handler this.pop(transitionName: String);
```

Used to remove a view from the top of the stack. The first form removes the view instantly without
any effects, while the second form allows specifying the desired transition to be applied. The name
of the transition should match the name of one of the transitions added using the `setTransition`
function.


### RoutingStack

A stack that relies on the current route to stack and automatically remove views.

#### onUnknownRoute

```
def onUnknownRoute: closure(ref[RoutingStack], RoutePayload);
```

A callback that gets called when the route is unknown to this stack.

#### route

```
handler this.route(r: String): ref[RouteCallback];
handler this.route(r: CharsPtr): ref[RouteCallback];
def RouteCallback: alias closure(RoutePayload): SrdRef[Widget];
```

Specifies the callback function to be called when the route changes to the given route in this
function. The `route` function returns a reference to the callback for the user to set a value
for the callback. The callback should return a reference to the view that will be displayed in
the stack. The `route` function argument is a regular expression.

Unlike a `RoutingSwitch`, the `RoutingStack` component continues to match all routes starting
from the first route until it reaches a non-matching route. With each match, it adds the
corresponding view. When a non-matching route is reached, the view corresponding to that route
is automatically removed. For example, if you specify the following routes:

a: /first/
b: /first/second/
c: /first/second/third/
d: /first/second/third/fourth/

And the user directly navigates to the route `/first/second/third/`, the stack will add views a,
b, and c, not just c. If the user navigates from the route `/first/second/` to
`/first/second/third/`, the stack will only add view c. However, if the user navigates from
`/first/second/third/` to `/first/`, the stack will remove views c and b, and so on.

#### setTransition

```
handler this.setTransition(pushing: StackTransition, popping: StackTransition);
```

This method is used to specify the transition for pushing and popping operations.


### EmbeddedSvg

Used to embed an SVG image within the executalbe rather than being fetched after the program is
started. This template class takes one argument, which is a path to an SVG file.

```
class EmbeddedSvg [filename: string]
```

The following example shows how to use this component:

```
Box().{
    addChildren({ EmbeddedSvg["resources/icon.svg"] });
}
```


### SlidingPanel

The `SlidingPanel` component is a UI panel that slides in from the edge of the screen, overlaying the
main content. It's commonly used for navigation menus, settings panels, filters, or additional
content that should be accessible but not always visible.

```
class SlidingPanel {
    @injection def component: Component;

    // Properties
    def isOpen: Bool;
    def position: SlidingPanelPosition;
    def panelSize: SrdRef[Length];
    def animationDuration: Float;
    def closeOnBackdropClick: Bool;

    // Methods
    handler this.setContent(child: SrdRef[Widget]);
    handler this.open();
    handler this.close();
    handler this.toggle();
}

class SlidingPanelPosition {
    def LEFT: String;    // Panel slides from left
    def RIGHT: String;   // Panel slides from right
    def TOP: String;     // Panel slides from top
    def BOTTOM: String;  // Panel slides from bottom
}
```

#### Properties

- **isOpen**: `Bool` - Controls whether the panel is currently open or closed.

- **position**: `SlidingPanelPosition` - Determines which edge of the screen the panel slides from.
  Options: `LEFT`, `RIGHT`, `TOP`, or `BOTTOM`.

- **panelSize**: `SrdRef[Length]` - The width (for left/right panels) or height (for top/bottom
  panels) of the sliding panel. Defaults to 300pt if not specified.

- **animationDuration**: `Float` - The duration of the slide animation in seconds. Default is 0.3
  seconds.

- **closeOnBackdropClick**: `Bool` - Whether clicking the backdrop (overlay) should close the
  panel. Default is `true`.

#### Methods

- **setContent(child: SrdRef[Widget])** - Sets the content to be displayed inside the sliding panel.

- **open()** - Opens the panel with a smooth slide animation.

- **close()** - Closes the panel with a smooth slide animation.

- **toggle()** - Toggles the panel between open and closed states.

#### Usage Example

```
import "Apm";
Apm.importFile("Alusus/WebPlatform");
use WebPlatform;

@uiEndpoint["/"]
func main {
    def myPanel: SrdRef[SlidingPanel];

    Window.instance.setView(Box({}).{
        addChildren({
            // Button to open panel
            Button(String("Open Menu")).{
                onClick.connect(closure (myPanel: by_ref)&(w: ref[Widget], p: ref[Int]) {
                    myPanel.open();
                });
            },

            // Panel from left side
            SlidingPanel().{
                myPanel = this;
                position = SlidingPanelPosition.LEFT;
                panelSize = Length.pt(320);

                setContent(
                    Box({}).{
                        style.{
                            padding = Length4.pt(20);
                        };
                        addChildren({
                            Text(String("Navigation Menu")),
                            Button(String("Close")).{
                                onClick.connect(closure (myPanel: by_ref)&(w: ref[Widget], p: ref[Int]) {
                                    myPanel.close();
                                });
                            }
                        });
                    }
                );
            }
        });
    });

    runEventLoop();
}
```

#### Common Use Cases

1. **Navigation Menu** - Left or right sliding panel containing navigation links
2. **Settings Panel** - Right sliding panel with configuration options
3. **Filters** - Side sliding panel with filter controls for lists or search results
4. **Bottom Sheet** - Bottom sliding panel for mobile-style action menus
5. **Notifications** - Top sliding panel for displaying announcements

#### Features

- Smooth slide-in/out animations
- Backdrop overlay with customizable opacity
- Automatic z-index management
- Click outside to close (optional)
- Customizable size and position
- Shadow effects that appear when open

#### Complete Examples

See the complete working examples at:
- [sliding_panel_example.alusus](../Examples/sliding_panel_example.alusus)
- [مثال_مزلق.أسس](../Examples/مثال_مزلق.أسس) (Arabic version)

