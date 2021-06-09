---
order: 6
title:
  zh-CN: 按钮大小
  en-US: Button Size
---

## zh-CN

按钮大小。


## en-US

Button Size.


````jsx
import { Button } from 'choerodon-ui/pro';

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <div>
          <Button icon="search">默认raised按钮</Button>
          <Button icon="search" size="large">大raised按钮</Button>
          <Button icon="search" size="small">小raised按钮</Button>
        </div>
        <div>
          <Button funcType="flat">flat按钮</Button>
          <Button funcType="flat" size="large">大flat按钮</Button>
          <Button funcType="flat" size="small">小flat按钮</Button>
        </div>
        <div>
          <Button funcType="flat" icon="search" />
          <Button funcType="flat" icon="search" size="large" />
          <Button funcType="flat" icon="search" size="small" />
        </div>
      </div>
    );
  }
}
ReactDOM.render(
  <App />,
  mountNode
);
````
