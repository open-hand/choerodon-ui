---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN

数字输入框。

## en-US

Numeric-only input box.

````jsx
import { InputNumber } from 'choerodon-ui';

const App = () => {
  const [value, setValue] = React.useState(3);

  function onChange(value) {
    console.log('changed', value);
    setValue(value)
  }

  return (
    <InputNumber label="数字" min={1} max={10} value={value} onChange={onChange} />
  )
}

ReactDOM.render(
  <App />,
  mountNode);
````
