import React from 'react';
import ReactDOM from 'react-dom';
import { Upload, message } from 'choerodon-ui/pro';

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
          url:
            'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
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
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
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

ReactDOM.render(<App />, document.getElementById('container'));
