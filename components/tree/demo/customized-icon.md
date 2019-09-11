---
order: 6
debug: true
title:
  zh-CN: 自定义图标
  en-US: Customize Icon
---

## zh-CN

可以针对不同节点采用样式覆盖的方式定制图标。

## en-US

You can customize icons for different nodes by styles override.

```jsx
import { Tree, Icon } from 'choerodon-ui';

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
            <TreeNode title="leaf" key="0-0-0-0" icon={<Icon type="airport_shuttle" />} />
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

ReactDOM.render(<Demo />, mountNode);
```

```css
#components-tree-demo-customized-icon .c7n-tree-iconEle.c7n-tree-icon__customize i.icon {
  float: left;
  line-height: 24px;
}
```
