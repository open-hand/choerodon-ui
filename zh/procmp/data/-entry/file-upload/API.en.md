---
title: API
---

### Upload 属性说明如下：

| 属性              | 说明                                                                                                                                                                           | 类型                                                      | 默认值          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | --------------- |
| accept            | 接受上传的文件类型 [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept)                                                       | string[]                                                    |                 |
| action            | 上传的地址                                                                                                                                                                     | string                                                    | ''            |
| data              | 上传所需参数或返回上传参数的方法                                                                                                                                               | object\|fucntion(file)                                    |                 |
| headers           | 设置上传的请求头部，IE10 以上有效                                                                                                                                              | object                                                  |                 |
| multiple          | 是否支持多选，IE10 以上有效                                                                                                                                                    | boolean                                                 | false         |
| name              | input元素的 name 字段                                                                                                                                                      | string                                                    | 'file'        |
| uploadImmediately | 是否选择文件后立即上传（若为否，组件自身会提供上传按钮）                                                                                                                       | boolean                                                 | true          |
| fileListMaxLength | 同时上传文件的最大数量                                                                                                                                                         | number                                                  | 0，表示无限制 |
| defaultFileList   | 默认显示的文件列表                                                                                                                                                             | object[]                                                | -               |
| uploadFileList    | 显示设定的文件列表（可控）                                                                                                                                                     | object[]                                                | -               |
| withCredentials   | 上传请求时是否携带 cookie                                                                                                                                                      | boolean                                                 | false         |
| appendUpload      | 是否以追加形式添加文件至列表中                                                                                                                                                 | boolean                                                 | false         |
| partialUpload     | 只上传文件状态不是success的文件                                                                                                                                              | boolean                                                 | true          |
| beforeUpload      | 上传文件之前的钩子，参数为上传的文件，可对文件在上传之前进行校验操作若返回 false 则停止上传。支持返回一个 Promise 对象，Promise 对象 reject 时则停止上传，resolve 时开始上传。 | (file, fileList) => boolean | Promise                   | -               |
| showPreviewImage  | 是否显示图片预览                                                                                                                                                               | boolean                                                 | true          |
| showUploadBtn     | 是否显示上传按钮                                                                                                                                                               | boolean                                                 | true          |
| showUploadList    | 是否显示上传列表                                                                                                                                                               | boolean                                                 | true          |
| previewImageWidth | 预览图片 Img 元素的宽度                                                                                                                                                        | number                                                  | 100           |
| previewImageRenderer(1.6.5) | 自定义预览图片 | `(file: UploadFile) => React.ReactNode` |  |
| onFileChange      | input 元素内部文件变化的回调                                                                                                                                                   | (fileList: UploadFile[]) => void                        | 无              |
| onUploadProgress  | 上传进度变化的回调                                                                                                                                                             | (percent: number, file: UploadFile) => void             | 无              |
| onUploadSuccess   | 上传成功的回调                                                                                                                                                                 | (response: any, file: UploadFile) => void               | 无              |
| onUploadError     | 上传出错的回调                                                                                                                                                                 | (error: Error, response: any, file: UploadFile) => void | 无              |

更多属性请参考 [ViewComponent](/zh/procmp/abstract/ViewComponent)。

### UploadFile 类型接口：

```ts
export interface UploadFile {
  uid: string;
  size: number;
  name: string;
  filename?: string;
  lastModified?: string;
  lastModifiedDate?: Date;
  url?: string;
  status?: 'error' | 'success' | 'uploading' | 'done';
  percent?: number;
  thumbUrl?: string;
  originFileObj?: File;
  response?: any;
  error?: any;
  linkProps?: any;
  type: string;
  msClose?: boolean;
}
```
