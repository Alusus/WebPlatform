# WebPlatform

[[عربي]](chat_example.ar.md)

[[Back]](../readme.md)

## Examples

### Chat Application

```
import "Build";
import "Apm";
Apm.importFile("Alusus/WebPlatform");
use Srl;
use WebPlatform;

//==============================================================================
// server

def MAX_MESSAGES: 12;  // maximum number of messages
def messages: Array[String];  // an array to store the messages

// a backend endpoint that accepts POST method and has the given route
// this endpoint is used to send messages
@beEndpoint["POST", "/messages"]
func postMessages (conn: ptr[Http.Connection]) {
    def postData: array[Char, 1024];
    // retrieve the sent information and store it in the buffer
    def postDataSize: Int = Http.read(conn, postData~ptr, postData~size);
    // in case of exceeding max number of messages delete the oldest
    if messages.getLength() >= MAX_MESSAGES messages.remove(0);
    // add the new message
    messages.add(String(postData~ptr, postDataSize));
    Http.print(conn, "HTTP/1.1 200 Ok\r\n\r\n");
}

// a backend endpoint that accepts GET method and has the given route
// this endpoint is used to retrieve the messages
@beEndpoint["GET", "/messages"]
func getMessages (conn: ptr[Http.Connection]) {
    // concatenate messages with a line break between them
    def response: String = String.merge(messages, "<br>");
    // add required headers
    Http.print(conn, "HTTP/1.1 200 Ok\r\n");
    Http.print(conn, "Content-Type: text/plain\r\n");
    Http.print(conn, "Cache-Control: no-cache\r\n");
    Http.print(conn, "Content-Length: %d\r\n\r\n", response.getLength());
    // add buffer content which contains the messages
    Http.print(conn, response.buf);
}

// resources path on the server
@assetsRoute def assetsRoute: "Assets/";

//==============================================================================
// User Interface components

def PRIMARY_COLOR: Color("8e50ef");
def LIGHT_COLOR: Color("c380ff");

// define a component that represents a menu button
class MenuButton {
    @injection def component: Component;

    handler this~init(link: String, label: String, icon: String) {
        // a rectangle area that holds the children widget
        this.view = Box({}).{
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
            // apply a style on a child widget with the class `label`
            style(">>label").{
                fontSize = Length.pt(16.0);
                fontColor = Color("eee");
            }
            // apply a style on a child widget with the class `icon`
            // this style will be applied when we hover with the cursor over the widget
            style({ StateSelector.HOVER, ">>icon" }).{
                height = Length.pt(20)
            }
            // apply a style on a child widget with the class `label`
            // this style will be applied when we hover with the cursor over the widget
            style({ StateSelector.HOVER, ">>label" }).{
                fontSize = Length.pt(16.0);
                fontColor = Color("fff");
            }
            // children widgets
            addChildren({
                // hyper link widget
                // which contains a Text as the child widget
                Hyperlink(link, Text(label).{
                    // the class of this link is `label`
                    className = String("label")
                }).{ style.textDecoration = TextDecoration.NONE },
                // hyper link widget
                // which contains a Image as the child widget
                Hyperlink(link, Image().{
                    url = icon;
                    // the class of this link is `icon`
                    className = String("icon");
                })
            });
        };
    }

    handler this_type(link: String, label: String, icon: String): SrdRef[MenuButton] {
        return SrdRef[MenuButton]().{ alloc()~init(link, label, icon) };
    }
}

// define a component that represents a header
class Header {
    @injection def component: Component;

    handler this~init() {
        // define a rectangle area the holds the children widgets
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
                // a rectangle area that defines the first section of the component
                Box({}).{
                    // apply some styles
                    style.{
                        display = Display.FLEX;
                        layout = Layout.ROW;
                        justify = Justify.SPACE_BETWEEN;
                        align = Align.CENTER;
                    };
                    // children widgets
                    addChildren({
                        // a Box that contains a Text widget
                        Box({ Text(String("Alusus Web Platform Examples - Chat")).{ style.{
                            fontColor = Color("fff");
                            fontSize = Length.pt(18.0);
                            height = Length.percent(100);
                            padding = Length4.pt(0, 10);
                        } } }),
                        // Image widget
                        Image().{
                            url = String("/Assets/wblogo.svg");
                            style.{
                                height = Length.pt(50);
                                padding = Length4.pt(0, 10);
                            };
                        }
                    });
                },
                // a rectangle area that defines the second section of the component
                Box({}).{
                    // apply some styles
                    style.{
                        display = Display.FLEX;
                        layout = Layout.ROW;
                        justify = Justify.SPACE_BETWEEN;
                    };
                    // children widgets
                    addChildren({
                        // define two menu buttons
                        // the first button takes us to the root route and has the given text and the given icon
                        MenuButton(String("/"), String("Main"), String("/Assets/chat.svg")),
                        // the first button takes us to the about page route and has the given text and the given icon
                        MenuButton(String("/about"), String("About"), String("/Assets/about.svg"))
                    });
                }
            });
        };
    }

    handler this_type(): SrdRef[Header] {
        return SrdRef[Header].construct();
    }
}

// a component that represents a text entry field
class TextEntry {
    @injection def component: Component;

    // a closure to handle new input
    def onNewEntry: closure (String);
    // a text input widget
    def textInput: SrdRef[TextInput];

    handler this.width = SrdRef[Length] {
        this.view.style.width = value;
        return value;
    }

    handler this.height = SrdRef[Length] {
        this.view.style.height = value;
        return value;
    }

    handler this~init() {
        def self: ref[this_type](this);

        this.view = Box({}).{
            style.{
                display = Display.FLEX;
                layout = Layout.ROW;
                justify = Justify.SPACE_BETWEEN;
                borderWidth = Length4.pt(1.5);
                borderStyle = BorderStyle.SOLID;
                borderColor = PRIMARY_COLOR;
                background = Background(PRIMARY_COLOR);
            };
            // children widgets
            addChildren({
                // a text input widget
                TextInput().{
                    self.textInput = this;
                    style.{
                        width = Length.percent(100);
                        height = Length.percent(100);
                        background = Background(Color("fff"));
                        fontSize = Length.pt(12.0);
                    };
                    // connect key up signal with a closure that check whether the clicked button
                    // is what we define for send ("shift + enter")
                    // in that case `onNewEntry` will called with the new text
                    // also, the text input will be cleared to be ready for next input
                    onKeyUp.connect(closure (widget: ref[TextInput], payload: ref[String]) {
                        if payload == "Shift+Enter" {
                            def newData: String = String("- ") + encodeHtml(widget.getText()).trim();
                            widget.setText(String());
                            if not self.onNewEntry.isNull() self.onNewEntry(newData);
                        }
                    });
                },
                Button(String("Send")).{
                    style.{
                        height = Length.percent(100);
                        width = Length.pt(50);
                        background = Background(Color(200, 200, 200));
                        fontSize = Length.pt(16.0);
                        justify = Justify.CENTER;
                    };
                    // connect click signal with a closure that call `onNewEntry` with the new text
                    // also, the text input will be cleared to be ready for next input
                    onClick.connect(closure (widget: ref[Widget], payload: ref[Int]) {
                        def newData: String = String("- ") + encodeHtml(self.textInput.getText()).trim();
                        self.textInput.setText(String());
                        if not self.onNewEntry.isNull() self.onNewEntry(newData);
                    });
                }
            });
        };
    }

    handler this_type(): SrdRef[TextEntry] {
        return SrdRef[TextEntry].construct();
    }
}

// a function to convert a regular text to HTML
func encodeHtml(str: String): String {
    return str
        .replace("\n", "<br>")
        .replace(",", "&comma;")
        .replace("\"", "&quot;");
}

//==============================================================================
// User Interface Pages

// a UI endpoint for main page
@uiEndpoint["/", "WebPlatform Example - Chat"]
func main {
    def onFetch: closure (json: Json);

    Window.instance.style.{
        padding = Length4.pt(0);
        margin = Length4.pt(0);
    };
    // set the window view
    Window.instance.setView(Box({}).{
        style.{
            height = Length.percent(100);
            justify = Justify.SPACE_BETWEEN;
            display = Display.FLEX;
            layout = Layout.COLUMN;
        };
        // children widgets
        addChildren({
            Header(),  // add header component
            Box({}).{
                style.{
                    width = Length.percent(100) - Length.pt(10);
                    padding = Length4.pt(5);
                    display = Display.FLEX;
                    layout = Layout.COLUMN;
                    flex = Flex(1);
                };
                def notificationLabel: SrdRef[Text];
                addChildren({
                    Text(String()).{
                        notificationLabel = this;
                        style.{
                            width = Length.percent(100);
                            height = Length.pt(20);
                            fontColor = Color(200, 50, 50);
                            fontSize = Length.pt(10.0);
                        };
                    },
                    Text(String()).{
                        style.{
                            width = Length.percent(100);
                            height = Length.percent(100);
                            fontColor = Color(50, 50, 50);
                            fontSize = Length.pt(20.0);
                        };
                        // define a closure that will be called when fetching the data from the server
                        onFetch = closure (json: Json) {
                            // at first, check that data is fetched without errors
                            def status: Int = json("eventData")("status");
                            if status >= 200 and status < 300 {
                                // extract the data
                                def data: String = json("eventData")("body");
                                // update the text
                                if this.getText() != data {
                                    this.setText(data);
                                }
                                // remove the notification after updating the text
                                if notificationLabel.getText() != "" {
                                    notificationLabel.setText(String(""));
                                }
                            } else { // the case of error in fetching data
                                // add a notification about the error
                                notificationLabel.setText(String("Connection error. HTTP status: ") + status);
                            }
                        };
                    }
                });
            },
            TextEntry().{
                width = Length.percent(100) - Length.pt(3);
                height = Length.pt(50);
                // define a closure that will be called on new entry
                onNewEntry = closure (newData: String) {
                    // send the text to the server
                    // set the method, route, data type, and the data
                    sendRequest(
                        "POST", "/messages", "Content-Type: application/text", newData, 10000,
                        closure (Json) {}
                    );
                    // retrieve the data from the server and call `onFetch`
                    sendRequest("GET", "/messages", null, null, 500, onFetch);
                };
            }
        })
    });

    // define a timer that updates the data periodically without the need to reload the page
    startTimer(500000, closure (json: Json) {
        sendRequest("GET", "/messages", null, null, 500, onFetch);
    });
    // fetch the data directly for the first time
    // later, the closure we add on the previous timer will update the content
    sendRequest("GET", "/messages", null, null, 500, onFetch);

    runEventLoop();
}

// a UI endpoint for about page
@uiEndpoint["/about", "WebPlatform Example - Chat"]
func about {
    Window.instance.style.{
        padding = Length4.pt(0);
        margin = Length4.pt(0);
    };
    Window.instance.setView(Box({}).{
        style.{
            display = Display.FLEX;
            layout = Layout.COLUMN;
        };
        addChildren({
            Header(),
            Text(String("Chat Example")).{ style.{
                fontColor = Color(0, 0, 0);
                fontSize = Length.pt(30.0);
            } },
            Text(String("Built using Alusus Web Platform")).{ style.{
                fontColor = Color(0, 0, 0);
                fontSize = Length.pt(20.0);
            } }
        })
    });

    runEventLoop();
}


//==============================================================================
// Program Entry

func startChatServer {
    Console.print("Starting server on port 8010...\nURL: http://localhost:8010/\n");
    buildAndRunServer[serverModules](Array[CharsPtr]({ "listening_ports", "8010", "static_file_max_age", "0" }));
}

startChatServer();
```

