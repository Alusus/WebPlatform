# WebPlatform

[[عربي]](canvas_example.ar.md)

[[Back]](../readme.md)

## Examples

### Dealing with the Canvas

```
import "Srl/Math";
import "Apm";
Apm.importFile("Alusus/WebPlatform");
use Srl;
use WebPlatform;

//==============================================================================
// Backend

// define the route that we store assets on it
@assetsRoute def assetsRoute: "Assets/";

//==============================================================================
// Frontend

def PRIMARY_COLOR: Color("8e50ef");

// a function used to create header widget
func createHeader (): SrdRef[Widget] {
    // here we create a rectangle area to add the widgets in it
    return Box({}).{
        // styles applied on this widget
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
        // children widgets for this widget
        addChildren({
            // here we will only have a Text widget that clarify that this is an example about Canvas
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

// A class to store information about position in the screen 
class Position {
    def x: Int;
    def y: Int;
}

// a ui endpoint for our web application
// here we set the route first, which is the root route here
// then we set the title of this endpoint
@uiEndpoint["/", "WebPlatform Example - Canvas"]
func main {
    // we will load the resources from the server
    // at first, we define a resource for each type of resources we want
    def img: ImageResource;  // image resource
    def music: AudioResource;  // audio resource
    def sound: AudioResource;  // audio resource
    // we load the resources in async way
    await(Promises.Promise[Int].all({
        // to load the image, we call `load` method on the resource with the image path
        img.load("Assets/logo.svg"),
        // we load the font by its name and the path of the its file
        loadFont("AlususMono", "Assets/AlususMono.otf"),
        // to load the audio, we call 'load` method on the resource with the audio path
        music.load("Assets/music.mp3"),
        sound.load("Assets/sound.mp3")
    }).ignoreResult());

    // define some variables that we will use later
    def pos: Position;  // a variable to store the position on screen
    pos.x = 200;
    pos.y = 150;
    def delta: Position;  // a variable to store the movement information
    delta.x = delta.y = 0;
    def pressed: Bool = 0;  // a variable to store whether we clicked the mouse or not
    def pointerLocked: Bool = false;  // a variable to store whether the pointer is locked or not
    def fullscreen: Bool = false;  // a variable to store whether we are in full screen mode or not
    def gamepadsCount: Int = 0;  // a variable to store the number of gamepads

    // build the view
    def canvas: SrdRef[Canvas];
    // apply some styles on the window
    // here we set the padding and margins to zero
    Window.instance.style.{
        padding = Length4.pt(0);
        margin = Length4.pt(0);
    };
    // set the window view
    Window.instance.setView(Box({}).{
        // some styles to apply on the Box that will hold the canvas and its tools
        style.{
            align = Align.CENTER;
            display = Display.FLEX;
            layout = Layout.COLUMN;
        };
        addChildren({
            // add the header widget
            createHeader(),
            // add another Box to hold audio options
            Box({}).{
                style.display = Display.FLEX;
                style.layout = Layout.ROW;
                addChildren({
                    // a button to play the music
                    Button(String("Play Music")).{
                        style.{
                            height = Length.pt(30);
                            width = Length.pt(120);
                            background = Background(Color(200, 200, 200));
                            fontSize = Length.pt(16.0);
                        };
                        // here we connect the click signal on the button with a closure that start playing the music
                        // we could do that by calling the `play` method on the audio resource
                        // note that we pass true for `loop` option
                        onClick.connect(closure (music: by_ref)&(widget: ref[Widget], payload: ref[Int]) {
                            music.play(true);
                        });
                    },
                    // a button to stop the music
                    Button(String("Stop Music")).{
                        style.{
                            height = Length.pt(30);
                            width = Length.pt(120);
                            background = Background(Color(200, 200, 200));
                            fontSize = Length.pt(16.0);
                        };
                        // here we connect the click signal on the button with a closure that stop playing the music
                        // we could do that by calling the `stop` method on the audio resource
                        onClick.connect(closure (music: by_ref)&(widget: ref[Widget], payload: ref[Int]) {
                            music.stop();
                        });
                    },
                    // a button to play the sound
                    Button(String("Play Sound")).{
                        style.{
                            height = Length.pt(30);
                            width = Length.pt(120);
                            background = Background(Color(200, 200, 200));
                            fontSize = Length.pt(16.0);
                        };
                        // here we connect the click signal on the button with a closure that start playing the sound
                        // we could do that by calling the `play` method on the audio resource
                        // note that we pass false for `loop` option
                        onClick.connect(closure (sound: by_ref)&(widget: ref[Widget], payload: ref[Int]) {
                            sound.play(false);
                        });
                    },
                    // a button to play the sound repeatedly
                    Button(String("Play Repeating Sound")).{
                        style.{
                            height = Length.pt(30);
                            width = Length.pt(180);
                            background = Background(Color(200, 200, 200));
                            fontSize = Length.pt(16.0);
                        };
                        // here we connect the click signal on the button with a closure that start playing the sound
                        // we could do that by calling the `play` method on the audio resource
                        // note that we pass true for `loop` option
                        onClick.connect(closure (sound: by_ref)&(widget: ref[Widget], payload: ref[Int]) {
                            sound.play(true);
                        });
                    },
                    // a button to stop the audio
                    Button(String("Stop Sound")).{
                        style.{
                            height = Length.pt(30);
                            width = Length.pt(120);
                            background = Background(Color(200, 200, 200));
                            fontSize = Length.pt(16.0);
                        };
                        // here we connect the click signal on the button with a closure that stop playing the audio
                        // we could do that by calling the `stop` method on the audio resource
                        onClick.connect(closure (sound: by_ref)&(widget: ref[Widget], payload: ref[Int]) {
                            sound.stop();
                        });
                    }
                });
            }
            // define the canvas widget
            Canvas().{
                canvas = this;
                // set the width and height
                bitmapWidth = Length.px(1280);
                bitmapHeight = Length.px(800);
                // apply some styles on the canvas
                style.{
                    width = Length.percent(100);
                    height = Length.percent(100);
                    maxWidth = Length.px(1280);
                    maxHeight = Length.px(800);
                    borderWidth = Length4.pt(2);
                    borderStyle = BorderStyle.SOLID;
                    borderColor = Color(0, 0, 0);
                    background = Background(Color(220, 220, 220));
                };
                def dim: Dimensions(1, 1);
                // connect the cursor movement signal with a closure that
                // update position value when this signal emitted
                onMouseMove.connect(closure (
                    pos: by_ref, dim: by_ref, pointerLocked: by_ref
                )&(
                    widget: ref[Widget], payload: ref[MouseMovePayload]
                ) {
                    if pointerLocked {
                        pos.x += payload.deltaX;
                        pos.y += payload.deltaY;
                    } else {
                        pos.x = payload.posX * 1280 / dim.width;
                        pos.y = payload.posY * 800 / dim.height;
                    }
                });
                // connect the cursor enter signal with a closure that
                // change border color back to its default value when this signal emitted
                onMouseEnter.connect(closure (widget: ref[Widget], payload: ref[Int]) {
                    this.style.borderColor = Color(0, 0, 0);
                });
                // connect the cursor exit signal with a closure that
                // change border color red when this signal emitted
                // this notify the user that cursor is out of the canvas
                onMouseOut.connect(closure (widget: ref[Widget], payload: ref[Int]) {
                    this.style.borderColor = Color(255, 0, 0);
                });
                // connect the mouse pressed signal with a closure that
                // change the value of `pressed` variable when this signal emitted
                // this only applied when the left button clicked
                onMouseDown.connect(closure (pressed: by_ref)&(widget: ref[Widget], payload: ref[MouseButtonPayload]) {
                    if payload.button == 0 pressed = 1;
                });
                // connect the mouse up signal with a closure that
                // change the value of `pressed` variable when this signal emitted
                // this only applied when the left button is released
                onMouseUp.connect(closure (pressed: by_ref)&(widget: ref[Widget], payload: ref[MouseButtonPayload]) {
                    if payload.button == 0 pressed = 0;
                });
                // connect the resize signal with a closure that
                // change the dimensions to an appropriate value
                onResize.connect(closure (dim: by_ref)&(widget: ref[Widget], payload: ref[Int]) {
                    dim = this.getDimensions();
                });
            }
        });
    });

    // define what is needed to use the gamepad with the canvas
    Window.instance.{
        // the keys needed is the directions only
        keysToSwallow = "ArrowUp,ArrowDown,ArrowLeft,ArrowRight";
        // connect the key down signal with a closure that
        // calculate the change in position when this signal emitted
        onKeyDown.connect(closure (
            delta: by_ref, pointerLocked: by_ref, fullscreen: by_ref
        )&(
            window: ref[Window], payload: ref[String]
        ) {
            if payload == "ArrowUp" delta.y = -5
            else if payload == "ArrowDown" delta.y = 5
            else if payload == "ArrowRight" delta.x = 5
            else if payload == "ArrowLeft" delta.x = -5
            // also here we will enter the full screen mode or exit it
            else if payload == "Enter" {
                if fullscreen exitFullScreen()
                else canvas.requestFullScreen();
            }
            // here we will request locking the pointer or releasing it
            else if payload == "Space" {
                if pointerLocked exitPointerLock()
                else canvas.requestPointerLock();
            }
        });
        // when key is up reset movement values
        onKeyUp.connect(closure (delta: by_ref)&(window: ref[Window], payload: ref[String]) {
            if payload == "ArrowUp" delta.y = 0
            else if payload == "ArrowDown" delta.y = 0
            else if payload == "ArrowRight" delta.x = 0
            else if payload == "ArrowLeft" delta.x = 0;
        });
        // connect the pointer lock changed signal with a closure that
        // update the value of `pointerLocked` when this signal emitted
        onPointerLockChange.connect(closure (pointerLocked: by_ref)&(window: ref[Window], payload: ref[Bool]) {
            pointerLocked = payload;
        });
        // connect the full screen changed signal with a closure that
        // update the value of `fullscreen` when this signal emitted
        // also we request locking the pointer when entering full screen mode
        // or releasing it when exiting the full screen mode
        onFullScreenChange.connect(closure (fullscreen: by_ref)&(window: ref[Window], payload: ref[Bool]) {
            fullscreen = payload;
            if payload canvas.requestPointerLock()
            else exitPointerLock();
        });
        // connect the gamepad connected and disconnected signals with a closure that
        // update the value of `gamepadsCount` when this signal emitted
        onGamepadConnected.connect(closure (gamepadsCount: by_ref)&(window: ref[Window], payload: ref[String]) {
            gamepadsCount = getGamepadsCount();
        });
        onGamepadDisconnected.connect(closure (gamepadsCount: by_ref)&(window: ref[Window], payload: ref[String]) {
            gamepadsCount = getGamepadsCount();
        });
    };

    // dynamically loading an image
    def dynImg: ImageResource;  // image resource
    def canvasRes: CanvasResource(100, 100);  // canvas to draw on it
    canvasRes.setLineWidth(5);
    canvasRes.setStrokeStyle("#ff5555");
    // draw two lines on the canvas
    canvasRes.drawLine(0, 0, 100, 100);
    canvasRes.drawLine(100, 0, 0, 100);
    // draw a polygon on the canvas
    def points: Array [Int]({ 25, 25, 75, 25, 75, 75, 25, 75 });
    canvasRes.drawPolygon(4, points.buf, false);
    // load the image from the canvas
    dynImg.initFromCanvas(canvasRes);

    // animation loop
    def x: Int = -80;
    // start a timer with 8 seconds period
    startTimer(8000, closure (
        x: by_ref, img: by_ref, dynImg: by_ref, pos: by_ref, delta: by_ref, pressed: by_ref, gamepadsCount: by_ref
    ) & (json: Json) {
        // first clear previous drawings
        canvas.clear();
        canvas.drawLine(0, 0, 100, 100);  // draw a line
        canvas.drawCircle(100, 180, 90);  // draw a circle
        // draw a polygon
        def points: Array [Int]({ 50, 50, 100, 50, 100, 100, 50, 100, 25, 75 });
        canvas.setFillStyle("black", "blue", 0, 0, 100, 100);
        canvas.drawPolygon(5, points.buf, true);
        // draw a text
        def TEXT: "Alusus";
        canvas.drawText(TEXT, "30px AlususMono", 550, 150);

        def size: Int = Math.sin(3.14 * x / 320.0) * 40 + 100;
        def y1: Int = Math.sin(3.14 * x / 320.0) * 100 + 400 - size / 2;
        def y2: Int = Math.cos(3.14 * x / 320.0) * 100 + 400 - size / 2;
        def alpha: Float = Math.sin(3.14 * x / 80.0) / 4 + 0.75;
        canvas.drawImage(img, x, y1, size, size, alpha);
        canvas.drawImage(dynImg, x, y2, size, size, alpha);

        // each time get the movement from the gamepad if any
        // and move accordingly
        if gamepadsCount > 0 {
            delta.x = getGamepadAxis(0, 0) * 5;
            delta.y = getGamepadAxis(0, 1) * 5;
            pressed = getGamepadButton(0, 0) > 0.5;
        }

        if pressed canvas.drawImage(img, pos.x, pos.y, size, size, alpha)
        else canvas.drawImage(dynImg, pos.x, pos.y, size, size, alpha);
        if ++x >= 1280 x = -80;
        pos.x += delta.x;
        pos.y += delta.y;
    });

    runEventLoop();
}


Console.print("Starting server on port 8010...\nURL: http://localhost:8010/\n");
// run the server on port 8010
runServer({ "listening_ports", "8010", "static_file_max_age", "0" });
```

