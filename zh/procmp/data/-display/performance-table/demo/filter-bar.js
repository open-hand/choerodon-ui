import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable, Button, DataSet } from 'choerodon-ui/pro';

const optionData = [
  { text: '男', value: 'M' },
  { text: '女', value: 'F' },
];

const Table = () => {
  const tableRef = React.createRef();
  const [fakeLargeData, setFakeLargeData] = useState([]);
  const optionDs = useMemo(
    () =>
      new DataSet({
        data: optionData,
        selection: 'single',
      }),
    [],
  );

  const ds = useMemo(
    () =>
      new DataSet({
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
            options: optionDs, // 下拉框组件的菜单数据集
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
      }),
    [],
  );

  const handleQuery = (props) => {
    console.log('handleQuery', props);
  };

  const handleReset = (props) => {
    console.log('handleReset', props);
  };

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

  useEffect(() => {
    fetch('../data/fakeLargeData.json')
      .then((response) => response.json())
      .then((data) => {
        setFakeLargeData(data);
      });
  }, []);

  return (
    <div>
      <PerformanceTable
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
          dynamicFilterBar: {
            // suffixes: ['filter'],
            // prefixes: ['filter'],
            // quickSearch: true,
            searchCode: 'xxx',
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
              // const userId = 1;
              // const tenantId = 0;
              switch (type) {
                case 'read':
                  return {
                    // url: `${HZERO_PLATFORM}/v1/${organizationId}/search-config?searchCode=${searchCode}`,
                    url:
                      'https://hzero-test.open.hand-china.com/mock/filterlist',
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
                    url: 'https://hzero-test.open.hand-china.com/mock/listDel',
                    data: data[0],
                    method: 'delete',
                  };
              }
            },
          },
          dataSet: ds,
          onQuery: handleQuery,
          onReset: handleReset,
          // onCollapse: this.handleCollapse,
        }}
        columns={columns}
        height={400}
        data={fakeLargeData.slice(0, 20)}
        ref={tableRef}
        onRowClick={(data) => {
          console.log(data);
        }}
      />
      <br />
      <Button
        onClick={() => {
          tableRef.current.scrollTop(0);
        }}
      >
        Scroll top
      </Button>
    </div>
  );
};

ReactDOM.render(<Table />, document.getElementById('container'));
