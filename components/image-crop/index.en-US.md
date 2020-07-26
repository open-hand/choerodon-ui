---
type: Data Entry
category: Components
cols: 1
title: ImageCrop
---

crop the image.

## When To Use

crop the image.

## API

| Property | Description | Type | Default |
| Prop        | Type                 | Default        | Description                                                 |
| ----------- | -------------------- | -------------- | ----------------------------------------------------------- |
| aspect      | Aspect of crop area , `width / height`                      | `number`             | `1 / 1`        | 
| shape       | Shape of crop area, `'rect'` or `'round'`                   | `string`             | `'rect'`       |
| grid        | Show grid of crop area (third-lines)                        | `boolean`            | `false`        |
| zoom        | Enable zoom for image                                       | `boolean`            | `true`         |
| rotate      | Enable rotate for image                                     | `boolean`            | `false`        |
| beforeCrop  | Called before modal open, if return `false`, it'll not open | `(file: UploadFile, uploadFiles: UploadFile[]) => boolean`           | -              |
| modalTitle  | Title of modal                                              | `string`             | `'Edit image'` |
| modalWidth  | Width of modal in pixels or percentages                     | `number` \| `string` | `800`          |
| modalOk     | Text of confirm button of modal                             | `string`             | `'OK'`         |
| modalCancel | Text of cancel button of modal                              | `string`             | `'Cancel'`     |
| onCancel   | Called modal cancel | `onCancel?: () => void `         | -              |
| onOk  | Called modal cancel | `{ url: string, blob: Blob,area:Area }=> void`         | -              |
| avatarTitle   |  avatar title | `string`         | -              |
| modalVisible   |  control the modal visibility | `boolean`         | `ture`              |
| hasAvatar   | can preview avatar | `boolean`         | `false`           |
| serverCrop   | when use upload the crop info to server and naturl image blob | `boolean`         | `false`           |


