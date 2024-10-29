---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
only: true  
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
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      resizable: true,
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
      width: 350,
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
      width: 500,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: rowData => ({
      disabled: rowData.firstName === 'Libbie', // Column configuration not to be checked
      name: rowData.firstName,
    }),
    // columnIndex: 99,
    // fixed: false,
  };

  return (
    <div>
      <PerformanceTable
        useMouseBatchChoose
        virtualized
        rowDraggable
        rowKey="id"
        rowSelection={rowSelection}
        shouldUpdateScroll={false}
        customizable
        customizedCode="pre-customized-p"
        columnDraggable
        columnTitleEditable
        columns={columns}
        height={400}
        data={fakeLargeData.slice(0, 50)}
        onDragEnd={(props) => console.log('onDragEnd', props)}
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
