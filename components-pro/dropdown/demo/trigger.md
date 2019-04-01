---
order: 3
title:
  zh-CN: 触发方式
  en-US: Trigger mode
---

## zh-CN

默认是点击触发菜单，可以移入触发。

## en-US

The default trigger mode is `click`, you can change it to `hover`.

````jsx
import { Menu, Dropdown, Icon, Button } from 'choerodon-ui/pro';

const menu = (
  <Menu>
    <Menu.Item key="0">
      <a href="https://choerodon.io">1st menu item</a>
    </Menu.Item>
    <Menu.Item key="1">
      <a href="https://choerodon.io">2nd menu item</a>
    </Menu.Item>
    <Menu.Divider key="d" />
    <Menu.Item key="2">3rd menu item</Menu.Item>
  </Menu>
);

ReactDOM.render(
  <div>
    <Dropdown overlay={menu} trigger={['hover']}>
      <Button>
        Hover me <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>
  </div>,
  mountNode);
````
