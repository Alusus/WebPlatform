# WebPlatform

<div dir=rtl>

[[English]](regexp.en.md)

[[رجوع]](../README.ar.md)

### تـعبير_نمطي (RegExp)

```
صنف تـعبير_نمطي {
    عملية هذا.هيئ(نص_نمط: مؤشر[مصفوفة[مـحرف]])؛
    عملية هذا.حرر()؛
    عملية هذا.طابق(نص: مؤشر[مصفوفة[مـحرف]]، آخر_دليل: سند[صـحيح]): مـصفوفة[نـص]؛
    عملية هذا.طابق(نص: مؤشر[مصفوفة[مـحرف]]): مـصفوفة[نـص]؛
}
```

<div dir=ltr>

```
class RegExp {
    handler this.initialize(regStr: ptr[array[Char]]);
    handler this.release();
    handler this.match(str: ptr[array[Char]], lastIndex: ref[Int]): Array[String];
    handler this.match(str: ptr[array[Char]]): Array[String];
}
```

</div>

يمكن هذا الصنف من استخدام تعبير نمطي في عمليات مطابقة متعددة دون إعادة ترجمة التعبير النمطي
مع كل مقارنة.

#### هيئ (initialize)

```
عملية هذا.هيئ(نص_نمط: مؤشر[مصفوفة[مـحرف]])؛
```

<div dir=ltr>

```
handler this.initialize(regStr: ptr[array[Char]]);
```

</div>

تستعمل لتهيئة غرض بالنمط المطلوب.

#### حرر (release)

```
عملية هذا.حرر()؛
```

<div dir=ltr>

```
handler this.release();
```

</div>

تستعمل لتحرير المورد المستعمل لهذا الغرض.

#### طابق (match)

```
عملية هذا.طابق(نص: مؤشر[مصفوفة[مـحرف]]، آخر_دليل: سند[صـحيح]): مـصفوفة[نـص]؛
عملية هذا.طابق(نص: مؤشر[مصفوفة[مـحرف]]): مـصفوفة[نـص]؛
```

<div dir=ltr>

```
handler this.match(str: ptr[array[Char]], lastIndex: ref[Int]): Array[String];
handler this.match(str: ptr[array[Char]]): Array[String];
```

</div>

تنفيذ المطابقة.

المعطيات:

* `نص` (`str`) النص الذي نريد مطابقته.
* `آخر_دليل` (`lastIndex`) يحدد هذا المتغير الدليل الذي يجب البدء منه في عملية المطابقة التالية.

</div>
