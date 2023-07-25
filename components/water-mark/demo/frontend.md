---
order: 2
title:
  zh-CN: 前置水印
  en-US: Frontend
---

## zh-CN

水印组件默认实现为前置水印，即设想水印会显示在内容的上方，zIndex 默认设置为 9，如果你不希望水印遮挡上层内容，可以调整该值到小于上层内容的 zIndex。

## en-US

The watermark component is implemented as a pre watermark by default, that is, it is assumed that the watermark will be displayed above the content, and the zindex is set to 9 by default. If you do not want the watermark to obscure the upper content, you can adjust this value to a zindex smaller than the upper content.

````jsx
import React from 'react';
import { WaterMark } from 'choerodon-ui';
import { Table, DataSet } from 'choerodon-ui/pro';

class App extends React.Component {
  userDs = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        max: 100,
        step: 1,
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
  });

  get columns() {
    return [
      { name: 'userid' },
      { name: 'name', editor: true },
      { name: 'age', editor: true },
      { name: 'sex', editor: true },
      { name: 'enable', editor: true },
    ];
  }

  render() {
    return (
      <WaterMark content="Choerodon-ui">
        <Table
          key="basic"
          rowNumber={({ text }) => `#${text}`}
          dataSet={this.userDs}
          columns={this.columns}
        />
      </WaterMark>
    );
  }
}

ReactDOM.render(
  <App />, 
  mountNode);
````
