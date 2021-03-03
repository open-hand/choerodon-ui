import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TreeSelect, Row, Col } from 'choerodon-ui/pro';

const { TreeNode } = TreeSelect;

const data = [
  {
    'first-name': 'huazhen',
  },
];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [{ name: 'first-name', readOnly: true }],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <TreeSelect
            name="last-name"
            placeholder="请选择"
            readOnly
            defaultValue="jack"
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode
                  value="sss"
                  title={<b style={{ color: '#08c' }}>sss</b>}
                />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect dataSet={this.ds} name="first-name" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
