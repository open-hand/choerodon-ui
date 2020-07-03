import React from 'react';
import ReactDOM from 'react-dom';
import { Upload, message } from 'choerodon-ui/pro';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
  onUploadSuccess: (response) => message.success(response.message),
  onUploadError: (error, response, file) => console.log(error, response, file),
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  document.getElementById('container'),
);
