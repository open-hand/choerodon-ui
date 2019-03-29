---
order: 4
title:
  zh-CN: 附加额外数据
  en-US: Append Extra Data
---

## zh-CN

为一个文件上传请求追加一个`FormData`实例。
请查看开发者工具中的Network标签。

## en-US

Append an extra `FormData` instance to a file upload request.
Please checkout the 'Network' tab in the developer tool.

````jsx
import { Upload } from 'choerodon-ui/pro';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: '//localhost:3000/upload',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
  data: {
    key1: 'value1',
    key2: 'value2',
  },
  onUploadSuccess: response => console.log(response),
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  mountNode
);

````
