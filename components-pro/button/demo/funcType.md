---
order: 0
title:
  zh-CN: 按钮展现模式
  en-US: funcType
---

## zh-CN

按钮的展现模式，有flat、raised和link三种，默认为raised。


## en-US

Buttons display mode, flat raised and link, default raised.


````jsx
import { Button } from 'choerodon-ui/pro';

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Button>默认raised按钮</Button>
        <Button funcType="flat">flat按钮</Button>
        <Button funcType="raised">raised按钮</Button>
        <Button funcType="link">link按钮</Button>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode);

````
