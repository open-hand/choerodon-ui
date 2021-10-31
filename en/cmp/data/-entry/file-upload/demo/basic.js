import React from 'react';
import ReactDOM from 'react-dom';
import { Upload, message, Button, Icon } from 'choerodon-ui';

const props = {
  name: 'file',
  action: '//jsonplaceholder.typicode.com/posts/',
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  showFileSize: true,
};

ReactDOM.render(
  <Upload {...props}>
    <Button>
      <Icon type="file_upload" /> Click to Upload
    </Button>
  </Upload>,
  document.getElementById('container'),
);
