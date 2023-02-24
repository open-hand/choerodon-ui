import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

const optionData = [
  { text: '男', value: 'M' },
  { text: '女', value: 'F' },
];

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
    autoQuery: true,
    // 配置开启组合排序
    combineSort: true,
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      { name: 'email', type: 'email', label: '邮箱' },
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
      query: ({ params, data }) => {
        // 组合排序模式下，排序参数以数组形式传递到后端
        console.log('advanced bar query parameter', params, data);
        return true;
      },
    },
  });

  get columns() {
    return [
      { name: 'userid' },
      // 通过给列设置 sortable 属性，开启列组合排序
      { name: 'name', sortable: true },
      { name: 'age', sortable: true },
      { name: 'sex', sortable: true },
      { name: 'sexMultiple' },
    ];
  }

  render() {
    return (
      <Table
        // searchCode：后端保存筛选项时，需配置动态筛选条后端接口唯一编码，保证数据匹配
        searchCode="xxx"
        dataSet={this.ds}
        columns={this.columns}
        queryBar="filterBar"
        queryBarProps={{
          dynamicFilterBar: {
            // tableFilterAdapter: 后端保存筛选项时，过滤条请求适配器，支持全局配置;  使用该功能前通常在全局配置中配置相关通用 API 适配器，开发者无需单独配置。
            tableFilterAdapter: (props) => {
              const {
                config,
                config: { data },
                type,
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
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
