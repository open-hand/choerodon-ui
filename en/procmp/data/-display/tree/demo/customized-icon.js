import React from 'react';
import ReactDOM from 'react-dom';
import { Tree, Icon } from 'choerodon-ui/pro';

const TreeNode = Tree.TreeNode;

class Demo extends React.Component {
  onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  render() {
    return (
      <Tree
        showIcon
        showLine
        defaultExpandedKeys={['0-0-0', '0-0-1']}
        defaultSelectedKeys={['0-0-0', '0-0-1']}
        onSelect={this.onSelect}
      >
        <TreeNode title="parent 1" key="0-0">
          <TreeNode title="parent 1-0" key="0-0-0">
            <TreeNode
              title="leaf"
              key="0-0-0-0"
              icon={<Icon type="airport_shuttle" />}
            />
            <TreeNode title="leaf" key="0-0-0-1" />
          </TreeNode>
          <TreeNode title="parent 1-1" key="0-0-1">
            <TreeNode title="leaf" key="0-0-1-0" />
          </TreeNode>
          <TreeNode title="leaf" key="0-0-2" />
        </TreeNode>
      </Tree>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
