---
order: 16
title:
  zh-CN: 专业搜索条
  en-US: professionalBar
---

## zh-CN

高级搜索条。

## en-US

professionalBar.

```jsx
import { DataSet, Table, Button } from 'choerodon-ui/pro';

const customIntlObj = {
  zh_CN: {
    DataSet: {
      invalid_query_dataset: '自定义文本',
    },
  },
  en_US: {
    DataSet: {
      invalid_query_dataset: 'Custom text',
    },
  },
  // 所有自定义语言信息...
};

const optionData = [{ text: '男', value: 'M' }, { text: '女', value: 'F' }];

class App extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
    // 自定义多语言
    customIntlFun: ({component, key, lang, defaultIntl}) => {
      return customIntlObj[lang]?.[component]?.[key] || defaultIntl;
    },
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
      { name: 'name', type: 'intl', label: '姓名', required: true, defaultValue: '彭霞' },
      { name: 'age', type: 'number', label: '年龄' },
      {
        name: 'sex.text',
        type: 'string',
        label: '性别',
        textField: 'text',
        valueField: 'value',
        options: this.optionDs, // 下拉框组件的菜单数据集
        defaultValue: 'F',
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
      query: ({ params, data }) => console.log('advanced bar query parameter', params, data),
    },
  });

  get columns() {
    return [{ name: 'name', width: 450, editor: true }, { name: 'age', editor: true }];
  }

  customQueryBtn = (
    <Button onClick={() => this.ds.query()}>自定义查询</Button>
  );

  render() {
    return (
      <Table
        buttons={['add', this.customQueryBtn]}
        dataSet={this.ds}
        queryBar="professionalBar"
        border={false}
        columns={this.columns}
        queryFieldsLimit={2}
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
