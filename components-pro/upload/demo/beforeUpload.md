---
order: 3
title:
  zh-CN: 上传文件列表控制
  en-US: Upload File Control
---

## zh-CN

使用 `beforeUpload` 返回 false 后，控制上传文件列表

## en-US

Use `beforeUpload` to return false to control the list of uploaded files

```jsx
import { Upload, message } from 'choerodon-ui/pro';
import { actionUrl } from './actionUrl';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadFileList: [
        {
          name: 'xxx.jpg',
          type: 'image/jpg',
          status: 'success',
          size: 2800,
          uid: 1,
          url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
      ],
    };
  }

  handleBefore = (file, fileList) => {
    const isJPG = file.type === 'image/jpeg';
    if (!isJPG) {
      message.error('You can only upload JPG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    console.log('this_up', this.state.uploadFileList);
    if (isJPG && isLt2M) {
      this.setState({
        uploadFileList: [...this.state.uploadFileList, file],
      });
    }
    return false;
  };

  render() {
    const props = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      action: actionUrl,
      multiple: true,
      accept: ['.deb', '.txt', '.pdf', 'image/*'],
      uploadImmediately: false,
      beforeUpload: this.handleBefore,
      withCredentials: false,
      partialUpload: false,
      uploadFileList: this.state.uploadFileList,
    };

    return <Upload {...props} />;
  }
}

ReactDOM.render(<App />, mountNode);
```
