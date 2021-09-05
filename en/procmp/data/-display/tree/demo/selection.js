import React from 'react';
import ReactDOM from 'react-dom';
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
      unSelect: ({ record, dataSet }) =>
        console.log('unSelect', record, dataSet),
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
              draggable
              showIcon
              renderer={nodeRenderer}
            />
          </Col>
          <Col span={12}>
            <Button
              onClick={() => console.log('this.ds.selected', this.ds.selected)}
            >
              selected
            </Button>
          </Col>
        </Row>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
