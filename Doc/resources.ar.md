# WebPlatform

<div dir=rtl>

[[English]](resources.en.md)

[[رجوع]](../README.ar.md)

## الموارد (Resources)

### مـورد_صورة (ImageResource)

```
صنف مـورد_صورة {
    عرف معرف: صـحيح_متكيف = 0؛
    عملية هذا.حمل(مسار: مؤشر[مصفوفة[مـحرف]]): سـندنا[مـؤجلة[صـحيح]]؛
    عملية هذا.هيئ_من_مرسم(مرسم: سند[مـورد_مرسم]): سـندنا[مـؤجلة[صـحيح]]؛
    عملية هذا.هات_الأبعاد(): أبـعاد؛
}
```

<div dir=ltr>

```
class ImageResource {
    def id: ArchInt = 0;
    handler this.load(u: ptr[array[Char]]): SrdRef[Promise[Int]];
    handler this.initFromCanvas(canvas: ref[CanvasResource]): SrdRef[Promise[Int]];
    handler this.getDimensions(): Dimensions;
}
```

</div>

مورد صورة يمكن استعماله مع عمليات الصور على مرسم.

#### معرف (id)

```
عرف معرف: صـحيح_متكيف = 0؛
```

<div dir=ltr>

```
def id: ArchInt = 0;
```

</div>

معرف فريد لتمييز المورد.

#### حمل (load)

```
عملية هذا.حمل(مسار: مؤشر[مصفوفة[مـحرف]]): سـندنا[مـؤجلة[صـحيح]]؛
```

<div dir=ltr>

```
handler this.load(u: ptr[array[Char]]): SrdRef[Promise[Int]];
```

</div>

تستعمل هذه الطريقة لتحميل المورد من مسار معطى.

#### هيئ_من_مرسم (initFromCanvas)

```
عملية هذا.هيئ_من_مرسم(مرسم: سند[مـورد_مرسم]): سـندنا[مـؤجلة[صـحيح]]؛
```

<div dir=ltr>

```
handler this.initFromCanvas(canvas: ref[CanvasResource]): SrdRef[Promise[Int]];
```

</div>

تستعمل هذه الطريقة لتهيئة المورد من مرسم معطى.

#### هات_الأبعاد (getDimensions)

```
عملية هذا.هات_الأبعاد(): أبـعاد؛
```

<div dir=ltr>

```
handler this.getDimensions(): Dimensions;
```

</div>

طريقة تستعمل لمعرفة أبعاد المورد.

### مـورد_مرسم (CanvasResource)

```
صنف مـورد_مرسم {
    عرف معرف: صـحيح_متكيف = 0؛
    عملية هذا.هيئ(عرض: صـحيح، ارتفاع: صـحيح)؛
    عملية هذا.غير_الأبعاد(عرض: صـحيح، ارتفاع: صـحيح)؛
}
```

<div dir=ltr>

```
class CanvasResource {
    def id: ArchInt = 0;
    handler this.init(w: Int, h: Int);
    handler this.resize(w: Int, h: Int);
}
```

</div>

مرسم منفصل يمكن استعماله لتوليد الصور بشكل ديناميكي. كما هو الحال مع `مـرسم` (`Canvas`)، يوفر هذا
الصنف مكون (mixin) `رسـم` لتمكين عمليات الرسم. راجع الصنف `رسـم` لمعرفة العمليات الرسومية التي يدعمها
هذا الصنف.

#### معرف (id)

```
عرف معرف: صـحيح_متكيف = 0؛
```

<div dir=ltr>

```
def id: ArchInt = 0;
```

</div>

معرف فريد لتمييز المورد.

#### هيئ (init)

```
عملية هذا.هيئ(عرض: صـحيح، ارتفاع: صـحيح)؛
```

<div dir=ltr>

```
handler this.init(w: Int, h: Int);
```

</div>

دالة لتهيئة مرسم بعرض وارتفاع.

#### غير_الأبعاد (resize)

```
عملية هذا.غير_الأبعاد(عرض: صـحيح، ارتفاع: صـحيح)؛
```

<div dir=ltr>

```
handler this.resize(w: Int, h: Int);
```

