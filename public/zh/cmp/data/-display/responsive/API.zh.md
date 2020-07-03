---
title: API
---

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 响应对象队列，与children的renderProps参数及onChange的参数一一对应 | object[] | - |
| disabled | 是否禁用响应 | boolean | - |
| children | 子元素 | ReactNode \| (responsiveItems: any[]) => ReactNode | - |
| onChange | 响应值变更钩子 | (responsiveItems: any[]) => void | - |

## 方法

| 名称 | 描述 |
| --- | --- |
| blur() | 移除焦点 |
| focus() | 获取焦点 |

### BreakPoints

| 键值      | 响应视宽                                     |
|-----------|------------------------------------------|
| xs  |  < 576px | 
| sm  | >= 576px |
| md  | >= 768px |
| lg  | >= 992px | 
| xl  | >= 1200px | 
| xxl | >= 1600px | 
