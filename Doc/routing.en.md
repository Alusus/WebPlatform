# WebPlatform

[[عربي]](routing.ar.md)

[[Back]](../README.md)

## Routing in Rich Client Applications

This library support routing without reloading the page, using the following members of the `Window`
class:

`location`: Gets the current route from the browser.

`pushLocation`: Adds a route to a set of routes which emit the `onLocationChanged` signal. 

`onLocationChanged` we can listen to this signal to check for route changes and do what is needed.

The mentioned elements above allow the user to provide navigation without reloading. Additionally,
WebPlatform provides the following helper elements to facilitate the process:

`Router` allows us to associate callbacks to routes. A callback is triggered when the associated
route is reached.

`RoutingSwitcher` switches between views based on route changes.

`RoutingStack` stacks and unstacks views based on route changes.

To learn more about these two classes, you could refer to the next detailed section about each one.

### Router

```
class Router {
    handler this.route(r: String): ref[closure(String)];
    def onUnknownRoute: closure(RoutePayload);
    handler this.triggerRoute();
}
```

This class allows you to define a set of routes with a callback for each that is called when
transitioning to that route.

`route`: Allows you to specify a regular expression for a route and define the desired callback
to be executed when the current route matches the regular expression. The function returns a
reference to the callback, allowing the user to set its value.

`onUnknownRoute`: Specifies a callback that is called when reaching an unknown route.

### RoutePayload

```
class RoutePayload {
    def fullPath: String;
    def route: String;
    def params: Array[String];
}
```

A class that holds necessary information for route payload.

`fullPath` the full path including that host path.

`route` the relative path, which is the path within the host.

`params` parameters in this payload.

### Example

The following is an example using `RoutingStack`:

```
class ArticleView {
    @injection def component: Component;
    def articleView: SrdRef[Article];

    handler this~init() {
        def self: ref[this_type](this);
        // define the view as RoutingStack
        this.view = RoutingStack().{
            style.{
                width = Length.percent(100);
                height = Length.percent(100);
            };
            setTransition(
                createSlideStackTransition(0.5, true, false),
                createSlideStackTransition(0.5, true, true)
            );
            // the first route represent an article
            route(String("^/three")) = closure(RoutePayload): SrdRef[Widget] {
                // notice how we create the article each time
                // this will make the article to takes its value from a variable
                // we alter when editing the article.
                // which update the article without the need to reload the page
                self.articleView = Article();
                return self.articleView;
            };
            // the second route for editing an article
            route(String("^/three/edit")) = closure(RoutePayload): SrdRef[Widget] {
                // this is a component to edit the article (we don't need to know about it to understand the example)
                return ArticleEditor(article).{
                    // when the article changed, we should update the variables that stores the information
                    this.onUpdated = closure(t: String) {
                        // update the variable that stores the article content
                        article = t;
                        // update the article content directly without the need to reload the page
                        self.articleView.docView.setMarkdown(article);
                        // push the location of the article view in order to go to it, which is our first route.
                        Window.instance.pushLocation("/three");
                    }
                };
            };
        };
    }

    handler this_type(): SrdRef[ArticleView] {
        return SrdRef[ArticleView].construct();
    }
}
```

