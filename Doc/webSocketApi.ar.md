# مـنصة_ويب (WebPlatform)

<div dir=rtl>

[[English]](WebsocketApi.md)

[[رجوع]](../README.ar.md)

## مـقبس_ويب (WebSocket Browser Api)

النظير على جانب المتصفح للصنف `اتـصال_مقبس` (`WsConnection`) الذي يعمل على جانب الخادم.

اقرأ أولًا توثيق [واجهة WebSocket في MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
لفهم كائن المتصفح الذي يغلّفه هذا الصنف.

#### بنية الصنف

```
صنف مـقبس_ويب {
    عرف عند_الفتح: إشـارة[مـقبس_ويب، صـحيح]؛
    عرف عند_استلام_رسالة: إشـارة[مـقبس_ويب، حـمولة_رسالة_مقبس]؛
    عرف عند_الخطأ: إشـارة[مـقبس_ويب، صـحيح]؛
    عرف عند_الإغلاق: إشـارة[مـقبس_ويب، حـمولة_إغلاق_مقبس]؛

    دالة أنشئ(الرابط: مؤشر[مـحرف]، البروتوكولات: مؤشر[مـحرف]): سـندنا[مـقبس_ويب]؛
    دالة أنشئ(الرابط: مؤشر[مـحرف]): سـندنا[مـقبس_ويب]؛

    عملية هذا.أرسل_نصا(بيانات: مؤشر[مـحرف]): مؤشر[مصفوفة[مـحرف]]؛
    عملية هذا.أرسل_ثنائيا(بيانات: مؤشر[مـحرف]، طول_البيانات: طـبيعي_متكيف): مؤشر[مصفوفة[مـحرف]]؛

    عملية هذا.أغلق(): مؤشر[مصفوفة[مـحرف]]؛
    عملية هذا.أغلق(الرمز: صـحيح): مؤشر[مصفوفة[مـحرف]]؛
    عملية هذا.أغلق(الرمز: صـحيح، السبب: مؤشر[مـحرف]): مؤشر[مصفوفة[مـحرف]]؛

    عملية هذا.هات_الحالة(): صـحيح؛
    عملية هذا.هات_الرابط(): مؤشر[مصفوفة[مـحرف]]؛
    عملية هذا.هات_البروتوكول(): مؤشر[مصفوفة[مـحرف]]؛
    عملية هذا.هات_الامتدادات(): مؤشر[مصفوفة[مـحرف]]؛
    عملية هذا.هات_الكمية_المخزنة(): طـبيعي_متكيف؛
}
```

<div dir=ltr>

```
class WebSocket {
    def onOpen: Signal[WebSocket, Int];
    def onMessage: Signal[WebSocket, WsMessageInfo];
    def onError: Signal[WebSocket, Int];
    def onClose: Signal[WebSocket, WsCloseInfo];

    func create(url: ptr[Char], protocols: ptr[Char]): SrdRef[WebSocket];
    func create(url: ptr[Char]): SrdRef[WebSocket];

    handler this.sendText(data: ptr[Char]): ptr[array[Char]];
    handler this.sendBinary(data: ptr[Char], dataLen: ArchWord): ptr[array[Char]];

    handler this.close(): ptr[array[Char]];
    handler this.close(code: Int): ptr[array[Char]];
    handler this.close(code: Int, reason: ptr[Char]): ptr[array[Char]];

    handler this.getState(): Int;
    handler this.getUrl(): ptr[array[Char]];
    handler this.getProtocol(): ptr[array[Char]];
    handler this.getExtensions(): ptr[array[Char]];
    handler this.getBufferedAmount(): ArchWord;
}
```

</div>

#### إنشاء نموذج مـقبس_ويب

```
دالة أنشئ(الرابط: مؤشر[مـحرف]، البروتوكولات: مؤشر[مـحرف]): سـندنا[مـقبس_ويب]؛
دالة أنشئ(الرابط: مؤشر[مـحرف]): سـندنا[مـقبس_ويب]؛
```

<div dir=ltr>

```
func create(url: ptr[Char], protocols: ptr[Char]): SrdRef[WebSocket];
func create(url: ptr[Char]): SrdRef[WebSocket];
```

</div>

تحصل على نموذج باستدعاء `مـقبس_ويب.أنشئ(الرابط)` (`WebSocket.create(url)`) — أو
`مـقبس_ويب.أنشئ(الرابط، البروتوكولات)` (`WebSocket.create(url, protocols)`) لعرض بروتوكولات فرعية —
وهذه هي الطريقة *الوحيدة* للحصول على نموذج؛ لا يوجد بانٍ عمومي (constructor). تُرجع الدالة
`سـندنا[مـقبس_ويب]` (`SrdRef[WebSocket]`).

تحقق دائمًا مما إذا كان `سـندنا[مـقبس_ويب]` (`SrdRef[WebSocket]`) المُرجَع خاليًا عبر `أهو_عدم`
(`isNull`) قبل استخدامه. سيكون خاليًا إذا حدث خطأ ما أثناء إنشاء كائن `WebSocket` الأصلي في
المتصفح — رابط غير صالح، بروتوكول غير صحيح، بروتوكولات مشوهة، رابط يحتوي على جزء (fragment)، إلخ.

راجع [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket#exceptions) للاطلاع
على القائمة الكاملة لحالات الاستثناء.
هذا يحاكي الواجهة الحقيقية: إن رمى بانِي المتصفح استثناءً، فلن تحصل على كائن على الإطلاق، لذا فإن
هذه المكتبة لا تعطيك أبدًا نموذجًا معطوبًا هي الأخرى — تقوم `أنشئ` (`create`) ببناء الكائن، ومحاولة
الاتصال، ثم تحرّره مجددًا قبل الإرجاع إن فشلت تلك المحاولة بشكل متزامن.

```
عرف مقبس: سـندنا[مـقبس_ويب] = مـقبس_ويب.أنشئ("ws://localhost:8060/echo")؛
إذا مقبس.أهو_عدم() {
    // رابط أو بروتوكولات غير صالحة - لم يبدأ الاتصال
}
```

<div dir=ltr>

```
def ws: SrdRef[WebSocket] = WebSocket.create("ws://localhost:8060/echo");
if ws.isNull() {
    // bad URL/protocols - the connection never started
}
```

</div>

إرجاع `true`/`سـندنا` غير خالٍ من `أنشئ` (`create`) يعني فقط أن محاولة الاتصال قد بدأت — و هذا **لا**
يعني أن الاتصال أصبح مفتوحًا بعد. انتظر `عند_الفتح` (`onOpen`) لذلك.

### الأحداث

#### عند_الفتح (onOpen)

```
عرف عند_الفتح: إشـارة[مـقبس_ويب، صـحيح]؛
```

<div dir=ltr>

```
def onOpen: Signal[WebSocket, Int];
```

</div>

يُطلق بمجرد إنشاء الاتصال. الحمولة غير مستخدمة (`صـحيح`، دائما `0`).

راجع [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/open_event) لمعرفة متى يُطلق
هذا الحدث بالضبط.

#### عند_استلام_رسالة (onMessage)

```
عرف عند_استلام_رسالة: إشـارة[مـقبس_ويب، حـمولة_رسالة_مقبس]؛
```

<div dir=ltr>

```
def onMessage: Signal[WebSocket, WsMessageInfo];
```

</div>

يُطلق مرة واحدة لكل رسالة مستلمة. الحمولة هي `حـمولة_رسالة_مقبس` (`WsMessageInfo`)، وتحمل نوع الرسالة
(نصية أو ثنائية) وبياناتها:

```
صنف حـمولة_رسالة_مقبس {
    عرف البيانات: نـص؛
    عرف ثنائي: ثـنائي؛
}
```

<div dir=ltr>

```
class WsMessageInfo {
    def data: String;
    def isBinary: Bool;
}
```

</div>

* `البيانات` (`data`): محتوى الرسالة. للرسائل النصية، النص نفسه. للرسائل الثنائية، البايتات الخام
  مغلّفة داخل `نـص` (`String`).
* `ثنائي` (`isBinary`): `1` إن أُرسلت الرسالة كبيانات ثنائية، `0` إن أُرسلت كنص.

راجع [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event) لمعرفة متى يُطلق
هذا الحدث بالضبط.

#### عند_الخطأ (onError)

```
عرف عند_الخطأ: إشـارة[مـقبس_ويب، صـحيح]؛
```

<div dir=ltr>

```
def onError: Signal[WebSocket, Int];
```

</div>

يُطلق عند حدوث خطأ حقيقي على مستوى الاتصال. الحمولة غير مستخدمة (`صـحيح`، دائما `0`).

راجع [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event) لمعرفة متى يُطلق
هذا الحدث بالضبط.

#### عند_الإغلاق (onClose)

```
عرف عند_الإغلاق: إشـارة[مـقبس_ويب، حـمولة_إغلاق_مقبس]؛
```

<div dir=ltr>

```
def onClose: Signal[WebSocket, WsCloseInfo];
```

</div>

يُطلق بمجرد إغلاق الاتصال بشكل كامل، سواء بدأه الطرف المحلي أو الخادم. الحمولة هي `حـمولة_إغلاق_مقبس`
(`WsCloseInfo`):

```
صنف حـمولة_إغلاق_مقبس {
    عرف الرمز: صـحيح؛
    عرف السبب: نـص؛
    عرف نظيف: ثـنائي؛
}
```

<div dir=ltr>

```
class WsCloseInfo {
    def code: Int;
    def reason: String;
    def wasClean: Bool;
}
```

</div>

* `الرمز` (`code`): رمز إغلاق المقبس.
* `السبب` (`reason`): نص سبب الإغلاق، إن وُجد.
* `نظيف` (`wasClean`): فيما إذا اكتملت مصافحة الإغلاق بشكل نظيف.

راجع [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event) لمعرفة متى يُطلق
هذا الحدث بالضبط.

## دوال مـقبس_ويب

#### أرسل_نصا (sendText)

```
عملية هذا.أرسل_نصا(بيانات: مؤشر[مـحرف]): مؤشر[مصفوفة[مـحرف]]؛
```

<div dir=ltr>

```
handler this.sendText(data: ptr[Char]): ptr[array[Char]];
```

</div>

يُرسل رسالة نصية.

يُرجع مؤشرًا خاليًا إن لم يرمِ المتصفح استثناءً،
أو يُرجع مؤشرًا لرسالة الخطأ إن رُمي استثناء.

راجع [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send#exceptions) لمعرفة متى
يُرمى الاستثناء الأصلي بالضبط.

#### أرسل_ثنائيا (sendBinary)

```
عملية هذا.أرسل_ثنائيا(بيانات: مؤشر[مـحرف]، طول_البيانات: طـبيعي_متكيف): مؤشر[مصفوفة[مـحرف]]؛
```

<div dir=ltr>

```
handler this.sendBinary(data: ptr[Char], dataLen: ArchWord): ptr[array[Char]];
```

</div>

يُرسل `طول_البيانات` (`dataLen`) بايتات خامة بدءًا من `بيانات` (`data`). نفس صيغة الإرجاع المستخدمة
في `أرسل_نصا` (`sendText`).

## أغلق (close)

```
عملية هذا.أغلق(): مؤشر[مصفوفة[مـحرف]]؛
عملية هذا.أغلق(الرمز: صـحيح): مؤشر[مصفوفة[مـحرف]]؛
عملية هذا.أغلق(الرمز: صـحيح، السبب: مؤشر[مـحرف]): مؤشر[مصفوفة[مـحرف]]؛
```

<div dir=ltr>

```
handler this.close(): ptr[array[Char]];
handler this.close(code: Int): ptr[array[Char]];
handler this.close(code: Int, reason: ptr[Char]): ptr[array[Char]];
```

</div>

يُغلق الاتصال. الصيغة بلا معطيات تستخدم الرمز `1000` (إغلاق عادي) دون سبب؛ بينما تتيح لك الصيغتان
الأخريان تحديد رمز و/أو سبب.

يُرجع مؤشرًا خاليًا إن لم يرمِ المتصفح استثناءً،
أو يُرجع مؤشرًا لرسالة الخطأ إن رُمي استثناء.

راجع [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close#exceptions) لمعرفة متى
يُرمى الاستثناء الأصلي بالضبط.

## الحالة (state)

هذه الدوال تُرجع الخصائص الموجودة في [كائن WebSocket في المتصفح](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

تبقى جميعها تعمل بعد إغلاق الاتصال، تمامًا كما يفعل كائن `WebSocket` الحقيقي — إغلاق الاتصال لا يجعله
يتوقف عن كونه قابلاً للاستعلام. تتوقف عن الصلاحية فقط عند تدمير كائن `مـقبس_ويب` (`WebSocket`) نفسه.

#### هات_الحالة (getState)

```
عملية هذا.هات_الحالة(): صـحيح؛
```

<div dir=ltr>

```
handler this.getState(): Int;
```

</div>

يُرجع خاصية [readyState](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState) من
كائن WebSocket في المتصفح.

#### هات_الرابط (getUrl)

```
عملية هذا.هات_الرابط(): مؤشر[مصفوفة[مـحرف]]؛
```

<div dir=ltr>

```
handler this.getUrl(): ptr[array[Char]];
```

</div>

يُرجع خاصية [url](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/url) من كائن WebSocket
في المتصفح.

#### هات_البروتوكول (getProtocol)

```
عملية هذا.هات_البروتوكول(): مؤشر[مصفوفة[مـحرف]]؛
```

<div dir=ltr>

```
handler this.getProtocol(): ptr[array[Char]];
```

</div>

يُرجع خاصية [protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/protocol) من كائن
WebSocket في المتصفح.

#### هات_الامتدادات (getExtensions)

```
عملية هذا.هات_الامتدادات(): مؤشر[مصفوفة[مـحرف]]؛
```

<div dir=ltr>

```
handler this.getExtensions(): ptr[array[Char]];
```

</div>

يُرجع خاصية [extensions](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/extensions) من
كائن WebSocket في المتصفح.

#### هات_الكمية_المخزنة (getBufferedAmount)

```
عملية هذا.هات_الكمية_المخزنة(): طـبيعي_متكيف؛
```

<div dir=ltr>

```
handler this.getBufferedAmount(): ArchWord;
```

</div>

يُرجع خاصية [bufferedAmount](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/bufferedAmount)
من كائن WebSocket في المتصفح.

## دورة الحياة (lifetime)

لا توجد دالة صريحة لـ"قطع الاتصال والتحرير" — تدمير `سـندنا[مـقبس_ويب]` (`SrdRef[WebSocket]`) (سواء
بخروجه من النطاق، أو إعادة تعيينه، أو استدعاء `.release()` عليه) يُغلق الاتصال برمز الحالة `1000`
ويقوم بكل عمليات التنظيف تلقائيًا.

</div>