</div>

دالة لتغيير حجم المرسم إلى العرض والارتفاع المطلوبين.

### مـورد_صوت (AudioResource)

```
صنف مـورد_صوت {
    عرف معرف: صـحيح_متكيف = 0؛
    عملية هذا.حمل(مسار: مؤشر[مصفوفة[مـحرف]]): سـندنا[مـؤجلة[صـحيح]]؛
    عملية هذا.شغل(تكرار: ثـنائي)؛
    عملية هذا.شغل(تكرار: ثـنائي، أوقف_السابق: ثـنائي)؛
    عملية هذا.أوقف()؛
    عملية هذا.ألبث()؛
    عملية هذا.استأنف()؛
    عملية هذا.الجهارة = عـائم؛
    عملية هذا.الجهارة:عـائم؛
    عملية هذا.أمشتغل(): ثـنائي؛
}
```

<div dir=ltr>

```
class AudioResource {
    def id: ArchInt = 0;
    handler this.load(u: ptr[array[Char]]): SrdRef[Promise[Int]];
    handler this.play(loop: Bool);
    handler this.play(loop: Bool, stopPrevious: Bool);
    handler this.stop();
    handler this.pause();
    handler this.resume();
    handler this.volume = Float;
    handler this.volume:Float;
    handler this.isPlaying(): Bool;
}
```

</div>

صنف يستعمل من أجل الموارد الصوتية.

#### معرف (id)

```
عرف معرف: صـحيح_متكيف = 0؛
```

<div dir=ltr>

```
def id: ArchInt = 0;
```

</div>

معرف فريد لتمييز المورد.

#### حمل (load)

```
عملية هذا.حمل(مسار: مؤشر[مصفوفة[مـحرف]]): سـندنا[مـؤجلة[صـحيح]]؛
```

<div dir=ltr>

```
handler this.load(u: ptr[array[Char]]): SrdRef[Promise[Int]];
```

</div>

تحمل المورد من المسار المعطى.

#### شغل (play)

```
عملية هذا.شغل(تكرار: ثـنائي)؛
عملية هذا.شغل(تكرار: ثـنائي، أوقف_السابق: ثـنائي)؛
```

<div dir=ltr>

```
handler this.play(loop: Bool);
handler this.play(loop: Bool, stopPrevious: Bool);
```

</div>

تبدأ تشغيل الصوت من بدايته. في حال استدعائها ثانية قبل انتهاء التشغيل السابق
فإن الصوت سيشغل مجددا إلى جانب التشغيل السابق الذي سيستمر حتى انتهائه بشكل طبيعي. النسخة
الثانية من هذه الدالة تستلم معطى `أوقف_السابق` (`stopPrevious`) والذي يسمح للمستخدم
بإيقاف التشغيل السابق قبل تشغيل الصوت من جديد.

* `تكرار` (`loop`) تحديد فيما إذا كان الوضع هو تكرار للمورد أم يقف عندما ينتهي.

#### أوقف (stop)

```
عملية هذا.أوقف()؛
```

<div dir=ltr>

```
handler this.stop();
```

</div>

طريقة تستعمل لإيقاف المورد.

#### ألبث (pause)

```
عملية هذا.ألبث()؛
```

<div dir=ltr>

```
handler this.pause();
```

</div>

توقف التشغيل عند النقطة الحالية.

#### استأنف (resume)

```
عملية هذا.استأنف()؛
```

<div dir=ltr>

```
handler this.resume();
```

</div>

تكمل التشغيل من النقطة الحالية.

#### الجهارة (volume)

```
عملية هذا.الجهارة = عـائم؛
عملية هذا.الجهارة:عـائم؛
```

<div dir=ltr>

```
handler this.volume = Float;
handler this.volume:Float;
```

</div>

خاصية الصوت، يمكن جلبها أو تحديد قيمة لها.

#### أمشتغل (isPlaying)

```
عملية هذا.أمشتغل(): ثـنائي؛
```

<div dir=ltr>

```
handler this.isPlaying(): Bool;
```

</div>

طريقة تستعمل لإختبار فيما إذا كان المورد في وضع التشغيل.

</div>
