---
order: 5
title:
  zh-CN: 条形码可选项
  en-US: option BarCode
---

## zh-CN

条形码可选项

## en-US

option BarCode

```jsx
import { BarCode } from 'choerodon-ui';

const option={
    width:3,
    height:50,
    text:'Hi',
    textAlign: "left",
    textPosition: "top",
    textMargin: 15,
    fontSize: 24,
}

ReactDOM.render(<BarCode type="bar" value="123456789" option={option} />, mountNode);
```
