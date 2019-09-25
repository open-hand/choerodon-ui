---
order: 1
title:
  zh-CN: 树形数据
  en-US: Tree Data
---

## zh-CN

树形数据。

## en-US

Tree Data.

```jsx
import { DataSet, Table, Button, Icon } from 'choerodon-ui/pro';

const { Column } = Table;

function iconRenderer({ record, text }) {
  return [<Icon key="icon" type={record.get('icon')} />, <span key="text">{text}</span>];
}

function expandedRowRenderer({ record }) {
  return (
    <p>
      功能代码：{record.get('functionCode')} 入口页面：{record.get('url')}
    </p>
  );
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
      { name: 'expand', type: 'boolean', label: '是否展开' },
      { name: 'ischecked', type: 'boolean', label: '是否开启' },
      { name: 'score', type: 'number', order: 'asc' },
      { name: 'parentId', type: 'number', parentFieldName: 'id' },
    ],
    events: {
      indexchange: ({ current }) => console.log('current user', current),
      submit: ({ data }) => console.log('submit tree data', data),
    },
  });

  state = {
    expandIconColumnIndex: 0,
    border: true,
    mode: 'tree',
    expandedRender: false,
  };

  handleChangeExpandRender = () => this.setState({ expandedRender: !this.state.expandedRender });

  handleChangeExpandIconIndex = () =>
    this.setState({
      expandIconColumnIndex:
        this.state.expandIconColumnIndex > 2 ? 0 : this.state.expandIconColumnIndex + 1,
    });

  handleChangeBorder = () => this.setState({ border: !this.state.border });

  handleChangeMode = () => this.setState({ mode: this.state.mode === 'tree' ? 'list' : 'tree' });

  buttons = [
    'add',
    'save',
    'delete',
    'remove',
    'query',
    'expandAll',
    'collapseAll',
    <Button
      key="change-expand-type"
      onClick={this.handleChangeExpandIconIndex}
      color="blue"
      funcType="flat"
    >
      切换展开图标索引
    </Button>,
    <Button key="change-border" onClick={this.handleChangeBorder} color="blue" funcType="flat">
      切换边框
    </Button>,
    <Button key="change-mode" onClick={this.handleChangeMode} color="blue" funcType="flat">
      切换树模式
    </Button>,
    <Button
      key="change-expand-render"
      onClick={this.handleChangeExpandRender}
      color="blue"
      funcType="flat"
    >
      切换展开行渲染
    </Button>,
  ];

  render() {
    const { mode, expandIconColumnIndex, border, expandedRender } = this.state;
    return (
      <Table
        mode={mode}
        buttons={this.buttons}
        dataSet={this.ds}
        expandIconColumnIndex={expandIconColumnIndex}
        border={border}
        expandedRowRenderer={expandedRender && expandedRowRenderer}
      >
        <Column name="text" editor renderer={iconRenderer} width={450} />
        <Column name="url" editor />
        <Column name="ischecked" editor />
        <Column name="expand" editor />
        <Column header="权限设置" width={150} align="center" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
