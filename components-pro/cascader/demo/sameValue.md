---
order: 8
title:
  zh-CN: 相同业务值
  en-US: Same business value
---

## zh-CN

相同业务值。

备注: `DataSet` 的 `valueField` 相当于 `id` ，它的值必须不同。但可以设置其他字段存储业务 `value` 。

## en-US

Same business value.

Note: the `valueField` of the `DataSet` corresponds to the `id`, which must be different. However, other fields can be set to store the business `value`.

```jsx
import { Cascader, DataSet } from 'choerodon-ui/pro';

class App extends React.Component {
  data = [
    {
      value: 'zhejiang',
      eventKey: 'zhejiang',
      meaning: 'Zhejiang',
    },
    {
      value: 'hangzhou',
      eventKey: 'hangzhou',
      meaning: 'Hangzhou',
      parentValue: 'zhejiang',
    },
    {
      value: 'xihu',
      eventKey: 'xihu',
      meaning: 'West Lake',
      parentValue: 'hangzhou',
    },
    {
      value: 'jiangsu',
      eventKey: 'jiangsu',
      meaning: 'Jiangsu',
    },
    {
      value: 'nanjing',
      eventKey: 'nanjing',
      meaning: 'Nanjing',
      parentValue: 'jiangsu',
    },
    {
      value: 'zhonghuamen',
      eventKey: 'zhonghuamen',
      meaning: 'Zhong Hua Men',
      parentValue: 'nanjing',
    },
    {
      value: 'beijing-province',
      eventKey: 'beijing',
      meaning: 'Beijing',
    },
    {
      value: 'beijing-city',
      eventKey: 'beijing',
      meaning: 'Beijing',
      parentValue: 'beijing-province',
    },
  ];

  optionDs = new DataSet({
    autoQuery: false,
    selection: 'multiple',
    parentField: 'parentValue',
    idField: 'value',
    fields: [
      { name: 'value', type: 'string' },
      { name: 'eventKey', type: 'string', },
      { name: 'meaning', type: 'string', },
      { name: 'parentValue', type: 'string' },
    ],
    data: this.data,
  });

  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'id',
        type: 'string',
        textField: 'meaning',
        defaultValue: ["zhejiang", "hangzhou", "xihu"],
        valueField: 'value',
        label: '位置',
        options: this.optionDs,
      },
    ],
  });

  onChoose = (value, record) => {
    console.log('onChoose: value: ', value, 'record: ', record, ' eventKey: ', record.get('eventKey'));
  }

  onChange = (value, oldValue) => {
    const eventKeys = this.getEventKeys(value);
    console.log('onChange: value: ', value, 'oldValue: ', oldValue, 'eventKeys: ', eventKeys);
  }

  getEventKeys = (values) => {
    let eventKeys = [];
    if (values && values.length > 0) {
      values.forEach(value => {
        const record = this.optionDs.find(record => record.get('value') === value);
        eventKeys.push(record && record.get('eventKey'));
      });
    }
    return eventKeys;
  }

  render() {
    return (
      <Cascader
        dataSet={this.ds}
        name="id"
        placeholder="Please select"
        searchable
        onChoose={this.onChoose}
        onChange={this.onChange}
      />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode);
```
