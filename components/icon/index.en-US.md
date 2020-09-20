---
category: Components
type: General
title: Icon
cols: 1
toc: false
---

Semantic vector graphics.

## Icons naming convention

We provide semantic name for every icon, and naming rules are as follows:

- Scanning line icon has the similar name with its solid one，but it's distinguished by `-o`, for example, `question-circle` (a full circle) and `question-circle-o` (an empty circle);
- Naming sequence：`[name]-[shape?]-[outline?]-[direction?]`.

> `?` means is optional.

See more design detail at [here](/docs/spec/icon).

## How To Use

Use tag `<Icon />` to create an icon and set its type in the type prop, for example:

```html
<Icon type="add_location" />
```

## How do I customize the project icon

1. The method of customizing by the font file 
```css
/* create the font file and setting a new font name and the address of url */
@font-face
{
font-family: myFirstFont;
src: url('×××.ttf'),
     url('×××.eot'); /* IE9 */
     font-weight: normal;
     font-style: normal;
     font-display: block;
}
/* Set the class name to set the priority of the font just determined */
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
/* Define the font used in the class name, and use pseudo-classes to display the corresponding style */
.icon-clubs:before {
  content: "\e918";
}
```

```
<Icon style={{color:'green'}} customFontName="myFirstFont" type="maozi" />
```

2. The second method is to use the svg with the third party module 
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

 the details of methods is to look here[choerodon-ui-icon](https://www.yuque.com/docs/share/938b2da6-2066-472d-8d58-ca85990791be?# 《choerodon-ui-icon》)



## List of icons

> Click the icon and copy the code。

```__react
import IconSet from 'site/theme/template/IconSet';
ReactDOM.render(<IconSet className="icons" />, mountNode);
```

## API

You can set `style` and `className` for size and color of icons because they are still fonts in essence.

```jsx
<Icon type="add_location" style={{ fontSize: 16, color: '#08c' }} />
```

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| type | Type of choerodon ui icon | string | - |
| customFontName | custom the font  | string | -

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
