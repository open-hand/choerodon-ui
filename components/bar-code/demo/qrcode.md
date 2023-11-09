---
order: 0
title:
  zh-CN: 二维码
  en-US: QRCode
---

## zh-CN

二维码

## en-US

QRCode

```jsx
import { TextField } from 'choerodon-ui/pro';
import { BarCode } from 'choerodon-ui';

const App = () => {
  const [text, setText] = React.useState('https://open.hand-china.com/choerodon-ui/zh');

  return (
    <div>
      <BarCode value={text || '-'} />
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
