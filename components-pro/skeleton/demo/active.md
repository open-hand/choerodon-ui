---
order: 2
title:
  zh-CN: 动画效果
  en-US: Active Animation
---

## zh-CN

显示动画效果。

## en-US

Display active animation.

```jsx
import { DataSet, Tree, Skeleton, Button } from 'choerodon-ui/pro';

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
      <>
        <Skeleton height={200} paragraph={{
          rows: 10,
          style: { width: '5rem' },
        }} active dataSet={this.ds} skeletonTitile={false}>
          <Tree
            dataSet={this.ds}
            checkable
            renderer={nodeRenderer}
          />
        </Skeleton>
        <div style={{ padding: '0.1rem 0 0.1rem 0.25rem' }}>
          <Button onClick={() => this.ds.query()}>Show Skeleton </Button>
        </div>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
```
