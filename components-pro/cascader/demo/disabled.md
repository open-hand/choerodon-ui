---
order: 4
title:
  zh-CN: 选择框禁用
  en-US: menu item disabled
---

## zh-CN

选择框禁用

## en-US

menu item disabled

```jsx
import { Cascader} from 'choerodon-ui/pro';

const options = [{
  value: 'zhejiang',
  meaning: 'Zhejiang',
  children: [{
    value: 'hangzhou',
    meaning: 'Hangzhou',
    children: [{
      value: 'xihu',
      meaning: 'West Lake',
    }],
  }],
}, {
  value: 'jiangsu',
  meaning: 'Jiangsu',
  children: [{
    value: 'nanjing',
    meaning: 'Nanjing',
    children: [{
      value: 'zhonghuamen',
      meaning: 'Zhong Hua Men',
      disabled:true,
    },{
      value:'fuzimiao',
      meaning:'Fu Zi Miao',
    }],
  }],
}];

function onChange(value) {
  console.log(value);
}

ReactDOM.render(
  <Cascader value={["zhejiang", "hangzhou", "xihu"]} options={options} onChange={onChange} placeholder="Please select" />,
  mountNode);
```
