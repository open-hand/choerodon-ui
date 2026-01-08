---
category: Components
cols: 1
type: Layout
title: WaterMark
---

WaterMark

## 何时使用

A means of digital protection. A watermark can be added to a specified container if it can prove the product copyright of itself or the company.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| width | Width of watermark | number | 120 |
| height | Height of watermark | number | 64 |
| rotate | Rotation angle when drawing watermark, unit °| number | -22 |
| image | Image source, it is recommended to export 2x or 3x images, and the image rendering watermark is preferred | string | - |
| zIndex | Z-index of the appended watermark element | number | 9 |
| content | Watermark text content, supports using \n for line breaks | string | - |
| markStyle | Watermark text style | { color: string; fontStyle: `none` \| `normal` \| `italic` \| `oblique`; fontFamily: string; fontWeight:  `normal` \| `light` \| `weight` \| number; fontSize: size \| number; opacity: number; } | { color: 'rgba(0,0,0,.15)', fontStyle: 'normal', fontWeight: 'normal', fontSize: 16, fontFamily: 'sans-serif', opacity: 0.8 } |
| markClassName | Class name of watermark layer | string | - |
| gapX | Horizontal spacing between watermarks | number | 212 |
| gapY | Vertical spacing between watermarks | number | 222 |
| offsetLeft | The horizontal offset of the watermark drawn on the canvas. Normally, the watermark is drawn in the middle,  `offsetTop = gapX / 2` | number | `offsetTop = gapX / 2` |
| offsetTop | The vertical offset of the watermark drawn on the canvas. Normally, the watermark is drawn in the middle,  `offsetTop = gapY / 2` | number | `offsetTop = gapY / 2` |
| enable | Enable or not | boolean | true |
| removeable | Whether it can be removed. If it is set to true, the watermark DOM node can be deleted or the style attribute can be modified through the browser console | boolean | false |
