---
order: 4
title:
  zh-CN: 只读
  en-US: Read Only
---

## zh-CN

只读。

## en-US

Read Only.

````jsx
import { Switch, DataSet } from 'choerodon-ui/pro';

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
        <Switch name="rd" disabled />
        <br />
        <Switch name="rd" readOnly />
        <br />
        <Switch dataSet={this.ds} name="rd" value="C" />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
