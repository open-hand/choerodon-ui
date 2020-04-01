---
order: 2
title:
  zh-CN: 追加上传文件列表
  en-US: Append Upload File List
---

## zh-CN

以追加形式上传文件列表

## en-US

Upload file list as append

```jsx
import { Upload } from 'choerodon-ui/pro';


class App extends React.Component {
  render() {
    const props = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      multiple: true,
      accept: ['.deb', '.txt', '.pdf', 'image/*'],
      uploadImmediately: false,
      withCredentials: false,
      partialUpload: true,
      appendUpload: true,
    };

    return <Upload {...props} />;
  }
}

ReactDOM.render(<App />, mountNode);
```
