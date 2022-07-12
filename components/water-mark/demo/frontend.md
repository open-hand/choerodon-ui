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
import { WaterMark, Table, Icon, Divider } from 'choerodon-ui';

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
  render: text => <a href="#">{text}</a>,
}, {
  title: 'Age',
  dataIndex: 'age',
  key: 'age',
}, {
  title: 'Address',
  dataIndex: 'address',
  key: 'address',
}, {
  title: '',
  key: 'action',
  render: (text, record) => (
    <span>
      <a href="#">Action 一 {record.name}</a>
      <Divider type="vertical" />
      <a href="#">Delete</a>
      <Divider type="vertical" />
      <a href="#" className="c7n-dropdown-link">
        More actions <Icon type="down" />
      </a>
    </span>
  ),
}];

const data = [{
  key: '1',
  name: 'John Brown',
  age: 32,
  address: 'New York No. 1 Lake Park',
}, {
  key: '2',
  name: 'Jim Green',
  age: 42,
  address: 'London No. 1 Lake Park',
}, {
  key: '3',
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park',
}];

ReactDOM.render(
  <WaterMark content="Choerodon-ui">
    <Table columns={columns} dataSource={data} filterBarPlaceholder="过滤表" />
  </WaterMark>, 
  mountNode);
````
