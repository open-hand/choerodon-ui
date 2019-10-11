---
order: 6
title:
  zh-CN: 上传方法
  en-US: Upload method
---

## zh-CN

直接调用组件的上传方法，可以使用`showUploadBtn={false}`使自带的上传按钮消失。

## en-US

Call `Upload`'s `startUpload` method directly. You can use `showUploadBtn={false}` to hide the original upload button.

```jsx
import { Upload, Button, Form, Output } from 'choerodon-ui/pro';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: '//localhost:3000/upload',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
  showUploadBtn: false,
  showPreviewImage: true,
};

class Demo extends React.Component {
  upload;

  saveUpload = node => (this.upload = node);

  handleBtnClick = () => {
    this.upload.startUpload();
  };

  render() {
    return (
      <Form header="文件管理">
        <Output label="选择Logo" renderer={() => <Upload ref={this.saveUpload} {...props} />} />
        <Button style={{ marginBottom: 10 }} color="primary" onClick={this.handleBtnClick}>
          提交
        </Button>
      </Form>
    );
  }
}

ReactDOM.render(<Demo />, mountNode);
```
