---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import '../../../components-pro/performance-table/style/index.less';
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';
import { Button, PerformanceTable } from 'choerodon-ui/pro';

const { Column, HeaderCell, Cell } = PerformanceTable;

const Table = () => {
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
        customizable
        customizedCode="pre-customized-p"
        columnDraggable
        columnTitleEditable
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

ReactDOM.render(<Table />,
  mountNode
);
````
