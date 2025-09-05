---
title: API
---

> You can consult [jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload/wiki) about how to implement server side upload interface.

| Property            | Description                                                                                                                                                                          | Type                                                               | Default | Version |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------- | ------- |
| accept              | File types that can be accepted. See [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept)                                           | string                                                             | -       |
| action              | Required. Uploading URL                                                                                                                                                              | string                                                             | -       |
| beforeUpload        | Hook function which will be executed before uploading. Uploading will be stopped with `false` or a rejected Promise returned. **Warning：this function is not supported in IE9**。   | (file, fileList) => `boolean \| Promise`                            | -       |
| beforeUploadFiles(1.5.6)        | 上传文件 List 之前的钩子，若返回 `false` 则停止上传。支持返回一个 Promise 对象，Promise 对象 reject 时则停止上传，resolve 时开始上传。**注意：IE9 不支持该方法**。 | (fileList) => `boolean \| Promise`                            | 无     |
| customRequest       | override for the default xhr behavior allowing for additional customization and ability to implement your own XMLHttpRequest                                                         | Function                                                           | -       |
| data                | Uploading params or function which can return uploading params.                                                                                                                      | object\|function(file)                                             | -       |
| defaultFileList     | Default list of files that have been uploaded.                                                                                                                                       | object\[]                                                          | -       |
| dragUploadList | disable drag `picture-card` | boolean | false |
| disabled            | disable upload button                                                                                                                                                                | boolean                                                            | false   |
| fileList            | List of files that have been uploaded (controlled)                                                                                                                                   | object\[]                                                          | -       |
| headers             | Set request headers, valid above IE10.                                                                                                                                               | object                                                             | -       |
| listType            | Built-in stylesheets, support for three types: `text`, `picture` or `picture-card`                                                                                                   | string                                                             | 'text'  |
| multiple            | Whether to support selected multiple file. `IE10+` supported. You can select multiple files with CTRL holding down while multiple is set to be true                                  | boolean                                                            | true   |
| name                | The name of uploading file                                                                                                                                                           | string                                                             | 'file'  |
| showUploadList | Whether to show default upload list, it is used to set whether to display preview button, remove button, download button, re-upload button, etc | boolean \| [ShowUploadListInterface](#showuploadlistinterface) | true |
| supportServerRender | Need to be turned on while the server side is rendering.                                                                                                                             | boolean                                                            | false   |
| withCredentials     | ajax upload with cookie sent                                                                                                                                                         | boolean                                                            | false   |
| onChange            | A callback function, can be executed when uploading state is changing. See [onChange](#onchange)                                                                                     | Function                                                           | -       |
| onPreview           | A callback function, will be executed when file link or preview icon is clicked.                                                                                                     | Function(file)                                                     | -       |
| onRemove            | A callback function, will be executed when removing file button is clicked, remove event will be prevented when return value is `false` or a Promise which resolve(false) or reject. | Function(file): `boolean \| Promise`                                | -       |
| onSuccess           | A callback function, will be executed when upload success.                                                                                                                           | Function(response, file)                                           | 无      |
| onProgress          | A callback function, will be executed when upload in progress.                                                                                                                       | Function({ percent }, file)                                        | 无      |
| onError             | A callback function, will be executed when upload error.                                                                                                                             | Function(error, response, file)                                    | 无      |
| onDragEnd   | A callback function, will drag `picture-card`   | Function(fileList) | -   |
| requestFileKeys   | can upload the file props to the server   | string,string[] | 无   |
| showFileSize`(1.5.0-beta.0)` | Whether file sizes are displayed when `listType` is `text`   | boolean | false |
| onStart | File upload starts   | (file: UploadFile) => void |  |
| onReUpload | File re-upload implementation   | (file: UploadFile) => void \| boolean |  |
| renderIcon | Render ICONS in file list   | (file: UploadFile, listType: UploadListType, prefixCls?: string) => ReactElement |  |
| popconfirmProps | Delete and re-upload confirm dialog box properties   | PopconfirmProps |  |
| pictureCardShowName | 设置 `picture-card` 类型图片是否显示文件名 | boolean |  | 1.6.5 |


### ShowUploadListInterface
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| showRemoveIcon | 是否显示删除按钮  | boolean\| ((file: UploadFile) => boolean) | true |
| showPreviewIcon | 是否显示预览按钮，当非图片类型文件需要显示预览按钮时可以通过回调函数写法实现 | boolean \| ((file: UploadFile) => boolean) | picture-card 模式下为 true，其他模式下为 false |
| showDownloadIcon | 是否显示下载按钮   | boolean \| ((file: UploadFile) => boolean) | picture-card 模式下为 true，其他模式下为 false |
| showReUploadIcon | 是否显示重新上传按钮（上传成功状态则重新选择文件上传，上传失败状态则重新上传该文件；当 listType 为 picture-card: true 为 icon, text 为文字形式; 其他 listType 都为文字形式）   | boolean \| 'text' \| ((file: UploadFile, listType: UploadListType) => (boolean \| 'text')) | [uploadShowReUploadIcon](/en/procmp/configure/configure) |
| removePopConfirmTitle | 删除弹框确认信息   | string |  |
| reUploadText | 重新上传按钮 title 信息   | string |  |
| reUploadPopConfirmTitle | 重新上传弹框确认信息   | string |  |
| getCustomFilenameTitle | 文件名 title 信息   | (file: UploadFile) => string | 文件名 |

### onChange

> The function will be called when uploading is in progress, completed or failed

When uploading state change, it returns:

```js
{
  file: { /* ... */ },
  fileList: [ /* ... */ ],
  event: { /* ... */ },
}
```

1. `file` File object for the current operation.

   ```js
   {
      uid: 'uid',      // unique identifier，negative is recommend，to prevent interference with internal generated id
      name: 'xx.png'   // file name
      status: 'done', // options：uploading, done, error, removed
      response: '{"status": "success"}', // response from server
      linkProps: '{"download": "image"}', // additional html props of file link
   }
   ```

2. `fileList` current list of files
3. `event` response from server, including uploading progress, supported by advanced browsers.

## show download links

Please set property `url` of property `fileList` to control content of link

## customRequest

- <https://github.com/react-component/upload#customrequest>

## IE note

- <https://github.com/react-component/upload#ie89-note>
