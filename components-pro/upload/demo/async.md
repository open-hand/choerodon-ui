---
order: 1
title:
  zh-CN: 点击按钮上传
  en-US: Click a button to upload
---

## zh-CN

选择文件后，点击按钮上传。

## en-US

Click a button to upload after selecting files.

```jsx
import { Upload, message } from 'choerodon-ui/pro';


const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  mountNode,
);
```
