---
order: 12
title:
  zh-CN: 组合列
  en-US: Grouped Columns
---

## zh-CN

组合列。

## en-US

Grouped Columns.

```jsx
import { DataSet, Table, CheckBox } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'userid',
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
    pageSize: 5,
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
      { name: 'date.startDate', type: 'date', label: '开始日期' },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
    fields: [
      { name: 'userid', type: 'string', label: '编号', required: true },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
  });

  state = { border: true, resizable: true };

  expandedRowRenderer() { return '---' }

  render() {
    const { border, resizable, footer } = this.state;
    const buttons = [
      <CheckBox key="border" checked={border} onChange={() => this.setState({ border: !border })} label="边框" labelLayout="float" />,
      <CheckBox key="resizable" checked={resizable} onChange={() => this.setState({ resizable: !resizable })} label="可调整列宽" labelLayout="float" />,
      <CheckBox key="footer" checked={footer} onChange={() => this.setState({ footer: !footer })} label="表脚" labelLayout="float" />,
    ];
    return (
      <Table
        dataSet={this.ds}
        border={border}
        buttons={buttons}
        customizable
        customizedCode="column-group"
        columnResizable={resizable}
        expandedRowRenderer={this.expandedRowRenderer}
        parityRow
      >
        <Column header="组合" lock>
          <Column name="name" editor width={450} />
          <Column name="age" editor />
        </Column>
        <Column header="组合3">
          <Column header="组合2">
            <Column name="sex" editor footer={footer ? (() => '--') : undefined} />
            <Column name="date.startDate" editor />
          </Column>
          <Column name="sexMultiple" editor />
        </Column>
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
