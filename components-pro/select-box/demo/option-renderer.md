---
order: 8
title:
  zh-CN: optionRenderer 输入属性
  en-US: optionRenderer Input Property
---

## zh-CN

使用`optionRenderer`属性。

## en-US

Use `optionRenderer` input property.

```jsx
import { DataSet, SelectBox, Button, Menu, Tooltip, Icon } from 'choerodon-ui/pro';

const Item = Menu.Item;

const App = () => {
  const optionDs = new DataSet({
    selection: 'single',
    queryUrl: '/dataset/user/queries',
    autoQuery: true,
    paging: false,
  });

  const ds = new DataSet({
    fields: [
      {
        name: 'user',
        type: 'string',
        textField: 'name',
        valueField: 'userid',
        label: '用户',
        options: optionDs,
      },
    ],
  });

  const optionRenderer = ({ text }) => (console.log(text),
    <Tooltip title={text} placement="left">
      <span style={{ display: 'inline-block' }}>
        {text && <Icon type="people" />} {text}
      </span>
    </Tooltip>
  );

  return (
    <SelectBox dataSet={ds} name="user" optionRenderer={optionRenderer} />
  );
};

ReactDOM.render(<App />, mountNode);
```
