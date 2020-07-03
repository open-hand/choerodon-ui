import React from 'react';
import ReactDOM from 'react-dom';
import { Upload } from 'choerodon-ui/pro';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  multiple: true,
  accept: ['image/*'],
  uploadImmediately: false,
  extra: <p>请上传图片文件(jpg, jpeg, png...)</p>,
  onUploadSuccess: (response) => console.log(response),
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  document.getElementById('container'),
);
