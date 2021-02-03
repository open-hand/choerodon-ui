import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';

class FluidColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData,
    };
  }

  render() {
    const { data } = this.state;
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
        width: 100,
        fixed: true,
      },
      {
        title: '名',
        dataIndex: 'firstName',
        key: 'firstName',
        width: 130,
        resizable: true,
        sortable: true,
      },
      {
        title: (
          <span>
            城市 <code>flexGrow: 1 </code>
          </span>
        ),
        dataIndex: 'city',
        key: 'city',
        flexGrow: 1,
        sortable: true,
      },
      {
        title: (
          <span>
            公司 <code>flexGrow: 2</code>
          </span>
        ),
        dataIndex: 'companyName',
        key: 'companyName',
        flexGrow: 2,
        sortable: true,
      },
    ];
    return (
      <PerformanceTable
        height={400}
        data={data}
        columns={columns}
        onSortColumn={(sortColumn, sortType) => {
          console.log(sortColumn, sortType);
        }}
      />
    );
  }
}

ReactDOM.render(<FluidColumnTable />, document.getElementById('container'));
