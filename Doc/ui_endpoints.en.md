# WebPlatform

[[عربي]](ui_endpoints.ar.md)

[[Back]](../readme.md)

## Creating UI Endpoints

A UI endpoint can be created by writing a regular function that performs the desired actions and
adding the decorator `@uiEndpoint` to it. This decorator instructs WebPlatform to compile this
function into WebAssembly and provide it through the web server on the specified port given in the
decorator's argument.

In addition to this main decorator, the following decorators are available to control the
generated endpoint:

* `@title`: Specifies the title of the page in the browser.

* `@icon`: Specifies a path to an image to be used as an icon for this page.

* `@webApp`: Specifies the path of the manifest file used to make the application function as
  a Progressive Web App (PWA).

* `@preCache`: Receives a list of character strings as arguments. These arguments specify the files
  that we want to pre-cache on the user's device when the app is installed to enable it to work
  offline.

* `@dynCache`: Receives a list of character strings as arguments. These arguments carry regular
  expressions that specify the files we want to cache on the user's device dynamically, so they
  are not reloaded again. A file whose path matches any of these patterns is cached on the device
  after its first load.

### Example

```
// a ui endpoint for a user interface page which represent an about page
@uiEndpoint["/about"]
@title["WebPlatform Example - Chat"]
func about {

    Window.instance.style.{
        padding = Length4.pt(0);
        margin = Length4.pt(0);
    };
    // here we set the view for this page
    Window.instance.setView(Box({}).{
        style.{
            display = Display.FLEX;
            layout = Layout.COLUMN;
        };
        addChildren({
            Text(String("Example")).{ style.{
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
```

Note that we defined a function to drive the UI, and added the modifier `@uiEndpoint` to it with a the
page's URL. We also specified the page's title using the `@title` modifier.

Inside the function we set the view for this page using `Window.instance.setView` passing the needed
view to it. In our example, this view will be simply a `Box` that contains two `Text` widgets with some
styles.

At the end of the function we always execute the function `runEventLoop` that runs the event loop.

### System Messages

WebPlatform sends messages in some cases in response to system events. The user can subscribe to
`onMessage` to listen to these messages. These messages have a payload (a JSON type) that contains
a `type` property that the user can check to know the message type. The following message types
are available:

* `app_update_available`: Sent when an update is available for the web app. The user can respond
  to this message by notifying the user of the update, and then calling `updateApp` to perform
  the update.

* `app_install_prompt`: Sent when an install prompt is available for the web app. The user can
  respond to this message by notifying the user and then calling `showAppInstallPrompt`.

