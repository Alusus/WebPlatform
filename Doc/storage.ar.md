# مـنصة_ويب (WebPlatform)

<div dir=rtl>

[[English]](storage.en.md)

[[رجوع]](../README.ar.md)

## مـخزن (Storage)

```
صنف مـخزن {
    عملية هذا.هات_الطول(): صـحيح؛
    عملية هذا.هات_مفتاحا(فهرس: صـحيح): نـص؛
    عملية هذا.هات_عنصرا(مفتاح: مـؤشر_محارف): نـص؛
    عملية هذا.حدد_عنصرا(مفتاح: مـؤشر_محارف، قيمة: مـؤشر_محارف)؛
    عملية هذا.أزل_عنصرا(مفتاح: مـؤشر_محارف)؛
    عملية هذا.فرغ()؛
}
```

<div dir=ltr>

```
class Storage {
    handler this.getLength(): Int;
    handler this.getKey(index: Int): String;
    handler this.getItem(key: CharsPtr): String;
    handler this.setItem(key: CharsPtr, value: CharsPtr);
    handler this.removeItem(key: CharsPtr);
    handler this.clear();
}
```

</div>

صنف لتمكين تخزين البيانات في محليا بشكل دائمي أو في الجلسة الحالية.

#### هات_الطول (getLength)

```
عملية هذا.هات_الطول(): صـحيح؛
```

<div dir=ltr>

```
handler this.getLength(): Int;
```

</div>

دالة لجلب عدد العناصر المخزنة في المخزن.

#### هات_مفتاحا (getKey)

```
عملية هذا.هات_مفتاحا(فهرس: صـحيح): نـص؛
```

<div dir=ltr>

```
handler this.getKey(index: Int): String;
```

</div>

دالة لجلب المفتاح ذو التسلسل المعطى.

#### هات_عنصرا (getItem)

```
عملية هذا.هات_عنصرا(مفتاح: مـؤشر_محارف): نـص؛
```

<div dir=ltr>

```
handler this.getItem(key: CharsPtr): String;
```

</div>

دالة لجلب العنصر المخزن تحت المفتاح المعطى.

#### حدد_عنصرا (setItem)

```
عملية هذا.حدد_عنصرا(مفتاح: مـؤشر_محارف، قيمة: مـؤشر_محارف)؛
```

<div dir=ltr>

```
handler this.setItem(key: CharsPtr, value: CharsPtr);
```

</div>

دالة لتحديد عنصر ليتم تخزينه تحت المفتاح المعطى.

#### أزل_عنصرا (removeItem)

```
عملية هذا.أزل_عنصرا(مفتاح: مـؤشر_محارف)؛
```

<div dir=ltr>

```
handler this.removeItem(key: CharsPtr);
```

</div>

دالة لإزالة عنصر مخزن تحت المفتاح المعطى.

#### فرغ (clear)

```
عملية هذا.فرغ()؛
```

<div dir=ltr>

```
handler this.clear();
```

</div>

دالة لإفراغ المخزن بشكل كامل.

</div>
