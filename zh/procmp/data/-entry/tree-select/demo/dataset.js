import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TreeSelect } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

const { TreeNode } = TreeSelect;

const data = [
  {
    user: 'leaf1',
  },
];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'user', type: 'string', textField: 'text', label: '用户' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <TreeSelect dataSet={this.ds} name="user">
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
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
