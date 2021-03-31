---
order: 7
title:
  zh-CN: 可搜索
  en-US: searchable
---

## zh-CN

可搜索

## en-US

searchable

```jsx
import { DataSet, Cascader} from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class App extends React.Component {
  optionDs = new DataSet({
    queryUrl: '/tree-less.mock',
    autoQuery: true,
    selection: 'mutiple',
    parentField: 'parentId',
    idField: 'id',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'expand', type: 'boolean' },
      { name: 'parentId', type: 'string' },
    ],
  });

  ds = new DataSet({
    autoCreate:true,
    fields: [
      {
        name: 'id',
        type: 'string',
        textField: 'text',
        defaultValue:["2", "7"],
        valueField: 'id',
        label: '部门',
        options: this.optionDs,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

 dsChangeOnSelect = new DataSet({
    autoCreate:true,
    fields: [
      {
        name: 'id',
        type: 'string',
        textField: 'text',
        defaultValue:["2", "7"],
        valueField: 'id',
        label: '部门',
        options: this.optionDs,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <>
        <Cascader
            searchable
            dataSet={this.ds}
            name="id"
        />
        <Cascader
            searchable
            changeOnSelect
            dataSet={this.dsChangeOnSelect}
            name="id"
        />
      </>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
