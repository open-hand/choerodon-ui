---
order: 8
title:
  zh-CN: 自定义搜索条
  en-US: Customize Search Bar
---

## zh-CN

自定义搜索条。

## en-US

Customize Search Bar.

```jsx
import { DataSet, Table, Button, Form } from 'choerodon-ui/pro';

const { FilterBar } = Table;

const optionData = [{ text: '男', value: 'M' }, { text: '女', value: 'F' }];

class App extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

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
      {
        name: 'sex.text',
        type: 'string',
        label: '性别',
        textField: 'text',
        valueField: 'value',
        options: this.optionDs,
      },
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
    events: {
      query: ({ params, data }) => console.log('custom bar query parameter', params, data),
    },
  });

  get columns() {
    return [{ name: 'name', width: 450, editor: true }, { name: 'age', editor: true }];
  }

  renderBar = props => {
    const { queryFields, queryDataSet, queryFieldsLimit, dataSet, buttons } = props;
    if (queryDataSet) {
      return (
        <>
          <Form columns={queryFieldsLimit} dataSet={queryDataSet}>
            {queryFields}
            <div newLine>
              <Button
                dataSet={null}
                onClick={() => {
                  dataSet.query();
                }}
              >
                查询
              </Button>
              <Button onClick={() => queryDataSet.reset()}>重置</Button>
              {buttons}
            </div>
          </Form>
          <FilterBar {...props} buttons={[]} />
        </>
      );
    }
  };

  render() {
    return (
      <Table
        buttons={['add']}
        dataSet={this.ds}
        queryBar={this.renderBar}
        columns={this.columns}
        queryFieldsLimit={3}
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
