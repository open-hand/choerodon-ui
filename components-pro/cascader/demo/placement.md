---
order: 9
title:
  zh-CN: 弹出位置
  en-US: popupPlacement
---

## zh-CN

可以设置弹出位置: bottomLeft \| bottomRight \| topLeft \| topRight

## en-US

popupPlacement: `bottomLeft` \| `bottomRight` \| `topLeft` \| `topRight`

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
    }],
  }],
}];

function onChange(value) {
  console.log(value);
}

ReactDOM.render(
  <Cascader
    value={["zhejiang", "hangzhou", "xihu"]}
    options={options} onChange={onChange}
    placeholder="Please select"
    popupPlacement="bottomRight"
  />,
  mountNode);
```
