---
order: 2
title:
  zh-CN: 按钮不可选择
  en-US: disabled
---

## zh-CN

按钮能否选择，默认为false。


## en-US

Buttons display mode, flat and raised, default raised.


````jsx
import { Button } from 'choerodon-ui/pro';

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Button>默认可选择按钮</Button>
        <Button disabled>不可选择按钮</Button>
        <Button color="primary" disabled>不可选择按钮</Button>
        <Button funcType="flat" color="primary" disabled>不可选择按钮</Button>
        <Button funcType="flat" icon="save" disabled />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode);

````
