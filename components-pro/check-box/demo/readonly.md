---
order: 3
title:
  zh-CN: 只读
  en-US: Read Only
---

## zh-CN

只读。

## en-US

Read Only.

````jsx
import { CheckBox, DataSet, Tooltip } from 'choerodon-ui/pro';

const data = [{ rd: 'C' }];

class App extends React.Component {
  ds = new DataSet({
    fields: [
      { name: 'rd', readOnly: true },
    ],
    data,
  });

  render() {
    return (
      <div>
        <Tooltip title="disabled">
          <CheckBox name="rd" disabled>A</CheckBox>
        </Tooltip>
        <CheckBox name="rd" checked disabled>B</CheckBox>
        <CheckBox name="rd" indeterminate disabled>C</CheckBox>
        <CheckBox name="rd" readOnly>D</CheckBox>
        <CheckBox name="rd" indeterminate readOnly>E</CheckBox>
        <CheckBox dataSet={this.ds} name="rd" value="C">F</CheckBox>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
