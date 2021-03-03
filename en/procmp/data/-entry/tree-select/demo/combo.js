import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TreeSelect, Row, Col } from 'choerodon-ui/pro';

function handleChange(value) {
  console.log('[combo]', value);
}

const { TreeNode } = TreeSelect;

class App extends React.Component {
  state = {
    value: 'fox',
  };

  ds = new DataSet({
    autoCreate: true,
    fields: [{ name: 'name', defaultValue: 'fox2' }],
  });

  handleChange = (value) => {
    console.log('[combo]', value);
    this.setState({
      value,
    });
    this.ds.current.set('name', value);
  };

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <TreeSelect
            placeholder="复合"
            onChange={this.handleChange}
            combo
            value={this.state.value}
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect
            dataSet={this.ds}
            name="name"
            placeholder="复合+可搜索"
            onChange={handleChange}
            combo
            searchable
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
              </TreeNode>
            </TreeNode>
          </TreeSelect>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
