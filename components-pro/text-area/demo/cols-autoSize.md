---
order: 5
title:
  zh-CN: 控制文本宽高
  en-US: Control text width and height
---

## zh-CN

`resize` 属性控制文本宽高变化。

## en-US

`resize` property controls text width and height.

```jsx
import { TextArea } from 'choerodon-ui/pro';

class App extends React.Component {

  propSize = {
    minRows: 2,
    maxRows: 8,
    minCols: 1,
    maxCols: 2,
  };

  render() {
    return (
      <TextArea
        placeholder="设置宽高适应"
        autoSize={this.propSize}
        resize="both"
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
