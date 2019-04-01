---
order: 6
title:
  zh-CN: 过滤
  en-US: Filter
---

## zh-CN

通过属性`opyionsFilter`过滤选项。

## en-US

Through the property `opyionsFilter` the options will be filtered.

````jsx
import { DataSet, Select } from 'choerodon-ui/pro';

const { Option } = Select;

function optionsFilter(record) {
  return record.get('meaning').toLowerCase().indexOf('a') !== -1;
}

const data = [{
  'last-name': 'huazhen',
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'last-name', type: 'string', label: '姓' },
    ],
  });

  render() {
    return (
      <Select dataSet={this.ds} name="last-name" optionsFilter={optionsFilter}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="huazhen">Huazhen</Option>
      </Select>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
