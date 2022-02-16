import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable, Icon } from 'choerodon-ui/pro';

class TreeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeTreeData,
    };
  }

  render() {
    const { data } = this.state;
    const columns = [
      {
        title: 'Key',
        dataIndex: 'key',
        width: 100,
      },
      {
        title: 'Label (Tree Col)',
        dataIndex: 'labelName',
        flexGrow: 1,
        treeCol: true,
      },
      {
        title: 'Status',
        width: 100,
        dataIndex: 'status',
      },
      {
        title: 'Count',
        width: 100,
        dataIndex: 'count',
      },
    ];
    return (
      <div>
        <PerformanceTable
          isTree
          virtualized
          minHeight={260}
          height={400}
          data={data}
          columns={columns}
          defaultExpandedRowKeys={[0]}
          onExpandChange={(expanded, rowData) => {
            console.log(expanded, rowData);
          }}
          renderTreeToggle={(icon, rowData, expanded) => {
            if (rowData.labelName === '手机') {
              return <Icon type="cancel" />;
            }
            return icon;
          }}
        />
      </div>
    );
  }
}

ReactDOM.render(<TreeTable />, document.getElementById('container'));
