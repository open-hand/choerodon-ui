---
type: Data Entry
category: Components
cols: 1
title: ImageCrop
subtitle: 图片裁剪
---

裁剪图片

## 何时使用

裁剪图片

## API

| 参数 | 说明 | 类型 | 默认值 |
| ----------- | -------------------- | ------------ | ---------------------------------------------- |
| aspect      | 裁切区域宽高比，`width / height`               | `number`             | `1 / 1`      |
| shape       | 裁切区域形状，`'rect'` 或 `'round'`            | `string`             | `'rect'`     |
| grid        | 显示裁切区域网格（九宫格）                     | `boolean`            | `false`      |
| zoom        | 启用图片缩放                                   | `boolean`            | `true`       |
| rotate      | 启用图片旋转                                   | `boolean`            | `false`      |
| beforeCrop  | 弹窗打开前调用，若返回 `false`，弹框将不会打开 | `function`           | -            |
| modalTitle  | 弹窗标题                                       | `string`             | `'编辑图片'` |
| modalWidth  | 弹窗宽度，像素值或百分比                       | `number` \| `string` | `520`        |
| modalOk     | 弹窗确定按钮文字                               | `string`             | `'确定'`     |
| modalCancel | 弹窗取消按钮文字                               | `string`             | `'取消'`     |
| onCancel   | 取消模态框触发 | `onCancel?: () => void `         | -              |
| onOk  | 点击模态框确定触发 | `{ url: string, blob: Blob,area:Area }=> void`         | -              |
| avatarTitle   |  头像标题 | `string`         | -              |
| modalVisible   |  控制模态框的展示 | `boolean`         | `ture`              |
| hasAvatar   | 是否可以浏览头像截图效果 | `boolean`         | `false`           |
| serverCrop   | 服务端裁剪 | `boolean`         | `false`           |

