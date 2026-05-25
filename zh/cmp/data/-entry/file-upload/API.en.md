---
title: API
---

> You can consult [jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload/wiki) about how to implement server side upload interface.

| Property            | Description                                                                                                                                                                          | Type                                                               | Default | Version |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------- | ------- |
| accept              | File types that can be accepted. See [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept)                                           | string                                                             | -       |
| action              | Required. Uploading URL                                                                                                                                                              | string                                                             | -       |
| beforeUpload        | Hook function which will be executed before uploading. Uploading will be stopped with `false` or a rejected Promise returned. **Warning：this function is not supported in IE9**。   | (file, fileList) => `boolean \| Promise`                            | -       |
| beforeUploadFiles(1.5.6)        | A hook before uploading the file list. If it returns `false`, the upload is stopped. Returning a Promise object is also supported; if the Promise is rejected, the upload stops, and if it is resolved, the upload begins.**Note: IE9 does not support this method**. | (fileList) => `boolean \| Promise`                            | -     |
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
| onSuccess           | A callback function, will be executed when upload success.                                                                                                                           | Function(response, file)                                           | -      |
| onProgress          | A callback function, will be executed when upload in progress.                                                                                                                       | Function({ percent }, file)                                        | -      |
| onError             | A callback function, will be executed when upload error.                                                                                                                             | Function(error, response, file)                                    | -      |
| onDragEnd   | A callback function, will drag `picture-card`   | Function(fileList) | -   |
| requestFileKeys   | can upload the file props to the server   | string,string[] | -   |
| showFileSize`(1.5.0-beta.0)` | Whether file sizes are displayed when `listType` is `text`   | boolean | false |
| onStart | File upload starts   | (file: UploadFile) => void |  |
| onReUpload | File re-upload implementation   | (file: UploadFile) => void \| boolean |  |
| renderIcon | Render ICONS in file list   | (file: UploadFile, listType: UploadListType, prefixCls?: string) => ReactElement |  |
| popconfirmProps | Delete and re-upload confirm dialog box properties   | PopconfirmProps |  |
| pictureCardShowName | Set whether the `picture-card` type image displays the file name | boolean |  | 1.6.5 |


### ShowUploadListInterface
| Property | Description | Type | Default |
| --- | --- | --- | --- |
| showRemoveIcon | Whether the delete button is displayed | boolean\| ((file: UploadFile) => boolean) | true |
| showPreviewIcon | Whether to display the preview button can be achieved by writing the callback function when the preview button needs to be displayed for non-image type files boolean \| ((file: UploadFile) => boolean) | True in picture-card mode and false | in other modes
| showDownloadIcon | Whether the download button is displayed | boolean \| ((file: UploadFile) => boolean) | True in picture-card mode and false | in other modes
| showReUploadIcon | Whether the re-upload button is displayed (if the upload is successful, the file is re-uploaded, and if the upload is failed, the file is re-uploaded; When listType is picture-card: true is icon, text is text; All other listTypes are in text) | boolean \| 'text' \| ((file: UploadFile, listType: UploadListType) => (boolean \| 'text')) | [uploadShowReUploadIcon] (/en/procmp/configure/configure) |
| removePopConfirmTitle | Delete pop-up confirmation | string |  |
| reUploadText | Re-upload button title info | string |  |
| reUploadPopConfirmTitle | Re-upload pop-up confirmation | string |  |
| getCustomFilenameTitle | filename title info | (file: UploadFile) => string | File name |

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
