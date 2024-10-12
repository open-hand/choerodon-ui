---
category: Components
subtitle: 上传
type: Data Entry
title: Upload
---

文件选择上传和拖拽上传控件。

## 何时使用

上传是将信息（网页、文字、图片、视频等）通过网页或者上传工具发布到远程服务器上的过程。

- 当需要上传一个或一些文件时。
- 当需要展现上传的进度时。
- 当需要使用拖拽交互时。

## API

> 服务端上传接口实现可以参考 [jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload/wiki)。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| accept | 接受上传的文件类型, 详见 [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) | string | 无 |
| action | 必选参数, 上传的地址 | string | 无 |
| beforeUpload | 上传文件之前的钩子，参数为上传的文件，若返回 `false` 则停止上传。支持返回一个 Promise 对象，Promise 对象 reject 时则停止上传，resolve 时开始上传。**注意：IE9 不支持该方法**。 | (file, fileList) => `boolean | Promise` | 无 |
| customRequest | 通过覆盖默认的上传行为，可以自定义自己的上传实现 | Function | 无 |
| data | 上传所需参数或返回上传参数的方法 | object\|function(file) | 无 |
| defaultFileList | 默认已经上传的文件列表 | object\[] | 无 |
| dragUploadList | 是否开启拖拽`picture-card` | boolean | false |
| disabled | 是否禁用 | boolean | false |
| fileList | 已经上传的文件列表（受控） | object\[] | 无 |
| headers | 设置上传的请求头部，IE10 以上有效 | object | 无 |
| listType | 上传列表的内建样式，支持三种基本样式 `text`, `picture` 和 `picture-card` | string | 'text' |
| multiple | 是否支持多选文件，`ie10+` 支持。开启后按住 ctrl 可选择多个文件。 | boolean | true |
| name | 发到后台的文件参数名 | string | 'file' |
| showUploadList | 是否展示 uploadList, 可设为一个对象，用于单独设定是否显示 预览按钮、移除按钮、下载按钮、重新上传按钮 等 | boolean \| [ShowUploadListInterface](#ShowUploadListInterface) | true |
| supportServerRender | 服务端渲染时需要打开这个 | boolean | false |
| withCredentials | 上传请求时是否携带 cookie | boolean | false |
| onChange | 上传文件改变时的状态，详见 [onChange](#onChange) | Function | 无 |
| onPreview | 点击文件链接或预览图标时的回调 | Function(file) | 无 |
| onRemove   | 点击移除文件时的回调，返回值为 false 时不移除。支持返回一个 Promise 对象，Promise 对象 resolve(false) 或 reject 时不移除。               | Function(file): `boolean | Promise` | 无   |
| onSuccess   | 上传成功事件   | Function(response, file) | 无   |
| onProgress   | 上传进度中事件   | Function({ percent }, file) | 无   |
| onError   | 上传失败事件   | Function(error, response, file) | 无   |
| onDragEnd   | 拖拽`picture-card`事件   | Function(fileList) | 无   |
| requestFileKeys   | 可以传输文件上面的一些props信息给后台   | string,string[] | 无   |
| showFileSize | `listType`为`text`时是否显示文件大小   | boolean | false |
| onStart | 文件上传开始时   | (file: UploadFile) => void |  |
| onReUpload | 文件重新上传的实现   | (file: UploadFile) => void |  |
| renderIcon | 文件列表中渲染图标   | (file: UploadFile, listType: UploadListType, prefixCls?: string) => ReactElement |  |
| popconfirmProps | 删除和重新上传确认弹框的属性   | PopconfirmProps |  |
| pictureCardShowName | 设置 `picture-card` 类型图片是否显示文件名 | boolean |  |


### ShowUploadListInterface
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| showRemoveIcon | 是否显示删除按钮  | boolean\| ((file: UploadFile) => boolean) | true |
| showPreviewIcon | 是否显示预览按钮   | boolean \| ((file: UploadFile) => boolean) | picture-card 模式下为 true，其他模式下为 false |
| showDownloadIcon | 是否显示下载按钮   | boolean \| ((file: UploadFile) => boolean) | picture-card 模式下为 true，其他模式下为 false |
| showReUploadIcon | 是否显示重新上传按钮（当 listType 为 picture-card: true 为 icon, text 为文字形式; 其他 listType 都为文字形式）   | boolean \| 'text' \| ((file: UploadFile, listType: UploadListType) => (boolean \| 'text')) | [uploadShowReUploadIcon](/components/configure) |
| removePopConfirmTitle | 删除弹框确认信息   | string |  |
| reUploadText | 重新上传按钮 title 信息   | string |  |
| reUploadPopConfirmTitle | 重新上传弹框确认信息   | string |  |
| getCustomFilenameTitle | 文件名 title 信息   | (file: UploadFile) => string | 文件名 |

### onChange

> 上传中、完成、失败都会调用这个函数。

文件状态改变的回调，返回为：

```js
{
  file: { /* ... */ },
  fileList: [ /* ... */ ],
  event: { /* ... */ },
}
```

1. `file` 当前操作的文件对象。

   ```js
   {
      uid: 'uid',      // 文件唯一标识，建议设置为负数，防止和内部产生的 id 冲突
      name: 'xx.png'   // 文件名
      status: 'done', // 状态有：uploading done error removed
      response: '{"status": "success"}', // 服务端响应内容
      linkProps: '{"download": "image"}', // 下载链接额外的 HTML 属性
   }
   ```

2. `fileList` 当前的文件列表。
3. `event` 上传中的服务端响应内容，包含了上传进度等信息，高级浏览器支持。

## 显示下载链接

请使用 fileList 属性设置数组项的 url 属性进行展示控制。

## customRequest

- <https://github.com/react-component/upload#customrequest>

## IE note

- <https://github.com/react-component/upload#ie89-note>
