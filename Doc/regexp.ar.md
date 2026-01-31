# WebPlatform

[[English]](regexp.en.md)

[[رجوع]](../README.ar.md)

### تـعبير_نمطي (RegExp)

<div dir=rtl>

```
صنف تـعبير_نمطي {
    عرف هيئ(نص_نمط: مؤشر[مصفوفة[مـحرف]])؛
    عرف حرر(نص: مؤشر[مصفوفة[مـحرف]]، آخر_دليل: سند[صـحيح]): مـصفوفة[نـص]؛
    عرف طابق(نص: مؤشر[مصفوفة[مـحرف]]): مـصفوفة[نـص]؛
}
```

</div>

```
class RegExp {
    handler this.initialize(regStr: ptr[array[Char]]);
    handler this.release();
    handler this.match(str: ptr[array[Char]], lastIndex: ref[Int]): Array[String];
    handler this.match(str: ptr[array[Char]]): Array[String];
}
```

يمكن هذا الصنف من استخدام تعبير نمطي في عمليات مطابقة متعددة دون إعادة ترجمة التعبير النمطي
مع كل مقارنة.

#### هيئ (initialize)

تستعمل لتهيئة غرض بالنمط المطلوب.

#### حرر (release)

تستعمل لتحرير المورد المستعمل لهذا الغرض.

#### طابق (match)

تنفيذ المطابقة.

المعطيات:

* `نص` (`str`) النص الذي نريد مطابقته.
* `آخر_دليل` (`lastIndex`) يحدد هذا المتغير الدليل الذي يجب البدء منه في عملية المطابقة التالية.

