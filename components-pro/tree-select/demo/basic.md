---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

树形选择器。

## en-US

ThreeSelect

```jsx
import { TreeSelect, Button, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[basic new]', value, '[basic old]', oldValue);
}

const { TreeNode } = TreeSelect;

class App extends React.Component {
  state = {
    visible: true,
  };

  handleClick = () => this.setState({ visible: !this.state.visible });

  render() {
    return (
      <Row gutter={10}>
        <Col span={8}>
          <TreeSelect  showLine={{ showLeafIcon: false }} placeholder="请选择" onChange={handleChange} treeDefaultExpandAll>
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0" selectable={false}>
                <TreeNode value="leaf1" title="my leaf" />
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              {
                this.state.visible && (
                  <TreeNode value="parent 1-1" title="parent 1-1">
                    <TreeNode value="sss" title={<b style={{ color: '#08c' }}>sss</b>} />
                  </TreeNode>
                )
              }
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={4}>
          <Button onClick={this.handleClick}>修改选项</Button>
        </Col>
        <Col span={12}>
          <TreeSelect placeholder="请选择" disabled>
            <TreeNode value="jack" title="Jack" />
            <TreeNode value="lucy" title="Lucy" />
            <TreeNode value="wu" title="Wu" />
          </TreeSelect>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
