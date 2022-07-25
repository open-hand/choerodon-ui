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
import { Radio, DataSet } from 'choerodon-ui/pro';

const data = [{ rd: 'C' }];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'rd', readOnly: true },
    ],
  });

  render() {
    return (
      <form>
        <Radio name="rd" disabled>A</Radio>
        <Radio name="rd2" checked disabled>B</Radio>
        <Radio name="rd" readOnly>C</Radio>
        <Radio dataSet={this.ds} name="rd" value="C">C</Radio>
      </form>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
