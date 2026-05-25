---
title: API
---

### Upload

| Property | Description | Type | Default |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | --------------- |
| accept | Accepted file types [input accept Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) | string[] |  |
| action | Upload URL | string | '' |
| data | Parameters required for upload or a method that returns upload parameters | object\|fucntion(file) |  |
| headers | Set request headers for upload; valid for IE10 and above | object |  |
| multiple | Whether to support multiple selection; valid for IE10 and above | boolean | false |
| name | Name field of the input element | string | 'file' |
| uploadImmediately | Whether to upload immediately after selecting files (if false, the component provides an upload button) | boolean | true |
| fileListMaxLength | Maximum number of files uploaded at the same time | number | 0, means unlimited |
| defaultFileList | Default displayed file list | object[] | - |
| uploadFileList | Display the specified file list (controlled) | object[] | - |
| withCredentials | Whether to carry cookies in upload requests | boolean | false |
| appendUpload | Add files to the list in append mode | boolean | false |
| partialUpload | Upload only files whose status is not success | boolean | true |
| beforeUpload | Hook before uploading files. Validate files before upload; returning false stops upload. Supports returning a Promise; when the Promise rejects, upload stops; when it resolves, upload starts. | (file, fileList) => boolean \| Promise | - |
| showPreviewImage | Whether to display image preview | boolean | true |
| showUploadBtn | Whether to display the upload button | boolean | true |
| showUploadList | Whether to display the upload list | boolean | true |
| previewImageWidth | Width of the preview image element (Img) | number | 100 |
| previewImageRenderer(1.6.5) | Custom preview image | `(file: UploadFile) => React.ReactNode` |  |
| onFileChange | Callback for file changes inside the input element | (fileList: UploadFile[]) => void |  |
| onUploadProgress | Callback for upload progress changes | (percent: number, file: UploadFile) => void |  |
| onUploadSuccess | Callback for successful upload | (response: any, file: UploadFile) => void |  |
| onUploadError | Callback for upload errors | (error: Error, response: any, file: UploadFile) => void |  |

For more properties, please refer to [ViewComponent](/en/procmp/abstract/ViewComponent).

### UploadFile Type Interface:

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
