---
order: 1
title:
  zh-CN: 只使用check功能
  en-US: only need check
---

## zh-CN

dataSet selection 为 false  ， Tree checkable 为 true 可以实现整个treenode点击触发check 。注意：优先级高于record 里面的selectable

## en-US

dataSet selection is false and Tree checkable is true .when treeNode click , it would be checked and selection is higer priority than Record selectable

DataSet.

````jsx
import { DataSet, Tree } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';

function nodeRenderer({ record }) {
  return record.get('text');
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    queryUrl: '/tree-less.mock',
    autoQuery: true,
    expandField: 'expand',
    selection: false,
    checkField: 'ischecked',
    parentField: 'parentId',
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
        <Row>
          <Col span={12}>
            <Tree
              dataSet={this.ds}
              checkable
              showLine
              draggable
              showIcon
              renderer={nodeRenderer}
            />
          </Col>
        </Row>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
