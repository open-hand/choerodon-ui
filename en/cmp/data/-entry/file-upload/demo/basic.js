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
  showUploadList: {
    // showReUploadIcon: Upload 组件文件上传失败后是否显示重新上传按钮。当 listType 为 picture-card: true 为 icon, text 为文字形式; 其他 listType 都为文字形式
    showReUploadIcon: true,
  },
};

ReactDOM.render(
  <Upload {...props}>
    <Button>
      <Icon type="file_upload" /> Click to Upload
    </Button>
  </Upload>,
  document.getElementById('container'),
);
