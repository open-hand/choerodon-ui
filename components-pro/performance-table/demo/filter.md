---
order: 6
title:
  zh-CN: filterBar
  en-US: filterBar
---

## zh-CN

filterBar

## en-US

filterBar example.

````jsx
import { Button, PerformanceTable, DataSet, TextField } from 'choerodon-ui/pro';
import '../../../components-pro/performance-table/style/index.less';
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';

const optionData = [
  { text: '男', value: 'M' },
  { text: '女', value: 'F' },
];

class EmptyDataTable extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'enable', type: 'boolean', label: '是否开启' },
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
      {
        name: 'dateMultiple',
        type: 'date',
        label: 'date多值',
        multiple: ',',
        required: true,
      }
    ],
  });

  handleQuery = (props) => {
    console.log('handleQuery', props);
  };

  handleReset = (props) => {
    console.log('handleReset', props);
  };

  render() {
    const tableRef = React.createRef();
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        width: 70,
        fixed: true,
      },
      {
        title: '姓',
        dataIndex: 'lastName',
        key: 'lastName',
        width: 150,
        hideable: false,
      },
      {
        title: '名',
        dataIndex: 'firstName',
        key: 'firstName',
        width: 150,
      },
      {
        title: '城市',
        dataIndex: 'city',
        key: 'city',
        width: 300,
      },
      {
        title: '街道',
        dataIndex: 'street',
        key: 'street',
        width: 300,
      },
      {
        title: '公司',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 300,
      },
    ];
    
    return (
      <div>
        <PerformanceTable
          rowKey='id'
          // virtualized
          height={400}
          toolbar={{
            header: '表格标题',
            buttons: [
              <Button
                onClick={() => {
                  tableRef.current.scrollTop(0);
                }}
              >
                Scroll top
              </Button>,
            ],
            settings: ['columnFilter'],
          }}
          queryBar={{
            type: 'filterBar',
            defaultExpanded: true,
            queryFields: { name: <TextField placeholder="测试默认值" /> },
            dynamicFilterBar: {
              quickSearch: true,
              searchCode: 'xxx',
              tableFilterAdapter: (props) => {
                console.log('defaultTableFilterAdapter', props);
                const { config, config: { data }, type, searchCode, queryDataSet, tableFilterTransport } = props;
                console.log('defaultTableFilterAdapter config', config);
                const userId = 1;
                const tenantId = 0;
                switch (type) {
                  case 'read':
                    return {
                      // url: `${HZERO_PLATFORM}/v1/${organizationId}/search-config?searchCode=${searchCode}`,
                      url: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/filterlist',
                      method: 'get',
                    };
                  case 'create':
                    return {
                      // url: `${HZERO_PLATFORM}/v1/${organizationId}/search-config/${data[0].searchId}`,
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
            },
            dataSet: this.ds,
            onQuery: this.handleQuery,
            onReset: this.handleReset,
            // onCollapse: this.handleCollapse,
          }}
          columns={columns}
          data={fakeLargeData.slice(0, 20)}
          ref={tableRef}
          onRowClick={data => {
            console.log(data);
          }}
        />
        <Button
          onClick={() => {
            tableRef.current.scrollTop(10000);
          }}
        >
          Scroll top
        </Button>
      </div>
    );
  }
}

ReactDOM.render(
  <EmptyDataTable />,
  mountNode,
);
````
