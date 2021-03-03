---
order: 24
title:
  zh-CN: 动态筛选条
  en-US: DynamicFilterBar
---

## zh-CN

动态筛选条。

## en-US

DynamicFilterBar.

```jsx
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { observable } from 'mobx-react-lite';
import { action, toJS } from 'mobx';

const optionData = [{ text: '男', value: 'M' }, { text: '女', value: 'F' }];

const codeDynamicProps = {
  lovCode({ record }) {
    if (record) {
      return 'LOV_CODE';
    }
  },
};

const codeCodeDynamicProps = {
  // 代码code_code值绑定 为 字段code 的 值列表的值字段为code.codevalue
  bind({ record }) {
    const field = record.getField('code');
    if (field) {
      const valueField = field.get('valueField');
      return `code.${valueField}`;
    }
  },
};

const codeDescriptionDynamicProps = {
  bind({ record }) {
    const field = record.getField('code');
    if (field) {
      const textField = field.get('textField');
      return `code.${textField}`;
    }
  },
};

@observer
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
    autoQuery: false,
    pageSize: 5,
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      {
        name: 'email',
        type: 'email',
        label: '邮箱',
      },
      {
        name: 'numberMultiple',
        type: 'number',
        label: '数值多值',
        multiple: true,
        min: 10,
        max: 100,
        step: 0.5,
      },
      {
        name: 'code_code',
        type: 'string',
        label: '代码',
        maxLength: 20,
        // required: true,
        dynamicProps: codeCodeDynamicProps,
      },
      {
        name: 'code_description',
        dynamicProps: codeDescriptionDynamicProps,
        type: 'string',
        label: '代码描述',
      },
      {
        name: 'code_select',
        type: 'string',
        label: '代码描述(下拉)',
        lovCode: 'LOV_CODE',
        // required: true,
      },
      {
        name: 'codeMultiple',
        type: 'object',
        label: '代码描述（多值）',
        lovCode: 'LOV_CODE',
        multiple: true,
        // required: true,
      },
      {
        name: 'codeMultiple_code',
        bind: 'codeMultiple.code',
        type: 'string',
        label: '代码（多值）',
        multiple: true,
      },
      {
        name: 'codeMultiple_description',
        bind: 'codeMultiple.description',
        type: 'string',
        label: '代码描述',
        multiple: ',',
      },
      {
        name: 'sex.text',
        type: 'string',
        label: '添加筛选',
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

  render() {
    return (
      <Table
        buttons={['add', 'query']}
        dataSet={this.ds}
        queryBar="filterBar"
        border={false}
        columns={this.columns}
        queryFieldsLimit={2}
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
