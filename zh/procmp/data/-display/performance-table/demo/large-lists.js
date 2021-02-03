import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable, Button } from 'choerodon-ui/pro';

const LargeListsTable = () => {
  const tableRef = React.createRef();
  const [fakeLargeData, setFakeLargeData] = useState([]);
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
        virtualized
        columns={columns}
        height={400}
        data={fakeLargeData}
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

ReactDOM.render(<LargeListsTable />, document.getElementById('container'));
