import React from 'react';
import ReactDOM from 'react-dom';
import { Upload, Icon, message } from 'choerodon-ui';

const Dragger = Upload.Dragger;

const props = {
  name: 'file',
  multiple: true,
  action: '//jsonplaceholder.typicode.com/posts/',
  onChange(info) {
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

ReactDOM.render(
  <Dragger {...props}>
    <p className="c7n-upload-drag-icon">
      <Icon type="inbox" />
    </p>
    <p className="c7n-upload-text">Click or drag file to this area to upload</p>
    <p className="c7n-upload-hint">
      Support for a single or bulk upload. Strictly prohibit from uploading
      company data or other band files
    </p>
  </Dragger>,
  document.getElementById('container'),
);
