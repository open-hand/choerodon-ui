---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic
---

## zh-CN

基本使用

## en-US

Basic usage.

```jsx
import { Mentions } from 'choerodon-ui/pro';

const { Option, getMentions } = Mentions;

function onChange(value) {
  console.log('Change:', value);

  console.log('getMentions: ', getMentions(value));
}

function onSelect(option, prefix) {
  console.log('select:', option, 'prefix:', prefix);
}

ReactDOM.render(
  <Mentions
    style={{ width: '100%' }}
    onChange={onChange}
    onSelect={onSelect}
    defaultValue="@afc163"
  >
    <Option value="afc163">afc163</Option>
    <Option value="zombieJ">zombieJ</Option>
    <Option value="yesmeck">yesmeck</Option>
  </Mentions>,
  mountNode,
);
```
