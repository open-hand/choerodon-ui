---
order: 3
title:
  zh-CN: 自定义响应处理方法
  en-US: Customize The Response Handler
---

## zh-CN

可以自定义上传请求得到响应后的处理方式，包括成功和失败。这将覆盖默认的处理行为。

## en-US

Customize the response handler, including success and failure. This will override the default handlers.

```jsx
import { Upload, message } from 'choerodon-ui/pro';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'https://www.mocky.io/v2/5e6887c22f00004d49d8ad29',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
  onUploadSuccess: response => message.success(response),
  onUploadError: (error, response, file) => console.log(error, response, file),
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  mountNode,
);
```
