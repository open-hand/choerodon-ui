---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

图标选择器。

## en-US

Icon Picker.

````jsx
import { IconPicker } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[datepicker]', value, '[oldValue]', oldValue);
}

ReactDOM.render(
  <IconPicker onChange={handleChange} />,
  mountNode
);
````
