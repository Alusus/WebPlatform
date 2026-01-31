# WebPlatform

[[English]](storage.en.md)

[[رجوع]](../README.ar.md)

## مـخزن (Storage)

صنف لتمكين تخزين البيانات في محليا بشكل دائمي أو في الجلسة الحالية.

#### هات_الطول (getLength)

<div dir=rtl>

```
عرف هات_الطول(): صـحيح؛
```

</div>

```
handler this.getLength(): Int;
```

دالة لجلب عدد العناصر المخزنة في المخزن.

#### هات_مفتاحا (getKey)

<div dir=rtl>

```
عرف هات_مفتاحا(فهرس: صـحيح): نـص؛
```

</div>

```
handler this.getKey(index: Int): String;
```

دالة لجلب المفتاح ذو التسلسل المعطى.

#### هات_عنصرا (getItem)

<div dir=rtl>

```
عرف هات_عنصرا(مفتاح: مؤشر[مـحرف]): نـص؛
```

</div>

```
handler this.getItem(key: CharsPtr): String;
```

دالة لجلب العنصر المخزن تحت المفتاح المعطى.

#### حدد_عنصرا (setItem)

<div dir=rtl>

```
عرف حدد_عنصرا(مفتاح: مؤشر[مـحرف]، قيمة: مؤشر[مـحرف])؛
```

</div>

```
handler this.setItem(key: CharsPtr, value: CharsPtr);
```

دالة لتحديد عنصر ليتم تخزينه تحت المفتاح المعطى.

#### أزل_عنصرا (removeItem)

<div dir=rtl>

```
عرف أزل_عنصرا(مفتاح: مؤشر[مـحرف])؛
```

</div>

```
handler this.removeItem(key: CharsPtr);
```

دالة لإزالة عنصر مخزن تحت المفتاح المعطى.

#### فرغ (clear)

<div dir=rtl>

```
عرف فرغ()؛
```

</div>

```
handler this.clear();
```

دالة لإفراغ المخزن بشكل كامل.

