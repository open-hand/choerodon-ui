---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

文件上传。

## en-US

File Upload.

```jsx
import { Upload } from 'choerodon-ui/pro';
import { actionUrl } from './actionUrl';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: actionUrl,
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: true,
  showUploadList: false,
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  mountNode,
);
```
