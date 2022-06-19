---
order: 4
title:
  zh-CN: 适应文本高度
  en-US: Adapt text height
---

## zh-CN

`autoSize` 属性默认只有高度会自动变化。另外 `autoSize` 可以设定为一个对象，指定最大最小行列数。

## en-US

The `autoSize` property defaults to the fact that only the height changes automatically. In addition, `autoSize` can be set as an object, specifying the maximum and minimum number of rows and columns.

```jsx
import { TextArea } from 'choerodon-ui/pro';

class App extends React.Component {

  render() {
    return (
      <TextArea
        placeholder="适应文本高度"
        defaultValue="适应文本高度适应文本高1度适应文本高度适应文本高度适应文本高度适应文本高度适应文本高度适应文本高度适应文本高度适应文本高度适应文本高度适应文本高度适应文本高度应文本高度适应文本应文本高度适应文本应文本高度适应文本应文本高度适应文本"
        autoSize={{ minRows: 2, maxRows: 8 }}
        resize
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
