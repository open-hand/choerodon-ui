import React from 'react';
import ReactDOM from 'react-dom';
import { Upload, Button, Icon } from 'choerodon-ui';

const fileList = [
  {
    uid: -1,
    name: 'xxx.png',
    status: 'done',
    url:
      'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    thumbUrl:
      'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    uid: -2,
    name: 'yyy.png',
    status: 'done',
    url:
      'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    thumbUrl:
      'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
];

const props = {
  action: '//jsonplaceholder.typicode.com/posts/',
  listType: 'picture',
  defaultFileList: [...fileList],
};

const props2 = {
  action: '//jsonplaceholder.typicode.com/posts/',
  listType: 'picture',
  defaultFileList: [...fileList],
  className: 'upload-list-inline',
};

ReactDOM.render(
  <div>
    <Upload {...props}>
      <Button>
        <Icon type="file_upload" /> upload
      </Button>
    </Upload>
    <br />
    <br />
    <Upload {...props2}>
      <Button>
        <Icon type="file_upload" /> upload
      </Button>
    </Upload>
  </div>,
  document.getElementById('container'),
);
