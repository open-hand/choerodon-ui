---
order: 7
title:
  zh-CN: 树形
  en-US: Table Tree
---

## zh-CN

Table Tree

## en-US

Table tree example.

````jsx

import {Icon} from 'choerodon-ui';
import { PerformanceTable } from 'choerodon-ui/pro';
import fakeTreeData from '../../../site/theme/mock/performance-data/treeData';

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
          rowKey='key'
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
              return <Icon type="add" />;
            }
            return icon;
          }}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <TreeTable />,
  mountNode,
);
````
