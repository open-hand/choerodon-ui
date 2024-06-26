---
order: 10
title:
  zh-CN: 多值
  en-US: Multiple
---

## zh-CN

通过属性`multiple`设置为多值。

## en-US

Multiple values via property `multiple`.

````jsx
import { DataSet, TreeSelect, Row, Col, SelectBox } from 'choerodon-ui/pro';

const { Option } = SelectBox;

function handleChange(value, oldValue) {
  console.log('[multiple]', value, '[oldValue]', oldValue);
}

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset multiple]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { TreeNode } = TreeSelect;

const data = [{
  user: ['sss'],
}];

class App extends React.Component {
  state = {
    showCheckedStrategy: 'SHOW_ALL',
  };
  
  ds = new DataSet({
    data,
    fields: [
      { name: 'user', type: 'string', textField: 'text', label: '用户', multiple: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });
  
  handleChange = (value) => {
    console.log('handleChange', value)
     this.setState({ showCheckedStrategy: value })
  };

  render() {
    const { showCheckedStrategy } = this.state;
    console.log('showCheckedStrategy', showCheckedStrategy)
    return (
      <Row gutter={10}>
        <Col span={24}>
          <SelectBox value={showCheckedStrategy} onChange={this.handleChange}>
            <Option value="SHOW_CHILD">SHOW_CHILD</Option>
            <Option value="SHOW_PARENT">SHOW_PARENT</Option>
            <Option value="SHOW_ALL">SHOW_All</Option>
          </SelectBox>
        </Col>
        <Col span={24}>
          <TreeSelect
            treeDefaultExpandAll
            treeCheckable
            showCheckedStrategy={showCheckedStrategy}
            dataSet={this.ds} name="user" placeholder="数据源多选"
          >
            <TreeNode value="parent 1" title="parent 1">
              <TreeNode value="parent 1-0" title="parent 1-0">
                <TreeNode value="parent 1-0-3" title="parent 1-0-3" disabled>
                  <TreeNode value="leaf1-3" title="my leaf-3"  />
                  <TreeNode value="leaf2-3" title="your leaf-3" />
                  <TreeNode value="parent 1-0-3-4" title="parent 1-0-3-4">
                    <TreeNode value="leaf1-3-4" title="my leaf-3-4"  />
                    <TreeNode value="leaf2-3-4" title="your leaf-3-4" />
                  </TreeNode>
                </TreeNode>
                <TreeNode value="leaf2" title="your leaf" />
              </TreeNode>
              <TreeNode value="parent 1-1" title="parent 1-1">
                <TreeNode value="sss" title="sss" />
                <TreeNode value="parent 1-1-2" title="parent 1-1-2">
                  <TreeNode value="leaf sss-2" title="leaf sss-2" disabled />
                </TreeNode>
              </TreeNode>
              <TreeNode value="parent 1-2" title="parent 1-2">
                <TreeNode value="leaf rrr" title="leaf rrr" />
              </TreeNode>
            </TreeNode>
            <TreeNode value="parent 2" title="parent 2">
              <TreeNode value="leaf rrr22" title="leaf rrr22" />
            </TreeNode>
          </TreeSelect>
        </Col>
        <Col span={12}>
          <TreeSelect multiple placeholder="多选" onChange={handleChange} defaultValue={['leaf1', 'leaf2', 'sss']}>
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
          <TreeSelect multiple searchable placeholder="多选+搜索" onChange={handleChange} style={{ height: 30 }}>
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
          <TreeSelect multiple combo placeholder="多选+复合" onChange={handleChange}>
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
          <TreeSelect multiple combo searchable placeholder="多选+复合+过滤" onChange={handleChange}>
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
          <TreeSelect multiple placeholder="多选+禁用" disabled defaultValue={['leaf1', 'sss']}>
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
          <TreeSelect multiple placeholder="多选+只读" readOnly defaultValue={['leaf1', 'sss']}>
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

ReactDOM.render(
  <App />,
  mountNode
);
````
