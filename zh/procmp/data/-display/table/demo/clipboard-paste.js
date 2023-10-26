import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

const App = () => {
  const ds = useMemo(
    () =>
      new DataSet({
        primaryKey: 'userid',
        queryUrl:
          'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/sortUser',
        pageSize: 10,
        dataKey: 'rows',
        autoQuery: true,
        // 配置开启组合排序
        combineSort: true,
        queryFields: [
          { name: 'name', type: 'string', label: '姓名' },
          { name: 'age', type: 'number', label: '年龄' },
          { name: 'email', type: 'email', label: '邮箱' },
        ],
        fields: [
          { name: 'userid', type: 'string', label: '编号', required: true },
          { name: 'name', type: 'string', label: '姓名' },
          { name: 'dept', type: 'string', label: '部门' },
          { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
          { name: 'email', type: 'email', label: '邮箱' },
          { name: 'userStatus', type: 'boolean', label: '员工状态' },
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
          { name: 'enable', type: 'boolean', label: '是否开启' },
        ],
        events: {
          query: ({ params, data }) => {
            // 组合排序模式下，排序参数以数组形式传递到后端
            console.log('advanced bar query parameter', params, data);
            return true;
          },
        },
      }),
    [],
  );

  const command = [
    <Button key="edit" funcType="link">
      禁用
    </Button>,
    <Button key="opera" funcType="link">
      启用
    </Button>,
  ];

  const columns = useMemo(() => {
    return [
      { name: 'name', editor: true },
      {
        name: 'dept',
        editor: true,
        renderer: ({ record }) =>
          record?.get('age') > 45 ? '行政部' : '研发部',
      },
      {
        name: 'userStatus',
        renderer: ({ record }) => {
          if (record?.get('age') < 26) {
            return <Tag color="yellow">待入职</Tag>;
          } else if (record?.get('age') < 50) {
            return <Tag color="blue">在职</Tag>;
          }
          return <Tag color="gray">离职</Tag>;
        },
      },
      { name: 'age', editor: true, sortable: true },
      { name: 'sex', editor: true, sortable: true },
      {
        name: 'email',
        editor: true,
        renderer: ({ value }) => value + '@hand-china.com',
      },
      {
        name: 'enable',
        editor: true,
        renderer: ({ record }) => enableRender(record?.get('enable') ? 1 : 0),
      },
      {
        header: '操作',
        width: 150,
        lock: 'right',
        command: command,
      },
    ];
  }, []);

  return (
    <Table
      border
      buttons={['add', 'delete', 'export']}
      customizedCode="sortTable"
      rowNumber
      customizable
      clipboard={{ paste: true, copy: true }}
      dataSet={ds}
      columns={columns}
      queryBar="filterBar"
    />
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
