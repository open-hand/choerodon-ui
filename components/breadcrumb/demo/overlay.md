---
order: 5
title:
  zh-CN: 带下拉菜单的面包屑
  en-US: Bread crumbs with drop down menu
---

## zh-CN

面包屑支持下拉菜单。

## en-US

Breadcrumbs support drop down menu.

```jsx
import { Breadcrumb, Menu } from 'choerodon-ui';

const menu = (
  <Menu className='menu-dropdown'>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
        General
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
        Layout
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
        Navigation
      </a>
    </Menu.Item>
  </Menu>
);

ReactDOM.render(
  <Breadcrumb separator='>'>
    <Breadcrumb.Item>首页</Breadcrumb.Item>
    <Breadcrumb.Item>
      <a href="">办公用品</a>
    </Breadcrumb.Item>
    <Breadcrumb.Item overlay={menu}>
      <a href="">办公设备</a>
    </Breadcrumb.Item>
    <Breadcrumb.Item>会议音频视频</Breadcrumb.Item>
  </Breadcrumb>,
  mountNode,
);
```
```css 
.menu-dropdown {
  margin-top:.15rem;
}
```