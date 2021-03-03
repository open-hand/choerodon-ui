---
order: 13
title:
  zh-CN: optionRenderer 输入属性
  en-US: optionRenderer Input Property
---

## zh-CN

使用`optionRenderer`属性。

## en-US

Use `optionRenderer` input property.

```jsx
import { DataSet, Select, Button, Row, Col, Menu, Tooltip, Icon } from 'choerodon-ui/pro';

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

  const renderer = ({ text }) => (
    <div style={{ width: '100%' }}>
      {text && <Icon type="people" />} {text}
    </div>
  );

  const optionRenderer = ({ text }) => (
    <Tooltip title={text} placement="left">
      {renderer({ text })}
    </Tooltip>
  );

  return (
    <Row gutter={10}>
      <Col span={8}>
        <Select dataSet={ds} name="user" optionRenderer={optionRenderer} renderer={renderer} />
      </Col>
    </Row>
  );
};

ReactDOM.render(<App />, mountNode);
```
