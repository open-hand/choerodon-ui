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
import { DataSet, Switch } from 'choerodon-ui/pro';

function handleChange({ name, value, oldValue }) {
  console.log(`[dataset:${name}]`, value, '[oldValue]', oldValue);
}

const data = [{
  bind: 'A',
}];

class App extends React.Component {
  ds = new DataSet({
    fields: [
      { name: 'bind', multiple: true },
      { name: 'bind2', type: 'boolean' },
      { name: 'bind3', type: 'boolean', trueValue: ['Y', true, 1], falseValue: 'N' },
    ],
    data,
    events: {
      update: handleChange,
    },
  });

  render() {
    // swds.current.set('bind3', 1);
    window.swds = this.ds;
    return (
      <div>
        <Switch dataSet={this.ds} name="bind" value="A" />
        <Switch dataSet={this.ds} name="bind" value="B" />
        <Switch dataSet={this.ds} name="bind" value="C" />
        <Switch dataSet={this.ds} name="bind2" />
        <Switch dataSet={this.ds} name="bind3" />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
