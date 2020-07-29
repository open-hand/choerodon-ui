import React  from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';

class FixedColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeDataForColSpan
    };
  }

  render() {
    const columns = [
        {
          title: 'Id',
          dataIndex: 'id',
          key: 'id',
          width: 70,
          align: "center",
          fixed: true,
        },
        {
          title: '姓',
          dataIndex: 'lastName',
          key: 'lastName',
          width: 130,
          fixed: true,
          colSpan: 2,
          resizable: true,
        },
        {
          title: '名',
          dataIndex: 'firstName',
          key: 'firstName',
          width: 130,
          resizable: true,
          fixed: true,
        },
        {
          title: '城市',
          dataIndex: 'city',
          key: 'city',
          width: 200,
          colSpan: 2,
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
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email',
          width: 300,
        },
       ];
    return (
        <PerformanceTable
          bordered
          height={400}
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
