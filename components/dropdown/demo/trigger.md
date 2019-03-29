---
order: 3
title:
  zh-CN: 触发方式
  en-US: Trigger mode
---

## zh-CN

默认是移入触发菜单，可以点击触发。

## en-US

The default trigger mode is `hover`, you can change it to `click`.

````jsx
import { Menu, Dropdown, Icon, Button } from 'choerodon-ui';

const menu = (
  <Menu>
    <Menu.Item key="0">
      <a href="https://choerodon.io/">1st menu item</a>
    </Menu.Item>
    <Menu.Item key="1">
      <a href="https://choerodon.io/">2nd menu item</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3">3rd menu item</Menu.Item>
  </Menu>
);

ReactDOM.render(
  <div>
    <Dropdown overlay={menu} trigger={['click']}>
      <a className="c7n-dropdown-link" href="#">
        Click me <Icon type="arrow_drop_down" />
      </a>
    </Dropdown>
    <Dropdown overlay={menu} trigger="click">
      <Button shape="circle" icon="more_vert" />
    </Dropdown>
  </div>,
  mountNode);
````
