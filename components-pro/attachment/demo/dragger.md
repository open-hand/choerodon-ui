---
order: 7
title:
  zh-CN: 拖拽上传
  en-US: Dragger upload
---

## zh-CN

拖拽上传

## en-US

Dragger upload

````jsx
import React from 'react';
import { Icon } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';

const { Dragger } = Attachment

const App = () => {
  const [value, setValue] = React.useState('4c74a34a-fa37-4e92-be9d-5cf726fb1472');
  const props = {
    label: '技术附件',
    labelLayout: 'float',
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    max: 3,
    value,
    onChange: setValue,
    showHistory: true,
    disabled: true,
    //buttons: [['remove', { hidden: false }]],
    help: '支持文件类型： .deb .txt .pdf image/*',
  };

  return (
    <Dragger {...props}>
      <div style={{padding: 20}}>
        <p className="c7n-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p style={{paddingTop:20, color:'rgba(0, 0, 0, 0.85)'}}>点击这里或者拖拽文件到这里上传</p>
        <p style={{color:'rgba(0, 0, 0, 0.45)'}}>支持文件类型： .deb .txt .pdf image/*</p>
      </div>
    </Dragger>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
