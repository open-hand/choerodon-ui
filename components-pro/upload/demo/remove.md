---
order: 8
title:
  zh-CN: 文件删除回调
  en-US: File Delete Callback
---

## zh-CN

使用 `onRemoveFile` 返回 false 后，不移除

## en-US

Don't remove after returning false with `onRemoveFile`

```jsx
import { Upload } from 'choerodon-ui/pro';


class App extends React.Component {
  handleRemove = file => {
    console.log('remove', file);
    return false;
  };

  render() {
    const props = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      multiple: true,
      accept: ['.deb', '.txt', '.pdf', 'image/*'],
      uploadImmediately: false,
      onRemoveFile: this.handleRemove,
    };

    return <Upload {...props} />;
  }
}

ReactDOM.render(<App />, mountNode);
```
