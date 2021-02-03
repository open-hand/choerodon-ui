import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';

class WordWrapTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData,
    };
  }
  render() {
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        width: 70,
        fixed: true,
      },
      {
        title: '姓名',
        dataIndex: 'firstName',
        key: 'firstName',
        width: 150,
      },
      {
        title: '城市',
        dataIndex: 'city',
        key: 'city',
        width: 200,
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
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: 300,
      },
    ];
    return (
      <PerformanceTable
        wordWrap
        height={400}
        columns={columns}
        data={this.state.data}
        onRowClick={(data) => {
          console.log(data);
        }}
      />
    );
  }
}

ReactDOM.render(<WordWrapTable />, document.getElementById('container'));
