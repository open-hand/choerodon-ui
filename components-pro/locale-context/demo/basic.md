---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

```jsx
import { localeContext,Upload } from 'choerodon-ui/pro';
import ja_JP from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import 'moment/locale/ja-JP';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: '//www.mocky.io/v2/5cc8019d300000980a055e76',
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

localeContext.setLocale(ja_JP);
```
