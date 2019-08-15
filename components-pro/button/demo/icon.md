---
order: 3
title:
  zh-CN: 图标按钮
  en-US: icon
---

## zh-CN

为按钮增加图标。


## en-US

Buttons display mode, flat and raised, default raised.


````jsx
import { Button, Icon } from 'choerodon-ui/pro';

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Button icon="save">{false}</Button>
        <Button><Icon type="save" /></Button>
        <Button funcType="flat" color="primary" icon="save">保存</Button>
        <Button icon="sync" />
        <Button funcType="flat" icon="sync" />
        <Button funcType="flat" icon="search" color="primary" />
        <Button funcType="flat" icon="close" style={{ color: '#e12330' }} disabled />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode);

````
