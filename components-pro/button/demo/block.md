---
order: 9
title:
  zh-CN: Block 按钮
  en-US: Block Button
---

## zh-CN

Block 按钮。


## en-US

Block Button.


````jsx
import { Button } from 'choerodon-ui/pro';

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Button funcType="flat" color="primary" block>flat按钮</Button>
        <Button funcType="raised" color="primary" block>raised按钮</Button>
        <Button funcType="link" color="primary" block>link按钮</Button>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode);

````
