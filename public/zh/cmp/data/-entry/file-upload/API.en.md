---
title: API
---

> You can consult [jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload/wiki) about how to implement server side upload interface.

| Property            | Description                                                                                                                                                                          | Type                                                               | Default |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------- |
| accept              | File types that can be accepted. See [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept)                                           | string                                                             | -       |
| action              | Required. Uploading URL                                                                                                                                                              | string                                                             | -       |
| beforeUpload        | Hook function which will be executed before uploading. Uploading will be stopped with `false` or a rejected Promise returned. **Warning：this function is not supported in IE9**。   | (file, fileList) => `boolean | Promise`                            | -       |
| customRequest       | override for the default xhr behavior allowing for additional customization and ability to implement your own XMLHttpRequest                                                         | Function                                                           | -       |
| data                | Uploading params or function which can return uploading params.                                                                                                                      | object\|function(file)                                             | -       |
| defaultFileList     | Default list of files that have been uploaded.                                                                                                                                       | object\[]                                                          | -       |
| disabled            | disable upload button                                                                                                                                                                | boolean                                                            | false   |
| fileList            | List of files that have been uploaded (controlled)                                                                                                                                   | object\[]                                                          | -       |
| headers             | Set request headers, valid above IE10.                                                                                                                                               | object                                                             | -       |
| listType            | Built-in stylesheets, support for three types: `text`, `picture` or `picture-card`                                                                                                   | string                                                             | 'text'  |
| multiple            | Whether to support selected multiple file. `IE10+` supported. You can select multiple files with CTRL holding down while multiple is set to be true                                  | boolean                                                            | false   |
| name                | The name of uploading file                                                                                                                                                           | string                                                             | 'file'  |
| showUploadList      | Whether to show default upload list, could be an object to specify `showPreviewIcon` and `showRemoveIcon` individually                                                               | Boolean or { showPreviewIcon?: boolean, showRemoveIcon?: boolean } | true    |
| supportServerRender | Need to be turned on while the server side is rendering.                                                                                                                             | boolean                                                            | false   |
| withCredentials     | ajax upload with cookie sent                                                                                                                                                         | boolean                                                            | false   |
| onChange            | A callback function, can be executed when uploading state is changing. See [onChange](#onChange)                                                                                     | Function                                                           | -       |
| onPreview           | A callback function, will be executed when file link or preview icon is clicked.                                                                                                     | Function(file)                                                     | -       |
| onRemove            | A callback function, will be executed when removing file button is clicked, remove event will be prevented when return value is `false` or a Promise which resolve(false) or reject. | Function(file): `boolean | Promise`                                | -       |
| onSuccess           | A callback function, will be executed when upload success.                                                                                                                           | Function(response, file)                                           | 无      |
| onProgress          | A callback function, will be executed when upload in progress.                                                                                                                       | Function({ percent }, file)                                        | 无      |
| onError             | A callback function, will be executed when upload error.                                                                                                                             | Function(error, response, file)                                    | 无      |

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
