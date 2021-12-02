import React from 'react';
import ReactDOM from 'react-dom';
import { BarCode } from 'choerodon-ui';

ReactDOM.render(
  <BarCode
    value="我是一个有图片的二维码"
    imageSettings={{
      src:
        'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      height: 30,
      width: 30,
      excavate: true,
    }}
  />,
  document.getElementById('container'),
);
