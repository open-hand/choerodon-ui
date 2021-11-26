---
order: 6
title:
  zh-CN: 排序
  en-US: sortable
---

## zh-CN

可以上下排序，并可以自定义上下按钮

## en-US

You can sort up and down, and customize the up and down buttons.

````jsx
import { DataSet, Transfer } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, '[record.get(name)]', record.get(name));
}

const { Option } = Transfer;

const optionData = [
  { text: 'Jack', value: 'jack' },
  { text: 'Huazhen', value: 'huazhen' },
  { text: 'Lucy', value: 'lucy' },
  { text: 'Niu', value: 'jiaqin' },
  { text: 'Shao', value: 'shao' },
];

const data = [{
  'first-name': 'huazhen',
  'last-name': 'wu',
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
      { name: 'last-name', type: 'string', label: '姓' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <div>
        <Transfer dataSet={this.ds} name="first-name" sortable/>
        <Transfer dataSet={this.ds} name="last-name" sortable searchable>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="wu">Wu</Option>
        </Transfer>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
