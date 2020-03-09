---
order: 2
title:
  zh-CN: 数据绑定
  en-US: Dataset
---

## zh-CN

数据绑定

## en-US

Dataset.

```jsx
import { TextArea, DataSet } from 'choerodon-ui/pro';

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
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'content',
        type: 'string',
        defaultValue: 'textarea',
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <TextArea dataSet={this.ds} name="content" resize="both" />;
  }
}

ReactDOM.render(<App />, mountNode);
```
