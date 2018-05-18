---
order: 7
title:
  en-US: Dropdown Menu Filter
  zh-CN: 下拉菜单筛选
---

## zh-CN

设置 `filterBar` 属性为false来显示下拉过滤菜单。

对某一列数据进行筛选，使用列的 `filters` 属性来指定需要筛选菜单的列，`onFilter` 用于筛选当前数据，`filterMultiple` 用于指定多选和单选。

## en-US

Set `filterBar` prop false to show dropdown menu filter.

Use `filters` to generate filter menu in columns, `onFilter` to determine filtered result, and `filterMultiple` to indicate whether it's multiple or single selection.

````jsx
import { Table } from 'choerodon-ui';

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  filters: [{
    text: 'Joe',
    value: 'Joe',
  }, {
    text: 'Jim',
    value: 'Jim',
  }, {
    text: 'Last Name',
    value: 'last',
    children: [{
      text: 'Green',
      value: 'Green',
    }, {
      text: 'Black',
      value: 'Black',
    }],
  }],
  // specify the condition of filtering result
  // here is that finding the name started with `value`
  onFilter: (value, record) => record.name.indexOf(value) > -1,
}, {
  title: 'Age',
  dataIndex: 'age',
  filters: [],
  onFilter: (value, record) => record.name.indexOf(value) === 0,
}, {
  title: 'Address',
  dataIndex: 'address',
  filters: [{
    text: 'London',
    value: 'London',
  }, {
    text: 'New York',
    value: 'New York',
  }],
  filterMultiple: true,
  onFilter: (value, record) => record.address.indexOf(value) === 0,
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
}, {
  key: '4',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}];

function onChange(pagination, filters, sorter) {
  console.log('params', pagination, filters, sorter);
}

ReactDOM.render(
  <Table columns={columns} dataSource={data} onChange={onChange} filterBar={false} />
, mountNode);
````
