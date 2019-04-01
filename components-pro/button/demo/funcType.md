---
order: 0
title:
  zh-CN: 按钮展现模式
  en-US: funcType
---

## zh-CN

按钮的展现模式，有flat和raised两种，默认为raised。


## en-US

Buttons display mode, flat and raised, default raised.


````jsx
import { Button } from 'choerodon-ui/pro';

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Button>默认raised按钮</Button>
        <Button funcType="flat">flat按钮</Button>
        <Button funcType="raised">raised按钮</Button>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode);

````
