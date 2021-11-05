---
category: Pro Components
subtitle: 模态框提供者
type: Feedback
title: ModalProvider
---

模态框提供者。

## 何时使用

## API

### ModalProvider

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| location | 路由的 location 对象。当设定了 location，路由变更时会自动清空所有已打开的 Modal | { pathname: string } |  |
| getContainer | 指定模态框所在的容器, 用于嵌入式模态框, 当为false时取当前ModalProvider的父节点元素。 参考： [/components-pro/modal/#components-pro-modal-demo-embedded](/components-pro/modal/#components-pro-modal-demo-embedded) | false \| () => HTMLElement | () => document.body |
