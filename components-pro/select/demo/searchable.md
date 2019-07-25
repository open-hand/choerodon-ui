---
order: 7
title:
  zh-CN: 可搜索
  en-US: Searchable
---

## zh-CN

可搜索。

## en-US

Searchable.

````jsx
import { DataSet, Select } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[searchable]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { Option } = Select;

const data = [{
  'last-name': 'huazhen',
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'last-name', type: 'string', label: '姓' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Select dataSet={this.ds} name="last-name" searchable>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="huazhen">Huazhen</Option>
        <Option value="aaa">Huazhen</Option>
      </Select>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
