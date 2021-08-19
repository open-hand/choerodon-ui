---
order: 1
title:
  zh-CN: 只使用 check 功能
  en-US: only need check
---

## zh-CN

Tree selectable 属性设置为 false，checkable 为 true 时可实现点击整个节点触发 onCheck 事件及 DataSet select 相关事件。

## en-US
The Tree `selectable` property is set to `false`, and when `checkable` is `true`, the `onCheck` event and DataSet `select` related events can be triggered by clicking the entire node.

DataSet.

````jsx
import { DataSet, Tree, Button } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';

function nodeRenderer({ record }) {
  return record.get('text');
}

const onCheck = (checkedKeys, e, oldCheckedKeys) => {
  console.log('onCheck', checkedKeys, e, oldCheckedKeys);
};
    
class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'id',
    queryUrl: '/tree-less.mock',
    autoQuery: true,
    expandField: 'expand',
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
              selectable={false}
              onCheck={onCheck}
              dataSet={this.ds}
              checkable
              showLine
              draggable
              showIcon
              renderer={nodeRenderer}
            />
          </Col>
          <Col span={12}>
            <Button onClick={() => console.log('this.ds.selected', this.ds.selected)}>selected</Button>
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
