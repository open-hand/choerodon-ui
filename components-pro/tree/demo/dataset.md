---
order: 0
title:
  zh-CN: 绑定数据源
  en-US: DataSet
---

## zh-CN

绑定数据源。

## en-US

DataSet.

````jsx
import { DataSet, Tree } from 'choerodon-ui/pro';

function nodeRenderer({ record }) {
  return record.get('text');
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    queryUrl: '/tree.mock',
    autoQuery: true,
    parentField: 'parentId',
    expandField: 'expand',
    idField: 'id',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'expand', type: 'boolean' },
      { name: 'parentId', type: 'number' },
    ],
    events: {
      select: ({ record, dataSet }) => console.log('select', record, dataSet),
      unSelect: ({ record, dataSet }) => console.log('unSelect', record, dataSet),
    },
  });

  render() {
    return (
      <Tree
        showLine={{
          showLeafIcon: false
        }}
        showIcon={false}
        dataSet={this.ds}
        checkable
        renderer={nodeRenderer}
      />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
