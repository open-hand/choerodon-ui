---
order: 4
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
import { observer } from 'mobx-react';

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

@observer
class AddChildButton extends React.Component {
  render() {
    const { dataSet, ...otherProps } = this.props;
    const { current } = dataSet;
    return <Button {...otherProps} disabled={!current || !current.get('id')} />;
  }
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    queryUrl: '/tree.mock',
    submitUrl: '/tree.mock',
    autoQuery: true,
    parentField: 'parentId',
    idField: 'id',
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

  handleCreateChild = () => {
    this.ds.create({ parentId: this.ds.current.get('id') });
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
    <AddChildButton key="add-child" dataSet={this.ds} onClick={this.handleCreateChild}>
      添加子节点
    </AddChildButton>,
    <Button key="change-expand-type" onClick={this.handleChangeExpandIconIndex}>
      切换展开图标索引
    </Button>,
    <Button key="change-border" onClick={this.handleChangeBorder}>
      切换边框
    </Button>,
    <Button key="change-mode" onClick={this.handleChangeMode}>
      切换树模式
    </Button>,
    <Button key="change-expand-render" onClick={this.handleChangeExpandRender}>
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
        rowNumber
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
