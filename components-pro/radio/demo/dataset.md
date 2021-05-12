---
order: 2
title:
  zh-CN: 绑定数据源
  en-US: DataSet Binding
---

## zh-CN

绑定数据源

## en-US

DataSet Binding

````jsx
import { DataSet, Radio } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue);
}

const data = [{ bind: 'A' }];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'bind' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <form>
        <Radio dataSet={this.ds} name="bind" value="A">A</Radio>
        <Radio dataSet={this.ds} name="bind" value="B">B</Radio>
        <Radio dataSet={this.ds} name="bind" value="C">C</Radio>
      </form>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
