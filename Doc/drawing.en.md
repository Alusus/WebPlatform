# WebPlatform

[[عربي]](drawing.ar.md)

[[Back]](../readme.md)

## Drawing

A mixin that provides drawing operations to canvas classes.

#### drawLine

```
handler this.drawLine(x1: Int, y1: Int, x2: Int, y2: Int);
```

Draws a line between two points.

#### drawPolygon

```
handler this.drawPolygon(pointCount: Int, points: ref[array[Int]], filled: Bool);
```

Draws a polygon.

parameters:

* `pointCount`: the number of polygon's points.
* `points`: polygon's points.
* `filled`: is the polygon filled or empty.

#### drawFilledRect

```
handler this.drawFilledRect(x: Int, y: Int, w: Int, h: Int);
```

Draws a filled rectangle.

#### clearRect

```
handler this.clearRect(x: Int, y: Int, w: Int, h: Int);
```

Clears the area in the given rectangular area.

#### drawCircle

```
handler this.drawCircle(x: Int, y: Int, r: Int);
```

Draws a circle.

#### drawText

```
handler this.drawText(text: ptr[Char], font: ptr[Char], x: Int, y: Int);
handler this.drawText(text: ptr[Char], font: ptr[Char], x: Int, y: Int, rtl: Bool);
```

Draws the provided text.

parameters:

* `text`: The text we want to draw.
* `font`: The font of the text.
* `x`, `y`: Text's coordinates.
* `rtl`: Whether to draw the tex from right to left or left to right.

#### measureText

```
handler this.measureText(text: ptr[Char], font: ptr[Char]): Dimensions;
```

Measures the dimensions of the given text based on the given font.

#### setDirection

```
handler this.setDirection(dir: ptr[Char]);
```

Sets the default text direction for this canvas.

#### setFillStyle

```
handler this.setFillStyle(c1:ptr[Char], c2:ptr[Char], x1: Int, y1: Int, x2: Int, y2: Int);
```

Specify the gradient fill pattern between the given two colors. The gradient starts with the first
color at the first point and ends with the second color at the second point, following the
direction of the line connecting the two points.

#### setStrokeStyle

```
handler this.setStrokeStyle(ss: ptr[Char]);
```

Sets the stroke style used for drawing.

#### setLineWidth

```
handler this.setLineWidth(lw: Int);
```

Sets the stroke width used for drawing.

#### drawImage

```
handler this.drawImage(img: ref[ImageResource], x: Int, y: Int, w: Int, h: Int, alpha: Float);
```

```
handler this.drawImage(
    img: ref[ImageResource], x: Int, y: Int, w: Int, h: Int, alpha: Float, smoothing: Bool
);
```

Draws the given image, stretching it to fit the provided position and dimension. Applies the given
alpha to the image. If the image has an alpha channel it will be blended with the provided alpha
value. 

parameters:

* `img` a reference to the image we want to draw.

* `x`، `y`، `w`، `h` rectangle coordinates of the rectangle we want to draw the image inside, its width and height.

* `alpha` image transparency.

* `smoothing` specifies the scaling algorithm. A value of 1 means the scaling will be done using interpolation
between near pixels whereas a value of 0 specifies nearst pixel scaling algorithm. The version version of this
function assumes a value of 1 for this param.

#### clear

```
handler this.clear();
```

Clears the entire canvas.

