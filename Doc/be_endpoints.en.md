# WebPlatform

[[عربي]](be_endpoints.ar.md)

[[Back]](../README.md)

## Creating BackEnd Endpoints

We create backend endpoints by writing a regular function and add `beEndpoint` modifier to it.
The function should receive a single argument, which is a `Http.Connection` pointer and it should
use it to read the request data and send the response.

This modifier needs the following arguments:

`method` The HTTP method of the endpoint.

`uri` The route of the endpoint on the server.

### Example

```
// a backend endpoint with the given route that accept GET method
// this endpoint used to retrieve the messages
@beEndpoint["GET", "/messages"]
func getMessages (conn: ptr[Http.Connection]) {
    // concatenate the messages with a line break between them.
    def response: String = String.merge(messages, "<br>");
    // add the required headers
    Http.print(conn, "HTTP/1.1 200 Ok\r\n");
    Http.print(conn, "Content-Type: text/plain\r\n");
    Http.print(conn, "Cache-Control: no-cache\r\n");
    Http.print(conn, "Content-Length: %d\r\n\r\n", response.getLength());
    // add the buffer content which contains the messages
    Http.print(conn, response.buf);
}
```

Note in our example how we defined a function that accept a connection and send the response by
calling `Http.print`. First, we send the appropriate headers followed by the response body.

Also, we added the modifier to this function and set the accepted method to `GET`, and gave
our endpoint the route `/messages`.

