# WebPlatform

[[English]](asset_routes.en.md)

[[رجوع]](../readme.ar.md)

## إنشاء مسارات الموارد في الخادم

يمكن القيام بذلك ببساطة عن طريق كتابة:

<div dir=rtl>

```
@مسار_موارد عرف مسار_الموارد: "Assets/"؛
```

</div>

```
@assetsRoute def assetsRoute: "Assets/";
```

المسار في هذه الحالة في نظام الملفات سيطابق `./Assets/` بينما في الخادم سيكون `/Assets/`.

ويمكنك تحديد مسار في الخادم مختلف عن المسار في نظام الملفات عبر تمرير مسار الخادم كمعطى
للمبدل `@مسار_موارد` (`@assetsRoute`):

<div dir=rtl>

```
@مسار_موارد["/images/"] عرف مسار_الموارد: "Assets/Images/"؛
```

</div>

```
@assetsRoute["/images/"] def assetsRoute: "Assets/Images/";
```

في المثال أعلاه استخدام المسار `/images/` في المتصفح سيوصلك إلى الملفات التي في المجلد `Assets/Images/`.

