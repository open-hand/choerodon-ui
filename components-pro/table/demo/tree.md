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
    combineSort: true,
    fields: [
      { name: 'id', type: 'number' },
      { name: 'text', type: 'string', label: '功能名称' },
      { name: 'url', type: 'string', label: '入口页面' },
      { name: 'expand', type: 'boolean', label: '是否展开' },
      { name: 'ischecked', type: 'boolean', label: '是否开启' },
      { name: 'score', type: 'number', label: '顺序', order: 'asc' },
      { name: 'parentId', type: 'number' },
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
    checkFieldAsColumn: true,
    selectionMode: 'rowbox',
  };

  handleCreateChild = () => {
    this.ds.create({ parentId: this.ds.current.get('id') });
  };

  handleChangeExpandRender = () => this.setState({ expandedRender: !this.state.expandedRender });

  handleChangeExpandIconIndex = () =>
    this.setState((prevState) => ({
      expandIconColumnIndex:
        prevState.expandIconColumnIndex > 2 ? 0 : prevState.expandIconColumnIndex + 1,
    }));

  handleChangeBorder = () => this.setState({ border: !this.state.border });

  handleChangeMode = () => this.setState((prevState) => ({ mode: prevState.mode === 'tree' ? 'list' : 'tree' }));

  handleChangeCheckFieldAsColumn = () => this.setState((prevState) => ({ checkFieldAsColumn: !prevState.checkFieldAsColumn }));

  handleChangeSelectionMode = () => this.setState((prevState) => ({ selectionMode: prevState.selectionMode === 'rowbox' ? 'treebox' : 'rowbox' }));

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
    <Button key="change-check-field-as-column" onClick={this.handleChangeCheckFieldAsColumn}>
      切换checkField显示模式
    </Button>,
    <Button key="change-selection-mode" onClick={this.handleChangeSelectionMode}>
      切换选择模式
    </Button>,
  ];

  render() {
    const { mode, expandIconColumnIndex, border, expandedRender, checkFieldAsColumn, selectionMode } = this.state;
    return (
      <Table
        rowDraggable
        parityRow
        mode={mode}
        selectionMode={selectionMode}
        buttons={this.buttons}
        dataSet={this.ds}
        expandIconColumnIndex={expandIconColumnIndex}
        border={border}
        expandedRowRenderer={expandedRender && expandedRowRenderer}
        rowNumber
        defaultRowExpanded
        style={{ height: 300 }}
        virtual
      >
        <Column name="text" editor renderer={iconRenderer} width={450} sortable />
        <Column name="url" editor sortable />
        <Column name="score" />
        <Column name="ischecked" editor hidden={!checkFieldAsColumn} />
        <Column name="expand" editor />
        <Column header="权限设置" width={150} align="center" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
