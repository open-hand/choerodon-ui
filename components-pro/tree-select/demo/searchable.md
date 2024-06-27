---
order: 7
title:
  zh-CN: 可搜索
  en-US: Searchable
---

## zh-CN

可搜索。

## en-US

Searchable.

```jsx
import { DataSet, TreeSelect, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[searchable]',
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
    'last-name': 'huazhen',
  },
];

function searchMatcher({ record, text }) {
  return record.get('value').indexOf(text) !== -1;
}

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'last-name', type: 'string' },
      { name: 'first-name', type: 'string' },
      { name: 'sex', type: 'string', lookupCode: 'HR.EMPLOYEE_GENDER' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <>
        <Row>
          <Col span={10}>
            <TreeSelect dataSet={this.ds} name="last-name" searchable>
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
          <Col span={10}>
            <TreeSelect dataSet={this.ds} name="last-name" searchable searchFieldInPopup>
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
        <Row>
          <Col span={10}>
            <TreeSelect dataSet={this.ds} name="first-name" searchable searchMatcher={searchMatcher}>
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
          <Col span={10}>
            <TreeSelect dataSet={this.ds} name="sex" searchable searchMatcher="key" />
          </Col>
        </Row>
      </>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
