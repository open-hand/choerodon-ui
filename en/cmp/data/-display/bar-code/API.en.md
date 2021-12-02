---
title: API
---

| Property | Description | Type | optional | Default |
| --- | --- | --- | --- |
| value | Text | string |  |
| renderAs | Rendering method | 'canvas' \| 'svg' | canvas |
| size | QRCode size | number | 128 |
| bgColor | Background color | string | #FFFFFF |
| fgColor | Front color | string | #000000 |
| level | QRcode fault tolerance level | string  ('L' 'M' 'Q' 'H') | L |
| includeMargin | Does the QR code have margins | boolean | false |
| imageSettings | QR code picture settings | object | null |
| option | Barcode options[config](#option) | object | null |

### option

Used to set barcode parameters.

| Property | Description | Type | optional | Default |
| --- | --- | --- | --- |
| format | Barcode format type | string | auto (CODE128) |
| displayValue | Whether to display text | boolean | true |
| text | Text | string | |
| width | Width | number | 2 |
| height | Height | number | 100 |
| font | Font | string | monospace |
| textAlign | Text arrangement | string | center |
| textPosition | Text position | string | center |
| textMargin | Font spacing | number | 2 |
| fontSize | Font size | number | 20 |
| background | Background color（Priority is higher than bgColor）| string | #ffffff |
| lineColor | Line color（Priority is higher thanfgColor）| string | #000000 |
| margin | margin（Contains up, down, left, and right） | number | 10 |
| marginTop | Top margin | number | |
| marginRight | Right margin | number | |
| marginBottom | Bottom margin | number | |
| marginLeft | Left margin | number | |
