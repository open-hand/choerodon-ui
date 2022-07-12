---
order: 10
title:
  zh-CN: optionRenderer 输入属性
  en-US: optionRenderer Input Property
---

## zh-CN

使用`optionRenderer`属性。

## en-US

Use `optionRenderer` input property.

```jsx
import { DataSet, Cascader, Tooltip, Icon } from 'choerodon-ui/pro';

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

  renderer = ({ text }) => (
    <div style={{ width: '100%' }}>
      {text && <Icon type="badge" />} {text}
    </div>
  );

  optionRenderer = ({ text }) => (
    <Tooltip title={text} placement="left">
      {this.renderer({ text })}
    </Tooltip>
  );

  render() {
    return (
      <Cascader
          dataSet={this.ds}
          name="id"
          searchable
          optionRenderer={this.optionRenderer}
          renderer={this.renderer}
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
