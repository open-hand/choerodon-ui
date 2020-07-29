import React  from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';

class AffixHorizontalScrollbarTable extends React.Component {
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
        align: "center",
        fixed: true,
      },
      {
        title: '姓名',
        dataIndex: 'firstName',
        key: 'firstName',
        width: 130,
        resizable: true,
        onResize: (columnWidth, dataKey) => {
          console.log(columnWidth, dataKey);
        },
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
      <div>
        <div style={{ height: 500 }}>
          <hr />
          <p style={{ textAlign: 'center' }}>⬇️ Scroll down the page ⬇️</p>
          <hr />
        </div>
        <PerformanceTable
          height={400}
          autoHeight
          affixHeader
          affixHorizontalScrollbar
          data={this.state.data}
          columns={columns}
          onRowClick={data => {
            console.log(data);
          }}
        />
        <div style={{ height: 2000 }}>
          <hr />
        </div>
      </div>
    );
  }
}
ReactDOM.render(<AffixHorizontalScrollbarTable />, document.getElementById('container'));
