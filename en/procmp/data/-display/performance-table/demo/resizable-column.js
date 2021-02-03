import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';

class ResizableColumnTable extends React.Component {
  constructor(props) {
    super(props);
    const data = fakeData.filter((v, i) => i < 8);
    this.state = {
      data,
    };
  }

  render() {
    const { data } = this.state;
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
        width: 400,
        resizable: true,
      },
      {
        title: '街道',
        dataIndex: 'street',
        key: 'street',
        width: 400,
        resizable: true,
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
        <PerformanceTable columns={columns} height={400} data={data} />
      </div>
    );
  }
}

ReactDOM.render(<ResizableColumnTable />, document.getElementById('container'));
