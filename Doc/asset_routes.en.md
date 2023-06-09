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

Routes can also be added using the function `addAssetRoute`, which allows adding routes from
outside of the current folder.

