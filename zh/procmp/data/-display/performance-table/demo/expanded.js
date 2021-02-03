import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable, Button } from 'choerodon-ui/pro';

const rowKey = 'id';
const ExpandCell = ({ rowData, dataIndex, expandedRowKeys, onChange }) => (
  <Button
    onClick={() => {
      onChange(rowData);
    }}
    funcType="flat"
    size="small"
  >
    {expandedRowKeys.some((key) => key === rowData[rowKey]) ? '-' : '+'}
  </Button>
);

class ExpandedTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData,
      expandedRowKeys: [0],
    };
    this.handleExpanded = this.handleExpanded.bind(this);
  }
  handleExpanded(rowData, dataKey) {
    const { expandedRowKeys } = this.state;

    let open = false;
    const nextExpandedRowKeys = [];

    expandedRowKeys.forEach((key) => {
      if (key === rowData[rowKey]) {
        open = true;
      } else {
        nextExpandedRowKeys.push(key);
      }
    });

    if (!open) {
      nextExpandedRowKeys.push(rowData[rowKey]);
    }
    this.setState({
      expandedRowKeys: nextExpandedRowKeys,
    });
  }
  render() {
    const { expandedRowKeys, data } = this.state;
    const columns = [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
        width: 70,
        fixed: true,
        render: ({ rowData, dataIndex }) =>
          ExpandCell({
            rowData,
            dataIndex,
            expandedRowKeys,
            onChange: this.handleExpanded,
          }),
      },
      {
        title: '姓',
        dataIndex: 'lastName',
        key: 'lastName',
        width: 150,
        fixed: true,
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
      <PerformanceTable
        height={400}
        data={data}
        rowKey={rowKey}
        expandedRowKeys={expandedRowKeys}
        columns={columns}
        onRowClick={(data) => {
          console.log(data);
        }}
        renderRowExpanded={(rowData) => {
          return (
            <div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  float: 'left',
                  marginRight: 10,
                  background: '#eee',
                }}
              >
                <img src={rowData.avartar} style={{ width: 60 }} />
              </div>
              <p>{rowData.email}</p>
              <p>{rowData.date}</p>
            </div>
          );
        }}
      />
    );
  }
}

ReactDOM.render(<ExpandedTable />, document.getElementById('container'));
