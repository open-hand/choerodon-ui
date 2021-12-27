---
order: 5
title:
  zh-CN: 拖动示例
  en-US: draggable
---

## zh-CN

将节点拖拽到其他节点内部或前后。

## en-US

Drag treeNode to insert after the other treeNode or insert into the other parent TreeNode.

```jsx
import { Tree, SelectBox, Form } from 'choerodon-ui/pro';

const { TreeNode } = Tree;
const { Option } = SelectBox;

const x = 3;
const y = 2;
const z = 1;
const gData = [];

const generateData = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || gData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

const draggableValues = [
  {
    title: 'true',
    value: true,
  },
  {
    title: 'false',
    value: false,
  },
  {
    title: "(node) => node.title !== '0-0-0'",
    value: (node) => {
      console.log('node info:', node);
      return node.title !== '0-0-0';
    },
  },
  {
    title: '{nodeDraggable: true, icon: true}',
    value: {
      // boolean or node => boolean, same to draggable
      nodeDraggable: true,
      // boolean or ReactNode
      icon: true,
    },
  },
  {
    title: '{nodeDraggable: true, icon: ReactNode}',
    value: {
      // boolean or node => boolean, same to draggable
      nodeDraggable: true,
      // boolean or ReactNode
      icon: <div style={{width: '100%', height: '100%', lineHeight: '24px', textAlign: 'center', border: '1px solid green'}}>🌳</div>,
    },
  },
];

class Demo extends React.Component {
  state = {
    gData,
    expandedKeys: ['0-0', '0-0-0', '0-0-0-0'],
    draggable: true,
    title: '全部允许',
  };

  onDragEnter = info => {
    console.log(info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  };

  onDrop = info => {
    console.log(info);
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    // const dragNodesKeys = info.dragNodesKeys;
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...this.state.gData];
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    if (info.dropToGap) {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    } else {
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj);
      });
    }
    this.setState({
      gData: data,
    });
  };

  render() {
    const { draggable, title } = this.state;
    const loop = data =>
      data.map(item => {
        if (item.children && item.children.length) {
          return (
            <TreeNode key={item.key} title={item.key}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.key} title={item.key} />;
      });
    return (
      <>
        <Form labelAlign="left">
          <SelectBox vertical label="draggable" value={title} onChange={title => {
            draggableValues.forEach(item => {
              if (item.title === title) this.setState({draggable: item.value, title: title})
            });
          }}>
            {draggableValues.map(({title}) => {
              return <Option value={title}>
              {title}
            </Option>;
            })}
          </SelectBox>
        </Form>
        <Tree
          className="draggable-tree"
          defaultExpandedKeys={this.state.expandedKeys}
          draggable={draggable}
          onDragEnter={this.onDragEnter}
          onDrop={this.onDrop}
        >
          {loop(this.state.gData)}
        </Tree>
      </>
    );
  }
}

ReactDOM.render(<Demo />, mountNode);
```

```css
/* You can add the following CSS to your project to make draggable area bigger */
#components-tree-demo-draggable .draggable-tree .c7n-tree-node-content-wrapper {
  width: calc(100% - 18px);
}
```