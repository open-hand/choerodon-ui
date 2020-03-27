---
order: 4
title:
  zh-CN: 数量限制
  en-US: Count Constraint
---

## zh-CN

限制同时上传文件的数量。

## en-US

Constraint the amount of filed being uploaded at one time.

```jsx
import { Upload, message } from 'choerodon-ui/pro';


const handleBefore = (file, fileList) => {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error('You can only upload JPG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJPG && isLt2M;
};

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
  fileListMaxLength: 2,
  beforeUpload: handleBefore,
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  mountNode,
);
```
