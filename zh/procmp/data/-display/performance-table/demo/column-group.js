import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';

class FixedColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeDataForColSpan,
    };
  }

  render() {
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        width: 70,
        align: 'center',
        verticalAlign: 'middle',
        fixed: true,
      },
      {
        header: '基本信息',
        type: 'ColumnGroup',
        align: 'center',
        verticalAlign: 'middle',
        fixed: true,
        children: [
          {
            title: '姓',
            dataIndex: 'lastName',
            key: 'lastName',
            width: 150,
            resizable: true,
          },
          {
            title: '名',
            dataIndex: 'firstName',
            key: 'firstName',
            width: 150,
            resizable: true,
          },
          {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            resizable: true,
          },
        ],
      },
      {
        title: '公司',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 300,
        verticalAlign: 'middle',
      },
      {
        title: '城市',
        dataIndex: 'city',
        key: 'city',
        width: 300,
        colSpan: 2,
        verticalAlign: 'middle',
        resizable: true,
      },
      {
        title: '街道',
        dataIndex: 'street',
        key: 'street',
        width: 300,
        verticalAlign: 'middle',
        resizable: true,
      },
    ];
    return (
      <PerformanceTable
        bordered
        height={400}
        headerHeight={80}
        data={this.state.data}
        columns={columns}
        onRowClick={data => {
          console.log(data);
        }}
      />
    );
  }
}

ReactDOM.render(<FixedColumnTable />, document.getElementById('container'));
