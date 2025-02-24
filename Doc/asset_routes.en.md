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

WebPlatform also supports defining two paths within the file system, one used when running the
program directly from the source code, and the other used when running the program from a pre-built
version. This feature allows the user to specify where the files will be copied when building the
binary version of the program. For example:

```
@assetsRoute["/images/"] def assetsRoute: ("Assets/Images/", "Images/");
```

In this example, WebPlatform will use the path "Assets/Images" when running the server using the
buildAndStartServer or buildAndRunServer functions, and will use the other path (Images) when running
the server using startServer or runServer. This capability allows for adopting a file system structure
when building a binary version of the project that is different from the one in the source code, which
is particularly useful in cases where resources are packaged with libraries independent of the project.

When using two different paths within the file system, the user can use the `$` symbol within the path
to make the path relative to the source file in which the `@assetsRoute` modifier is used. This allows
you to package resources with libraries and refer to the location of these resources within the library
regardless of the library's location in the file system. For example:

```
@assetsRoute["/images/"] def assetsRoute: ("$Images/", "Images/");
```

In this example, we tell WebPlatform that the images are located within the current library and their
path is `<library_path>/Images`. When building the binary version of the project, these files will be
copied to the `Images/` folder within the build directory, i.e., the directory where the binary version
will be built. During development, the files are used directly from their location within the library,
while after building, WebPlatform looks for these files in a different path specific to the binary version.


### Function getAssetsRoutesFromModules

```
func getAssetsRoutesFromModules (
    modulesRef: ref[Core.Basic.TiObject]
): Array[StaticRoute];
```

Retrieves information about resource routes defined within the referenced modules.


### Class StaticRoute

```
class StaticRoute {
    def uri: String;
    def srcPath: String;
    def buildPath: String;
}
```

This class contains information about a specific resources route.

`uri` is the resource path on the HTTP server, i.e., the path through which resources can be
accessed via an HTTP request.

`srcPath` is the source path of these resources in the file system. This path is used when
running the server directly without prior building. It typically points to the location of
the resources within the source code.

`buildPath` is the path in the file system that will be used when creating a digital version
of the project.

