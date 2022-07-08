---
order: 2
title:
  zh-CN: 绑定数据源
  en-US: DataSet Binding
---

## zh-CN

绑定数据源。

## en-US

DataSet Binding

````jsx
import { DataSet, Segmented } from 'choerodon-ui/pro';

const { Option } = Segmented;

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, '[record.get(name)]', record.get(name));
  console.log(record.toJSONData())
}

const optionData = [
  { text: 'Jack', value: 'jack' },
  { text: 'Huazhen', value: 'huazhen' },
  { text: 'Lucy', value: 'lucy' },
  { text: 'Niu', value: 'jiaqin' },
  { text: 'Shao', value: 'shao' },
];

const data = [{
  'first-name': 'lucy',
}];

class App extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
    data,
    fields: [
      { name: 'first-name', type: 'string', label: '名', textField: 'text', valueField: 'value', options: this.optionDs },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  handleOnOption = ({record}) => {
    return {
      disabled: record.get('value') === 'lucy',
    };
  }

  render() {
    return (
      <Segmented dataSet={this.ds} name="first-name" onOption={this.handleOnOption} />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
