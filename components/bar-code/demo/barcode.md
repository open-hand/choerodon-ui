---
order: 1
title:
  zh-CN: 条形码
  en-US: BarCode
---

## zh-CN

条形码

## en-US

BarCode

```jsx
import { BarCode } from 'choerodon-ui';
import { TextField } from 'choerodon-ui/pro';

const App = () => {
  const [text, setText] = React.useState('1234567');

  return (
    <div>
      <BarCode type="bar" value={text || '-'} />
      <br />
      <TextField
        placeholder="-"
        maxLength={60}
        value={text}
        onInput={(e) => setText(e.target.value)}
      />
    </div>
  );
};

ReactDOM.render(<App />, mountNode);
```
