---
order: 5
title:
  zh-CN: 附加提示信息
  en-US: Extra hint
---

## zh-CN

在组件右上角显示提示信息，如接受的文件类型等。

## en-US

Display hint on the top-right corner, such as acceptable types.

```jsx
import { Upload } from 'choerodon-ui/pro';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'https://www.mocky.io/v2/5e6887c22f00004d49d8ad29',
  multiple: true,
  accept: ['image/*'],
  uploadImmediately: false,
  extra: <p>请上传图片文件(jpg, jpeg, png...)</p>,
  onUploadSuccess: response => console.log(response),
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  mountNode,
);
```
