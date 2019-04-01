---
order: 0
title:
  zh-CN: 树形数据
  en-US: Tree Data
---

## zh-CN

树形数据。

## en-US

Tree Data.

````jsx
import { DataSet, Table, Icon } from 'choerodon-ui/pro';

const { Column } = Table;

const buttons = [
  'add', 'save', 'delete', 'query', 'expandAll', 'collapseAll',
];

function iconRenderer({ record, text }) {
  return [
    <Icon key="icon" type={record.get('icon')} />,
    <span key="text">{text}</span>,
  ];
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    queryUrl: '/tree.mock',
    submitUrl: '/tree.mock',
    autoQuery: true,
    parentField: 'parentId',
    idField: 'id',
    expandField: 'expand',
    checkField: 'ischecked',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'text', type: 'string', label: '功能名称' },
      { name: 'url', type: 'string', label: '入口页面' },
      { name: 'expand', type: 'boolean' },
      { name: 'ischecked', type: 'boolean', label: '是否开启' },
      { name: 'score', type: 'number', order: 'asc' },
      { name: 'parentId', type: 'number', parentFieldName: 'id' },
    ],
    events: {
      indexchange: ({ current }) => console.log('current user', current),
      submit: ({ data }) => console.log('submit tree data', data),
    },
  });

  render() {
    return (
      <Table mode="tree" buttons={buttons} dataSet={this.ds}>
        <Column name="text" editor renderer={iconRenderer} width={450} />
        <Column name="url" editor />
        <Column name="ischecked" editor />
        <Column header="权限设置" width={150} align="center" />
      </Table>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
