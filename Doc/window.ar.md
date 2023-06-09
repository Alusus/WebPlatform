# WebPlatform

[[English]](window.en.md)

[[رجوع]](../readme.ar.md)

## نافذة (Window)

صنف يمثل النافذة الرئيسية للتطبيق، والتي تقابل نافذة اللسان في المتصفح أو نافذة التطبيق في حالة تطبيقات الويب.

#### النموذج (instance)

<div dir=rtl>

```
عرف النموذج: نـافذة(0~مثل[مؤشر])؛
```

</div>

```
@shared def instance: Window(0~cast[ptr]);
```

الكائن الوحيد من هذا الصنف والذي يمثل نافذة التطبيق الرئيسية.

#### الطراز (style)

<div dir=rtl>

```
عملية هذا.الطراز: سـندنا[طـقم_طرز]
```

</div>

```
handler this.style: SrdRef[StyleSet];
```

الحصول على طقم الطرز الخاص بالنافذة. ستنشئ الدالة طقم طرز للنافذة إن لم يكن منشأً مسبقًا.

#### مخزن_الجلسة (sessionStorage)

<div dir=rtl>

```
عرف مخزن_الجلسة: مـخزن(0)؛
```

</div>

```
def sessionStorage: Storage(0);
```

المخزن المستعمل لحفظ معلومات الجلسة.

#### المخزن_المحلي (localStorage)

<div dir=rtl>

```
عرف المخزن_المحلي: مـخزن(1)؛
```

</div>

```
def localStorage: Storage(1);
```

المخزن المستعمل لحفظ المعلومات المحلية الخاصة بالمستخدم على جهازه.

#### حدد_المشهد (setView)

<div dir=rtl>

```
عرف حدد_المشهد(مشهد: سـندنا[ودجـة])؛
```

</div>

```
handler this.setView(v: SrdRef[Widget]);
```

دالة لتحديد المشهد الرئيسي الذي نريد عرضه في النافذة.

#### أزل_المشهد (unsetView)

<div dir=rtl>

```
عرف أزل_المشهد()؛
```

</div>

```
handler this.unsetView();
```

دالة لإزالة المشهد المعروض حالياً.

#### المسار (location)

<div dir=rtl>

```
عملية هذا.المسار: نـص؛
```

</div>

```
handler this.location: String;
```

المسار الحالي.

#### الوسم (hash)

<div dir=rtl>

```
عملية هذا.الوسم: نـص؛
```

</div>

```
handler this.hash: String;
```

خصلة تستعيد الجزء من العنوان الذي يلي علامة #.

#### الاستعلام (query)

<div dir=rtl>

```
عرف هذا.الاستعلام: نـص؛
```

</div>

```
handler this.query: String;
```

تستعيد الجزء من العنوان الذي يلي علامة ؟.

#### ادفع_مسارا (pushLocation)

<div dir=rtl>

```
عرف ادفع_مسارا(مسار: مؤشر[مصفوفة[مـحرف]])؛
```

</div>

```
handler this.pushLocation (url: ptr[array[Char]]);
```

دالة لإضافة مسار إلى تاريخ المتصفح. تسمح هذه الدالة بتغيير عنوان المتصفح دون إعادة تحميل الصفحة.

#### عند_بدء_الكبسة (onKeyDown)

<div dir=rtl>

```
عرف عند_بدء_الكبسة: إشـارة_حدث_دوم[نـافذة، نـص]؛
```

</div>

```
def onKeyDown: DomEventSignal[Window, String];
```

حدث يُثار عند الضغط على زر في لوحة المفاتيح.

#### عند_انتهاء_الكبسة (onKeyUp)

<div dir=rtl>

```
عرف عند_انتهاء_الكبسة: إشـارة_حدث_دوم[نـافذة، نـص]؛
```

</div>

```
def onKeyUp: DomEventSignal[Window, String];
```

حدث يُثار عند انتهاء الضغط على زر في لوحة المفاتيح.

#### عند_تغير_احتكار_المؤشر (onPointerLockChange)

<div dir=rtl>

```
عرف عند_تغير_احتكار_المؤشر: إشـارة_حدث_دوم[نـافذة، ثـنائي]؛
```

</div>

```
def onPointerLockChange: DomEventSignal[Window, Bool];
```

حدث يُثار عند تغير احتكار المؤشر.

#### عند_تغير_ملء_الشاشة (onFullScreenChange)

<div dir=rtl>

```
عرف عند_تغير_ملء_الشاشة: إشـارة_حدث_دوم[نـافذة، ثـنائي]؛
```

</div>

```
def onFullScreenChange: DomEventSignal[Window, Bool];
```

حدث يُثار عند تغير حالة ملء الشاشة.

#### عند_ربط_مقبض (onGamepadConnected)

<div dir=rtl>

```
عرف عند_ربط_مقبض: إشـارة_حدث_دوم[نـافذة، نـص]؛
```

</div>

```
def onGamepadConnected: DomEventSignal[Window, String];
```

حدث يُثار عند ربط مقبض ألعاب.

#### عند_فصل_مقبض (onGamepadDisconnected)

<div dir=rtl>

```
عرف عند_فصل_مقبض: إشـارة_حدث_دوم[نـافذة، نـص]؛
```

</div>

```
def onGamepadDisconnected: DomEventSignal[Window, String];
```

حدث يُثار عند فصل مقبض ألعاب.

#### عند_تغير_المسار (onLocationChanged)

<div dir=rtl>

```
عرف عند_تغير_المسار: إشـارة_حدث_دوم[نـافذة، صـحيح]؛
```

</div>

```
def onLocationChanged: DomEventSignal[Window, Int];
```

حدث يُثار عند تغير المسار في المتصفح دون إعادة تحميل الصفحة. يُثار هذا الحدث عند استدعاء
دالة `ادفع_مسارا` (`pushLocation`) أو عند كبس المستخدم على زر الرجوع أو التقدم في المتصفح.

