---
category: Components
subtitle: 图标
type: General
title: Icon
cols: 1
toc: false
---

语义化的矢量图形。

## 图标的命名规范

我们为每个图标赋予了语义化的命名，命名规则如下:

- 实心和描线图标保持同名，用 `-o` 来区分，比如 `question-circle`（实心） 和 `question-circle-o`（描线）；
- 命名顺序：`[图标名]-[形状?]-[描线?]-[方向?]`。

> `?` 为可选。

完整的图标设计规范请访问 [图标规范](/docs/spec/icon)。

## 如何使用

使用 `<Icon />` 标签声明组件，指定图标对应的 type 属性，示例代码如下:

```html
<Icon type="add_location" />
```

## 图标列表

> 点击图标复制代码。

```__react
import IconSet from 'site/theme/template/IconSet';
ReactDOM.render(<IconSet className="icons" />, mountNode);
```

## API

由于图标字体本质上还是文字，可以使用 `style` 和 `className` 设置图标的大小和颜色。

```jsx
<Icon type="add_location" style={{ fontSize: 16, color: '#08c' }} />
```

图标的属性说明如下：

属性 | 说明 | 类型 | 默认值
-----|-----|-----|------
type | 图标类型 | string | -

<style>
.ant-icon-block {
  display: inline-block;
  width: 200px;
  text-align: center;
  font-size: 14px;
}
.ant-icon-block .icon {
  line-height: 80px;
  transition: font-size .2s;
}
</style>
