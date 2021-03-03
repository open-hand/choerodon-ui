import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TreeSelect, Button } from 'choerodon-ui/pro';

const { TreeNode } = TreeSelect;

const data = [
  {
    'last-name': 'huazhen',
  },
];

class App extends React.Component {
  state = {
    key: 'a',
  };

  ds = new DataSet({
    data,
    fields: [{ name: 'last-name', type: 'string', label: '姓' }],
  });

  handleClick = () => {
    this.setState({ key: this.state.key === 'a' ? 'm' : 'a' });
  };

  optionsFilter = (record) => {
    return record.get('meaning').toLowerCase().indexOf(this.state.key) !== -1;
  };

  render() {
    return (
      <div>
        <TreeSelect
          dataSet={this.ds}
          name="last-name"
          optionsFilter={this.optionsFilter}
          treeDefaultExpandAll
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
        <Button onClick={this.handleClick}>切换过滤条件</Button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
