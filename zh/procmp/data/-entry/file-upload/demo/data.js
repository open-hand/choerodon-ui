import React from 'react';
import ReactDOM from 'react-dom';
import { Upload } from 'choerodon-ui/pro';

const props = {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  multiple: true,
  accept: ['.deb', '.txt', '.pdf', 'image/*'],
  uploadImmediately: false,
  data: {
    key1: 'value1',
    key2: 'value2',
  },
  onUploadSuccess: (response) => console.log(response),
};

ReactDOM.render(
  <div>
    <Upload {...props} />
  </div>,
  document.getElementById('container'),
);
