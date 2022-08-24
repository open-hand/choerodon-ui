---
order: 29
title:
  zh-CN: 组合搜索条
  en-US: Bar for Combo
---

## zh-CN

组合搜索条。

## en-US

Bar for Combo

```jsx
import { DataSet, Table, Button, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { observable } from 'mobx-react-lite';
import { action, toJS } from 'mobx';


const { comboFilterBar } = Table;

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
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: false,
    // selection: false,
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
        computedProps: codeCodeDynamicProps,
      },
      {
        name: 'code_description',
        computedProps: codeDescriptionDynamicProps,
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
        label: '代码描',
        lovCode: 'LOV_CODE',
        multiple: true,
        // required: true,
        placeholder: '代码描',
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
      { name: 'date.startDate', type: 'date', label: '开始日期', range: true },
      { name: 'status', type: 'string', label: 'status' },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
    fields: [
      { name: 'userid', type: 'string', label: '编号', required: true },
      { name: 'name', type: 'string', label: '姓名', required: true },
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
    return [
        { name: 'name', width: 150, editor: true, lock: 'left' },
        { name: 'age', width: 150, editor: true },
        { name: 'sex', width: 150, editor: true },
        { name: 'date.startDate', width: 150 },
        { name: 'sexMultiple', width: 150 },
        { header: '操作', width: 150 }
    ];
  }

  searchRender() {
      return <Icon type="info" />;
  }

  advancedFilter() {
    return (
      <Icon type="info" />
    );
  }

  handleChangeStatus = () => {
    if (this.ds.getState('__CONDITIONSTATUS__')) {
      this.ds.setState('__CONDITIONSTATUS__', 'update');
    }
  };

  render() {
    return (
      <>
        <Table
          // buttons={['add']}
          dataSet={this.ds}
          queryBar="comboBar"
          customizable
          columnDraggable
          queryBarProps={{
            // title: '测试Title',
            // rowActions: () => [],
            // fuzzyQuery: false,
            // inlineSearch: true,
            // queryFieldsStyle: {
            //   name: {
            //       width: 100,
            //   },
            //   age: {
            //       width: 100,
            //   },
            //   code_select: {
            //     width: 150,
            //   },
            //   'date.startDate': {
            //     width: 200,
            //   },
            //   sexMultiple: {
            //     width: 120,
            //   },
            // },
            fuzzyQuery: false,
            // simpleMode: true,
            // singleLineMode: false,
            inlineSearchRender: this.searchRender(),
            // advancedFilter: '323',
            // filerMenuAction: '789',
            comboFilterBar: {
              // suffixes: ['filter'],
              // searchId: '25',
              filterSave: false,
              // tableFilterAdapter: (props) => {
              //   const { config, config: { data }, type, searchCode, queryDataSet, tableFilterTransport } = props;
              //   switch (type) {
              //     case 'read':
              //       return {
              //         // url: `${HZERO_PLATFORM}/v1/${organizationId}/search-config?searchCode=${searchCode}`,
              //         url: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/combo-filterList',
              //         method: 'get',
              //       };
              //   }
              // },
            }
          }}
          border={false}
          columns={this.columns}
        />
      </>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
