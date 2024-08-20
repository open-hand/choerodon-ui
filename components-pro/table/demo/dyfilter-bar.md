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
import { DataSet, Table, Button, NumberField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { observable } from 'mobx-react-lite';
import { action, toJS } from 'mobx';
import moment from 'moment';

const { DynamicFilterBar } = Table;
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
  bind({ record, dataSet }) {
    if (record) {
      const field = dataSet.getField('code');
      if (field) {
        const valueField = field.get('valueField', record);
        return `code.${valueField}`;
      }
    }
  },
};

const codeDescriptionDynamicProps = {
  bind({ record, dataSet }) {
    if (record) {
      const field = dataSet.getField('code');
      if (field) {
        const textField = field.get('textField', record);
        return `code.${textField}`;
      }
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
    combineSort: true,
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `https://hzero-test.open.hand-china.com/mock/sortUser`,
        };
      },
    },
    autoQuery: false,
    dataKey: 'rows',
    pageSize: 10,
    queryFields: [
      {
        name: 'START_TIME',
        type: 'dateTime',
        label: '开始执行时间',
        range: true,
      },
      {
        name: 'applicationDateRange',
        type: 'dateTime',
        ignore: 'always',
        range: ['start', 'end'],
        defaultValue: { start: moment().subtract(1, 'months'), end: moment() },
        label: 'applicationDate',
        labelWidth: '90',
      },
      {
        name: 'requisitionDateFrom',
        type: 'date',
        bind: 'applicationDateRange.start',
      },
      {
        name: 'requisitionDateTo',
        type: 'date',
        bind: 'applicationDateRange.end',
      },
      { name: 'name', label: '姓名', type: 'string' },
      { name: 'empty', type: 'string', multiple: true },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'ageRange', defaultValue: [], type: 'number', label: '年龄范围', range: true },
      { name: 'code', type: 'object', ignore:'always', label: '代码描述', lovCode: 'LOV_CODE', multiple: true },
      {
        name: 'email',
        type: 'email',
        label: 'email',
        computedProps: {
          disabled: ({ record }) => record?.get('name') === '123',
        },
      },
      {
        name: 'numberMultiple',
        type: 'currency',
        label: '金额range',
        range: true,
        currency: 'USD',
      },
      {
        name: 'code_code',
        type: 'string',
        label: '代码',
        maxLength: 20,
        // required: true,
        // computedProps: codeCodeDynamicProps,
        bind: 'code.code',
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
        label: '代码描述bind',
        multiple: ',',
      },
      {
        name: 'sex.text',
        type: 'string',
        textField: 'text',
        valueField: 'value',
        options: this.optionDs, // 下拉框组件的菜单数据集
        defaultValue: 'F',
      },
      { name: 'startDate', type: 'date', label: '开始日期' },
      { name: 'status', type: 'string', label: 'status', disabled: true },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
        computedProps: {
          disabled: ({ record }) => record?.get('name') === '123',
        },
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
    return [{ name: 'name', width: 450, sortable: true }, { name: 'age', sortable: true }];
  }

  // componentDidMount() {
  //   console.log('componentDidMount query')
  //   ds.query();
  // }

  render() {
    window.ds = this.ds;
    return (
      <Table
        searchCode='xxx'
        buttons={['add', 'query', 'remove', 'collapseAll', 'reset']}
        dataSet={this.ds}
        tableFilterBarButtonIcon
        // queryFields={{
        //   age: <NumberField addonAfter="%"/>
        // }}
        queryBar="filterBar"
        queryBarProps={{
          filterQueryCallback: () => {
            console.log('filterQueryCallback')
            ds.query();
          },
          // 高级搜索配置
          advancedSearchFields: [
            {
              name: 'name',
              alias: 'nameAlias',
              source: 'queryFields'
            },
            {
              name: 'code',
              alias: 'codeId',
              source: 'queryFields'
            },
            {
              name: 'code_code',
              alias: 'code_bind',
              source: 'queryFields'
            },
            {
              name: 'age',
              source: 'fields',
              // fieldPorps: {
              //   label: '高级年龄',
              // },
            },
            {
              name: 'startDate',
              tableName: 'TABLENAME',
              source: 'queryFields',
            },
            {
              name: 'newText',
              fieldPorps: {
                label: '新字段',
                type: 'string',
                label: '性别（多值）',
                lookupCode: 'HR.EMPLOYEE_GENDER',
              },
              source: 'other',
            },
          ],
          // fuzzyQuery: false,
          // autoQuery: false,
          // onRefresh: () => {
          //   console.log('props onRefresh');
          //   return false;
          // },
          dynamicFilterBar: {
            prefixes: ['filter'],
            tableFilterAdapter: (props) => {
              const { config, config: { data }, type, searchCode, queryDataSet, tableFilterTransport } = props;
              console.log('defaultTableFilterAdapter config', config);
              const userId = 1;
              const tenantId = 0;
              switch (type) {
                case 'read':
                  return {
                    // url: `${HZERO_PLATFORM}/v1/${organizationId}/search-config?searchCode=${searchCode}`,
                    url: 'https://hzero-test.open.hand-china.com/mock/filterlist',
                    method: 'get',
                  };
                case 'create':
                  return {
                    url: `${HZERO_PLATFORM}/v1/${organizationId}/search-config/${data[0].searchId}`,
                    method: 'put',
                    data: data[0],
                  };
                case 'update':
                  return {
                    // url: `${HZERO_PLATFORM}/v1/${organizationId}/search-config/${data[0].searchId}`,
                    method: 'put',
                    data: data[0],
                  };
                case 'destroy':
                  return {
                    // url: `/v1/${searchCode}/search-config/${data[0].searchId}`,
                    url: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/listDel',
                    data: data[0],
                    method: 'delete',
                  };
              }
            },
          }
        }}
        border={false}
        columns={this.columns}
        queryFieldsLimit={2}
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
