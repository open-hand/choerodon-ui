---
category: Components
subtitle: 面包屑
type: Navigation
title: Breadcrumb
---

显示当前页面在系统层级结构中的位置，并能向上返回。

## 何时使用

- 当系统拥有超过两级以上的层级结构时；
- 当需要告知用户『你在哪里』时；
- 当需要向上导航的功能时。

## API

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| itemRender | 自定义链接函数，和 react-router 配置使用 | (route, params, routes, paths) => ReactNode |  | - |
| params | 路由的参数 | object |  | - |
| routes | router 的路由栈信息 | object\[] |  | - |
| separator | 分隔符自定义 | string\|ReactNode |  | '/' |


## BreadcrumbItem API

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| separator | 分隔符自定义 | ReactNode |  | - |
| href | 链接地址 | string |  | - |
| overlay | 下拉框内渲染 | object\[] |  | - |
| dropdownProps | 下拉框的属性配置详细请查看基础组件的dropdown | DropDownProps |  | - |
| menuList | 配置横向下拉列表的展示 | object\[] |  | - |
| ListProps | 当使用menulist的渲染 | object\[] |  | - |
| onClick | 点击触发的回调函数| (e) => {} |  | - |


## menuList API

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- |
| listItemName | 列表显示文字 | string |  | - |
| href | 链接地址 | string |  | - |
| listChildren | 可以获取显示文字渲染出想要的展示 | `({ listItemName, href }: { listItemName: string, href: string }) => React.ReactNode`|  | - |
| onClick | 点击触发回调函数 | (e) => {}  |  | - |




> 2.0 之后，`linkRender` 和 `nameRender` 被移除，请使用 `itemRender` 来代替。

### 和 browserHistory 配合

和 react-router 一起使用时，默认生成的 url 路径是带有 `#` 的，如果和 browserHistory 一起使用的话，你可以使用 `itemRender` 属性定义面包屑链接。

```jsx
import { Link } from 'react-router';

const routes = [{
  path: 'index',
  breadcrumbName: '首页'
}, {
  path: 'first',
  breadcrumbName: '一级面包屑'
}, {
  path: 'second',
  breadcrumbName: '当前页面'
}];
function itemRender(route, params, routes, paths) {
  const last = routes.indexOf(route) === routes.length - 1;
  return last ? <span>{route.breadcrumbName}</span> : <Link to={paths.join('/')}>{route.breadcrumbName}</Link>;
}

return <Breadcrumb itemRender={itemRender} routes={routes}/>;
```
