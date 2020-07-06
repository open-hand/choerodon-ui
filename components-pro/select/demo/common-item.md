---
order: 15
title:
  zh-CN: 常用项
  en-US: Common Item
---

## zh-CN

常用项。

## en-US

Common Item

````jsx
import { DataSet, Select } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { Option } = Select;

const data = [{
  user: 'wu',
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'user', type: 'string', textField: 'text', label: '用户' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Select maxCommonTagTextLength={5} style={{ width: 300 }} dataSet={this.ds} name="user" commonItem={['jack', 'wu', 'jack22222aaa']}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="jack22222aaa">Kack22222aaasss</Option>
        <Option value="wu">Wu</Option>
      </Select>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
