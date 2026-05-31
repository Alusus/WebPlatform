# WebPlatform

[[English]](signals.en.md)

[[رجوع]](../README.ar.md)

<div dir=rtl>

## الإشـارات (Signals)

الإشارات تمكن المستخدم من استلام إشعارات بما يحدث بشكل لا متزامن سواء في واجهة المستخدم أو غيرها.

### إشـارة (Signal)

```
صنف إشـارة [صنف_المالك: صنف، صنف_الحمولة: صنف] {
    عرف هذا.اربط(خانة: مغلف(سند[صنف_المالك]، حمولة: سند[صنف_الحمولة]))؛
    عرف هذا.افصل(خانة: مغلف(سند[صنف_المالك]، حمولة: سند[صنف_الحمولة]))؛
    عرف هذا.افصل(معرف: صـحيح)؛
    عرف هذا.هات_عدد_الروابط(): صـحيح؛
    عرف هذا.أرسل(المالك: سند[صنف_المالك]، الحمولة: سند[صنف_الحمولة])؛
    عرف هذا.عند_تغير_الارتباطات: مغلفة (عدد_الارتباطات: صـحيح)؛
}
```

<div dir=ltr>

```
class Signal [ownerType: type, payloadType: type] {
    handler this.connect(slot: closure (ref[ownerType], payload: ref[payloadType]));
    handler this.disconnect(slot: closure (ref[ownerType], payload: ref[payloadType]));
    handler this.disconnect(id: ArchInt);
    handler this.getConnectionCount (): Int;
    handler this.emit(owner: ref[ownerType], payload: ref[payloadType]);
    def onConnectionsChanged: closure (connectionCount: Int);
}
```

</div>

إشارة يمكن الاشتراك بها لمعالجة الأحداث، و يمكن أن يكون هناك أكثر من مشترك واحد.

#### معطيات القالب

`صنف_المالك` (`ownerType`): صنف مالك هذه الإشارة، أي الصنف الذي عُرفت هذه الإشارة ضمنه، على سبيل
المثال `ضـبيطة` (`Widget`). يحدد هذا المعطى صنف المعطى الأول للمغلفة التي تربطها بهذه الإشارة لاستلام
الأحداث. صنف معطى المغلفة يكون سندا لهذا الصنف.

`صنف_الحمولة` (`payloadType`): صنف البيانات التي تُمرر للمغلفات المرتبطة بهذه الإشارة. يحدد هذا
المعطى صنف المعطى الثاني للمغلفة، والذي يكون سندا لهذا الصنف.

مثلا، لو عرفنا الإشارة `إشـارة[ضـبيطة، نـص]` (`Signal[Widget, String]`) فإن المغلفة التي تُربط بهذه
الإشارة تعرف كالتالي:

```
مغلفة (سند[ضـبيطة]، سند[نـص]) { ... }
```

<div dir=ltr>

```
closure (ref[Widget], ref[String]) { ... }
```

</div>

#### اربط (connect)

```
عرف هذا.اربط(خانة: مغلف(سند[صنف_المالك]، حمولة: سند[صنف_الحمولة]))؛
```

<div dir=ltr>

```
handler this.connect(slot: closure (ref[ownerType], payload: ref[payloadType]));
```

</div>

طريقة لربط مغلف مع الإشارة، بحيث عندما يتم إرسال الإشارة يتم استدعاءه و تمرير الحمولة إليه.

#### افصل (disconnect)

```
عرف هذا.افصل(خانة: مغلف(سند[صنف_المالك]، حمولة: سند[صنف_الحمولة]))؛
عرف هذا.افصل(معرف: صـحيح)؛
```

<div dir=ltr>

```
handler this.disconnect(slot: closure (ref[ownerType], payload: ref[payloadType]));
handler this.disconnect(id: ArchInt);
```

</div>

طريقة لفصل مغلفة تم ربطها بواسطة التابع السابق عن الإشارة.

#### هات_عدد_الروابط (getConnectionCount)

```
عرف هذا.هات_عدد_الروابط(): صـحيح؛
```

<div dir=ltr>

```
handler this.getConnectionCount (): Int;
```

</div>

طريقة تعيد عدد الروابط للإشارة.

#### أرسل (emit)

```
عرف هذا.أرسل(المالك: سند[صنف_المالك]، الحمولة: سند[صنف_الحمولة])؛
```

<div dir=ltr>

```
handler this.emit(owner: ref[ownerType], payload: ref[payloadType]);
```

</div>

لإرسال إشارة عبر جميع الارتباطات الحالية لهذه الإشارة.

#### عند_تغير_الارتباطات (onConnectionsChanged)

```
عرف هذا.عند_تغير_الارتباطات: مغلفة (عدد_الارتباطات: صـحيح)؛
```

<div dir=ltr>

```
def onConnectionsChanged: closure (connectionCount: Int);
```

</div>

دالة مغلفة تُستدعى عند تغير الارتباطات الحالية سواء بفصل أحد الارتباطات أو بإنشاء ارتباط جديد.


### إشـارة_حدث_دوم (DomEventSignal)

```
صنف إشـارة_حدث_دوم {
    عرف المبدئي_مكبوح: ثـنائي = خطأ؛
}
```

<div dir=ltr>

```
class DomEventSignal [ownerType: type, payloadType: type] {
    def defaultPrevented: Bool = false;
}
```

</div>

هذا الصنف مشتق من الصنف `إشـارة` (`Signal`) ويستخدم للإشارات القادمة من عناصر المتصفح.

#### المبدئي_مكبوح (defaultPrevented)

```
عرف المبدئي_مكبوح: ثـنائي = خطأ؛
```

<div dir=ltr>

```
def defaultPrevented: Bool = false;
```

</div>

تحديد فيما إذا كان يجب تنفيذ الفعل الافتراضي أم لا.

</div>
