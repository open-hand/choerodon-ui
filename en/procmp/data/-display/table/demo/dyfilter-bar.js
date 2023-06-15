import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

const optionData = [
  { text: '男', value: 'M' },
  { text: '女', value: 'F' },
];

const codeCodeDynamicProps = {
  // 代码code_code值绑定 为 字段code 的 值列表的值字段为code.codevalue
  bind({ record }) {
    if (record) {
      const field = record.getField('code');
      if (field) {
        const valueField = field.get('valueField');
        return `code.${valueField}`;
      }
    }
  },
};

const codeDescriptionDynamicProps = {
  bind({ record }) {
    if (record) {
      const field = record.getField('code');
      if (field) {
        const textField = field.get('textField');
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
    name: 'user',
    pageSize: 5,
    autoQuery: false,
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
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
      },
      {
        name: 'date.startDate',
        type: 'date',
        label: '开始日期',
        defaultValue: new Date(),
      },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
    events: {
      query: ({ params, data }) =>
        console.log('advanced bar query parameter', params, data),
    },
  });

  get columns() {
    return [{ name: 'name', width: 450 }, { name: 'age' }];
  }

  render() {
    return (
      <Table
        // searchCode：后端保存筛选项时，需配置动态筛选条后端接口唯一编码，保证数据匹配
        searchCode="xxx"
        buttons={['add', 'query']}
        dataSet={this.ds}
        queryBar="filterBar"
        queryBarProps={{
          // fuzzyQuery: false,
          // autoQuery: false,
          // onRefresh: () => {
          //   console.log('props onRefresh');
          //   return false;
          // },
          //
          // 高级搜索配置
          advancedSearchFields: [
            {
              name: 'name',
              alias: 'nameAlias',
              source: 'queryFields',
            },
            {
              name: 'code',
              alias: 'codeId',
              source: 'queryFields',
            },
            {
              name: 'code_code',
              alias: 'code_bind',
              source: 'queryFields',
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
          dynamicFilterBar: {
            // suffixes: [<Button icon="close" />],
            // tableFilterAdapter: 后端保存筛选项时，过滤条请求适配器，支持全局配置;  使用该功能前通常在全局配置中配置相关通用 API 适配器，开发者无需单独配置。
            tableFilterAdapter: (props) => {
              const {
                config,
                config: { data },
                type,
                searchCode,
                queryDataSet,
                tableFilterTransport,
              } = props;
              console.log('defaultTableFilterAdapter config', config);
              const userId = 1;
              const tenantId = 0;
              switch (type) {
                case 'read':
                  return {
                    // url: `read api`,
                    url:
                      'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/filterlist',
                    method: 'get',
                  };
                case 'create':
                  return {
                    // url: `create api`,
                    method: 'put',
                    data: data[0],
                  };
                case 'update':
                  return {
                    // url: `update api`,
                    method: 'put',
                    data: data[0],
                  };
                case 'destroy':
                  return {
                    // url: `destroy api`,
                    url:
                      'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/listDel',
                    data: data[0],
                    method: 'delete',
                  };
              }
            },
          },
        }}
        border={false}
        columns={this.columns}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
