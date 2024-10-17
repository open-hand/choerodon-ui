---
title: API
---


| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 文本字符串 | string |  |
| renderAs | 渲染方式 | 'canvas' \| 'svg' | canvas |
| size | 二维码大小 | number | 128 |
| bgColor | 背景色 | string | #FFFFFF |
| fgColor | 前景色 | string | #000000 |
| level | 二维码容错等级 | string 可选值 ('L' 'M' 'Q' 'H') | L |
| includeMargin | 二维码是否有外边距 | boolean | false |
| imageSettings | 二维码图片设置 | object | |
| option | 条形码选项,参考[option](#option) | object | |

### option

用于设置条形码参数。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| format | 条形码格式类型 | string | auto (CODE128) |
| displayValue | 是否显示文本 | boolean | true |
| text | 显示文本 | string | |
| width | 宽度 | number | 2 |
| height | 高度 | number | 100 |
| font | 字体 | string | monospace |
| textAlign | 文本排列方式 | string | center |
| textPosition | 文本位置 | string | bottom |
| textMargin | 字体间距 | number | 2 |
| fontSize | 字体大小 | number | 20 |
| background | 背景颜色（优先级高于bgColor）| string | #ffffff |
| lineColor | 线条颜色（颜色高于fgColor）| string | #000000 |
| margin | 边距（包含上下左右） | number | 10 |
| marginTop | 上边距 | number | |
| marginRight | 右边距 | number | |
| marginBottom | 下边距 | number | |
| marginLeft | 左边距 | number | |
