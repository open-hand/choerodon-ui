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
import { CheckBox, DataSet } from 'choerodon-ui/pro';

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
        <CheckBox name="rd" disabled>A</CheckBox>
        <CheckBox name="rd" readOnly>B</CheckBox>
        <CheckBox dataSet={this.ds} name="rd" value="C">C</CheckBox>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
