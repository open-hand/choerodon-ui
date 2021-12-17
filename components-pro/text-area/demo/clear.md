---
order: 5
title:
  zh-CN: 清除
  en-US: Clear
---

## zh-CN

可清除输入框

## en-US

Clear TextArea

```jsx
import { TextArea } from 'choerodon-ui/pro';

class App extends React.Component { 
  render() { 
    return (
      <TextArea defaultValue="默认值" 
        placeholder="适应文本高度" 
        rows="4"
        resize="both"
        clearButton
        maxLength={50}
        showLengthInfo
      /> 
    ); 
  } 
} 

ReactDOM.render(<App />, mountNode);
```
