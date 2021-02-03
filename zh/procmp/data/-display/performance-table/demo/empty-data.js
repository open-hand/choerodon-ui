import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';

class EmptyDataTable extends React.Component {
  render() {
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        width: 50,
        resizable: true,
        fixed: true,
      },
      {
        title: '姓名',
        dataIndex: 'firstName',
        key: 'firstName',
        width: 100,
        resizable: true,
        onResize: (columnWidth, dataKey) => {
          console.log(columnWidth, dataKey);
        },
      },
      {
        title: '城市',
        dataIndex: 'city',
        key: 'city',
        width: 300,
        resizable: true,
      },
      {
        title: '街道',
        dataIndex: 'street',
        key: 'street',
        width: 300,
        resizable: true,
      },
      {
        title: '公司',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 300,
        resizable: true,
      },
    ];
    return <PerformanceTable height={400} data={[]} columns={columns} />;
  }
}

ReactDOM.render(<EmptyDataTable />, document.getElementById('container'));
