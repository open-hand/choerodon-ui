---
category: Pro Components
subtitle: internationalization
cols: 1
type: Other
title: LocaleContext
---

Provide unified internationlization support for component built-incopywriting

## use

```jsx
import { localeContext } from 'choerodon-ui/pro';
import zh_CN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import 'moment/locale/zh-cn';

localeContext.setLocale(zh_CN);

```

we provide the American English，British English ，Chinese，Jappanese，all the language can find here [here](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/locale-context/) 找到。

note：if use want to use  UMD dist file，yuo shuould import `choerodon-ui/pro/dist/choerodon-ui/pro-with-locales.js`，and import moment the locale file，and use like here：

```jsx
const { localeContext, locales } = window['choerodon-ui/pro'];

...

localeContext.setLocale(zh_CN);
```
note：set IntlField support language。usually use it in container project to set the IntlField support . when you change the support in bussiness component it would affect the whole situation 。

```jsx
import { localeContext } from 'choerodon-ui/pro';

...
...

localeContext.setSupport({zh_CN: '简体中文',en_GB: 'English',en_US: 'English(US)',ja_JP:'日本語');
```

### Add the language 

if you can't find the language whitch you want，we are wecome to you can create a package base on [chinese basic package](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/locale-context/zh_CN.tsx) ，and Pull Request。

## API Methods

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| setLocale(locale) | language package can find in `choerodon-ui/pro/lib/locale-context/` | object | choerodon-ui/pro/lib/locale-context/zh_CN |
| setNumberFormatLanguage(lang) | The internationalized language encoding used for number formatting. If not set, locale.lang will be used. For details on number formatting, see [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) | string |  |
| setSupports(supports) | IntlField support language，defaule  ja_JP,en_GB,en_US,zh_CN`choerodon-ui/pro/lib/locale-context/supports`  | object | { zh_CN: '简体中文', en_GB: 'English', en_US: 'English(US)' } |
