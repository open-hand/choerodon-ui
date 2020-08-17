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
import { Breadcrumb } from 'choerodon-ui';

const renderLink = ({listItemName}) => {
  return (
    <span>{listItemName}</span>
  )
} 

const data = [
  {
    href: 'http://www.baidu.com/',
    listChildren:renderLink,
    listItemName:'百度',
  },
  {
    href: 'https://www.qq.com/',
    listChildren:renderLink,
    listItemName:'腾讯',
  },
];

ReactDOM.render(
  <Breadcrumb separator='>'>
    <Breadcrumb.Item >首页</Breadcrumb.Item>
    <Breadcrumb.Item menuList={data}>
      <a href=""  >办公用品</a>
    </Breadcrumb.Item>
    <Breadcrumb.Item >
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