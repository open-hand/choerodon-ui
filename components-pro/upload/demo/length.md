---
order: 2
title:
  zh-CN: 数量限制
  en-US: Count Constraint
---

## zh-CN

限制同时上传文件的数量。

## en-US

Constraint the amount of filed being uploaded at one time.

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
  fileListMaxLength: 2,
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  mountNode
);

````
