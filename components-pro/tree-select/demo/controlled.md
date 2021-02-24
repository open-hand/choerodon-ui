---
order: 1
title:
  zh-CN: 受控下拉选择器
  en-US: Controlled TreeSelect
---

## zh-CN

受控树选择器。

## en-US

Controlled TreeSelect.

````jsx
import { TreeSelect } from 'choerodon-ui/pro';

const { TreeNode } = TreeSelect;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'parent 1',
      treeDefaultExpandedKeys: ['parent 1', 'parent 1-0'],
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[constrolled]', 'value', value, 'oldValue', oldValue);
    this.setState({
      value,
    });
  }

  render() {
    const { treeDefaultExpandedKeys, value } = this.state;
    return (
      <TreeSelect
        name="last-name" placeholder="请选择" value={value}
        onChange={this.handleChange}
        treeDefaultExpandedKeys={treeDefaultExpandedKeys}
      >
        <TreeNode value="parent 1" title="parent 1">
          <TreeNode value="parent 1-0" title="parent 1-0">
            <TreeNode value="leaf1" title="my leaf" />
            <TreeNode value="leaf2" title="your leaf" />
          </TreeNode>
          <TreeNode value="parent 1-1" title="parent 1-1">
            <TreeNode value="sss" title={<b style={{ color: '#08c' }}>sss</b>} />
          </TreeNode>
        </TreeNode>
      </TreeSelect>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
