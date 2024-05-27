---
order: 5
title:
  zh-CN: 可搜索
  en-US: Searchable
---

## zh-CN

可搜索。

## en-US

Searchable.

````jsx
import { DataSet, Transfer } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[searchable]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { Option } = Transfer;

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
      <Transfer dataSet={this.ds} name="last-name" searchable placeholderOperations={["请搜索", "请搜索右侧"]}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="huazhen">Huazhen</Option>
      </Transfer>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
