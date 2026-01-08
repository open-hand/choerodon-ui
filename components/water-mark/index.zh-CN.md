---
category: Components
cols: 1
type: Layout
title: WaterMark
subtitle: 水印组件
---

水印组件

## 何时使用

一种数字保护的手段，需要能证明本人或者公司的产品版权即可在指定容器上添加水印。

## API

 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| width | 水印的宽度 | number | 120 |
| height | 水印的高度 | number | 64 |
| rotate | 水印绘制时，旋转的角度，单位 ° | number | -22 |
| image | 图片源，建议导出 2 倍或 3 倍图，优先使用图片渲染水印 | string | - |
| zIndex | 追加的水印元素的 z-index | number | 9 |
| content | 水印文字内容，支持 \n 换行 | string | - |
| markStyle | 水印文字样式 | { color: string; fontStyle: `none` \| `normal` \| `italic` \| `oblique`; fontFamily: string; fontWeight:  `normal` \| `light` \| `weight` \| number; fontSize: size \| number; opacity: number; } | { color: 'rgba(0,0,0,.15)', fontStyle: 'normal', fontWeight: 'normal', fontSize: 16, fontFamily: 'sans-serif', opacity: 0.8 } |
| markClassName | 水印层的类名 | string | - |
| gapX | 水印之间的水平间距 | number | 212 |
| gapY | 水印之间的垂直间距 | number | 222 |
| offsetLeft | 水印在 canvas 画布上绘制的水平偏移量, 正常情况下，水印绘制在中间位置, 即 `offsetTop = gapX / 2` | number | `offsetTop = gapX / 2` |
| offsetTop | 水印在 canvas 画布上绘制的垂直偏移量，正常情况下，水印绘制在中间位置, 即 `offsetTop = gapY / 2` | number | `offsetTop = gapY / 2` |
| enable | 是否启用 | boolean | true |
| removeable | 是否可移除，设置为 true 则可以通过浏览器控制台对水印 Dom 节点进行删除或者样式属性进行修改 | boolean | false |
