---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN

最简单的下拉菜单。

## en-US

The most basic dropdown menu.

````jsx
import { Menu, Dropdown, Icon, Button } from 'choerodon-ui/pro';

const menu = (
  <Menu>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://choerodon.io">1st menu item</a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://choerodon.io">2nd menu item</a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://choerodon.io">3rd menu item</a>
    </Menu.Item>
  </Menu>
);

ReactDOM.render(
  <div>
    <Dropdown overlay={menu}>
      <Button>
        Click me <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>
  </div>,
  mountNode);
````
