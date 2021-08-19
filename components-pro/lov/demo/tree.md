---
order: 4
title:
  zh-CN: 树形数据
  en-US: Tree Data
---

## zh-CN

树形数据, LovConfig 配置中需要有 treeFlag、parentIdField、idField， 如果配置无法辨别是否是树形， 可以给 tableProps 加上 mode: 'tree'，以及 dataSetProps 加上 parentField 和 idField。

## en-US

Tree Data.

```jsx
import { DataSet, Form, Lov, SelectBox, Row, Col } from 'choerodon-ui/pro';

const { Option } = SelectBox;

class App extends React.Component {
  state = {
    showCheckedStrategy: 'SHOW_ALL',
  };

  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'code',
        type: 'object',
        lovCode: 'LOV_TREE_CODE',
      },
      { name: 'code_code', type: 'string', bind: 'code.code' },
      { name: 'code_description', type: 'string', bind: 'code.description' },
    ],
  });

  ds2 = new DataSet({
    autoCreate: true,
    fields: [
       {
         name: 'code',
         type: 'object',
         lovCode: 'LOV_TREE_CODE',
         multiple: true,
       },
    ],
  });
  
  handleChange = (value) => {
     this.ds2.current.set('code', []);
     this.setState({ showCheckedStrategy: value });
  };

  render() {
    const { showCheckedStrategy } = this.state;
    return (
      <Form>
        <SelectBox value={showCheckedStrategy} onChange={this.handleChange}>
          <Option value="SHOW_CHILD">SHOW_CHILD</Option>
          <Option value="SHOW_PARENT">SHOW_PARENT</Option>
          <Option value="SHOW_ALL">SHOW_All</Option>
        </SelectBox>
        <Lov dataSet={this.ds2} name="code" showCheckedStrategy={showCheckedStrategy} />
        <Lov dataSet={this.ds} name="code" />
      </Form>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
