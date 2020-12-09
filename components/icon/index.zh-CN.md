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

## 如何自定义项目的图标

1. font 库 自定义方式
```css
/* 建立字体文件，设置你新建立的字体名称以及对应的url 地址 */
@font-face
{
font-family: myFirstFont;
src: url('×××.ttf'),
     url('×××.eot'); /* IE9 */
     font-weight: normal;
     font-style: normal;
     font-display: block;
}
/* 设置类名把刚刚确定的字体设置优先级最高 */
.c7ntest1 {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'myFirstFont' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
/* 定义类名使用的字体，利用伪类来实现对应样式的展现 */
.icon-clubs:before {
  content: "\e918";
}
```

```
<Icon style={{color:'green'}} customFontName="myFirstFont" type="maozi" />
```

2. 第二种方案使用svg引用第三方库实现

```
import { Icon } from 'choerodon-ui';
import { createFromIconfontCN } from '@ant-design/icons';
const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2066932_6wpzydfnv8g.js', // 在 iconfont.cn 上生成
});
ReactDOM.render(
  <>
    <MyIcon type="icon-maozi" />
  </>,
  mountNode);
```

具体的方案操作详细查看[choerodon-ui-icon](https://www.yuque.com/docs/share/938b2da6-2066-472d-8d58-ca85990791be?# 《choerodon-ui-icon》)

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
customFontName | 自定义字体库 | string | -

新增功能支持svgIcon: 必须配置scriptUrl属性才能增加这个功能

属性 | 说明 | 类型 | 默认值
-----|-----|-----|------
type | 图标类型 | string | -
width | svg 宽度 | string /| number | -
height | svg 高度 | string /| number | -
scriptUrl | iconfont 生成链接配置 | string /| string[] | -

同时也支持生成自定义icon的方法

```js
import { Icon } from 'choerodon-ui';

const {createFromIconfontCN} = Icon;

const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2066932_o2wp0dratpi.js', // 在 iconfont.cn 上生成
});

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <MyIcon width={32} height={32} type="icon-maozi" />
      </div>
    );
  }
}

```


<style>
.c7n-icon-block {
  display: inline-block;
  width: 200px;
  text-align: center;
  font-size: 14px;
}
.c7n-icon-block .icon {
  line-height: 80px;
  transition: font-size .2s;
}
</style>
