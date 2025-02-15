# WebPlatform

[[عربي]](asset_routes.ar.md)

[[Back]](../readme.md)

## Creating Asset Routes on the Server

Asset routes can be created by placing the following definition anywhere in the code:

```
@assetsRoute def assetsRoute: "Assets/";
```

The server path in this case will be `/Assets/` while the directory path in the file system will
be `./Assets/`.

You can also specify a different server path from the file system path by specifying the server
path as an argument of the `@assetsRoute` modifier:

```
@assetsRoute["/images/"] def assetsRoute: "Assets/Images/";
```

In the upper example using the path `/images/` in the browser will give you access to the files
under `Assets/Images/`.

