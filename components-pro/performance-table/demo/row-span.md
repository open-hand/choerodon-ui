---
order: 12
title:
  zh-CN: 复杂行合并
  en-US: Complex row merge
---

## zh-CN

复杂行合并。

## en-US

Complex row merge

````jsx
import '../../../components-pro/performance-table/style/index.less';
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';
import { Button, PerformanceTable, useModal } from 'choerodon-ui/pro';

const rowSpan2 = [
  [1, 3, 5, 7, 9, 11],
  [2, 4, 6, 8, 10, 12],
];

const rowSpan3 = [
  [1, 4, 7, 10],
  [2, 3, 5, 6, 8, 9, 11, 12],
];

const rowSpan4 = [
  [1, 5, 9],
  [2, 3, 4, 6, 7, 8, 10, 11, 12],
];

const rowSpanObj = {
  rowSpan2, rowSpan3, rowSpan4,
};

const handleCell = (rowIndex, rowSpan) => {
  const index = rowIndex + 1;
  const rowSpanItem = rowSpanObj[`rowSpan${rowSpan}`];
  const [arr1, arr2] = rowSpanItem;
  if (arr1.includes(index)) {
    return { rowSpan };
  }
  if (arr2.includes(index)) {
    return { rowSpan: 0 };
  }
  return {};
};

const Table = () => {

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      resizable: true,
      fixed: true,
      onCell: ({ rowIndex }) => handleCell(rowIndex, 2),
    },
    {
      title: '姓',
      dataIndex: 'lastName',
      key: 'lastName',
      width: 150,
      onCell: ({ rowIndex }) => handleCell(rowIndex, 2),
    },
    {
      title: '名',
      dataIndex: 'firstName',
      key: 'firstName',
      width: 350,
      onCell: ({ rowIndex }) => handleCell(rowIndex, 4),
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 500,
    },
    {
      title: '街道',
      dataIndex: 'street',
      key: 'street',
      width: 500,
    },
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 500,
    },
    {
      title: '操作1',
      width: 150,
      fixed: 'right',
      render: () => {
        return [
          <Button key="edit" funcType="link">编辑</Button>,
          <Button key="delete" funcType="link">删除</Button>,
        ]
      },
    },
    {
      title: '操作2',
      width: 150,
      fixed: 'right',
      onCell: ({ rowIndex }) => handleCell(rowIndex, 2),
      render: () => {
        return [
          <Button key="edit" funcType="link">编辑</Button>,
          <Button key="delete" funcType="link">删除</Button>,
        ]
      },
    },
    {
      title: '操作3',
      width: 150,
      fixed: 'right',
      onCell: ({ rowIndex }) => handleCell(rowIndex, 2),
      render: () => <>测试超长内容测试超长内容测试超长内容测试超长内容测试超长内容</>,
    },
    // {
    //   title: '操作3',
    //   width: 150,
    //   fixed: 'right',
    //   onCell: ({ rowIndex }) => handleCell(rowIndex, 3),
    //   render: () => {
    //     return [
    //       <Button key="edit" funcType="link">编辑</Button>,
    //       <Button key="delete" funcType="link">删除</Button>,
    //     ]
    //   },
    // }
  ];

  const modal = useModal();

  return (
    <div>
      <PerformanceTable
        showScrollArrow
        rowKey="id"
        customizable
        customizedCode="pre-customized-p"
        columnDraggable
        columnTitleEditable
        columns={columns}
        height={300}
        data={fakeLargeData.slice(0, 12)}
      />
    </div>
  );
};

ReactDOM.render(<Table />,
  mountNode
);
````
