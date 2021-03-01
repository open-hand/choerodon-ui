---
category: Pro Components
subtitle: 国际化
cols: 1
type: Other
title: LocaleContext
---

为组件内建文案提供统一的国际化支持。

## 使用

```jsx
import { localeContext } from 'choerodon-ui/pro';
import zh_CN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import 'moment/locale/zh-cn';

localeContext.setLocale(zh_CN);

```

我们提供了英语，英语(美)，中文，日语支持，所有语言包可以在 [这里](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/locale-context/) 找到。

注意：如果你需要使用 UMD 版的 dist 文件，应该引入 `choerodon-ui/pro/dist/choerodon-ui/pro-with-locales.js`，同时引入 moment 对应的 locale，然后按以下方式使用：

```jsx
const { localeContext, locales } = window['choerodon-ui/pro'];

...

localeContext.setLocale(zh_CN);
```
注意：设置 IntlField 多语言输入。注意一般是在整个项目外层设置语言支持，不推荐在业务组件中使用，因为会修改全局的支持情况。

```jsx
import { localeContext } from 'choerodon-ui/pro';

...

localeContext.setSupport({zh_CN: '简体中文',en_GB: 'English',en_US: 'English(US)',ja_JP:'日本語');
```

### 增加语言包

如果你找不到你需要的语言包，欢迎你在 [简体中文语言包](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/locale-context/zh_CN.tsx) 的基础上创建一个新的语言包，并给我们 Pull Request。

## API Methods

| 方法 | 说明 | 参数类型 | 默认值 |
| --- | --- | --- | --- |
| setLocale(locale) | 语言包配置，语言包可到 `choerodon-ui/pro/lib/locale-context/` 目录下寻找 | object | choerodon-ui/pro/lib/locale-context/zh_CN |
| setNumberFormatLanguage(lang) | 数字格式化使用的国际化语言编码，若未设置则使用locale.lang。数字格式化详见[Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) | string |  |
| setSupports(supports) | IntlField支持的可编辑语言，默认可参考ja_JP,en_GB,en_US, zh_CN`choerodon-ui/pro/lib/locale-context/supports`  | object | {zh_CN: '简体中文',en_GB: 'English',en_US: 'English(US)'} |
