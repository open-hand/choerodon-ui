---
order: 0
title: Choerodon UI of React
---

这里是基于 Ant Design@3.4.0 的 Choerodon UI 的 React 实现，开发和服务于企业级后台产品。

## 特性

- 提炼自企业级中后台产品的交互语言和视觉风格。
- 开箱即用的高质量 React 组件。
- 使用 TypeScript 构建，提供完整的类型定义文件。
- 全链路开发和设计工具体系。

## 支持环境

* 现代浏览器和 IE9 及以上（需要 [polyfills](https://ant.design/docs/react/getting-started-cn#兼容性)）。
* 支持服务端渲染。
* [Electron](http://electron.atom.io/)

## 版本

- 稳定版：[![npm package](https://img.shields.io/npm/v/choerodon-ui.svg?style=flat-square)](https://www.npmjs.org/package/choerodon-ui)

## 安装

### 使用 npm 或 yarn 安装

**我们推荐使用 npm 或 yarn 的方式进行开发**，不仅可在开发环境轻松调试，也可放心地在生产环境打包部署使用，享受整个生态圈和工具链带来的诸多好处。

```bash
$ npm install choerodon-ui --save
```

```bash
$ yarn add choerodon-ui
```

如果你的网络环境不佳，推荐使用 [cnpm](https://github.com/cnpm/cnpm)。

### 浏览器引入

在浏览器中使用 `script` 和 `link` 标签直接引入文件，并使用全局变量 `antd`。

我们在 npm 发布包内的 `choerodon-ui/dist` 目录下提供了 `antd.js` `antd.css` 以及 `antd.min.js` `antd.min.css`。你也可以通过 [![CDNJS](https://img.shields.io/cdnjs/v/antd.svg?style=flat-square)](https://cdnjs.com/libraries/antd)
 或 [UNPKG](https://unpkg.com/choerodon-ui/dist/) 进行下载。

> **强烈不推荐使用已构建文件**，这样无法按需加载，而且难以获得底层依赖模块的 bug 快速修复支持。

## 示例

```jsx
import { DatePicker } from 'choerodon-ui';
ReactDOM.render(<DatePicker />, mountNode);
```

引入样式：

```jsx
import 'choerodon-ui/dist/antd.css';  // or 'choerodon-ui/dist/antd.less'
```

### 按需加载

下面两种方式都可以只加载用到的组件。

- 使用 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)（推荐）。

   ```json
   // .babelrc or babel-loader option
   {
     "plugins": [
       ["import", { "libraryName": "choerodon-ui", "libraryDirectory": "es", "style": "css" }] // `style: true` 会加载 less 文件
     ]
   }
   ```

   > 注意：webpack 1 无需设置 `libraryDirectory`。

   然后只需从 choerodon-ui 引入模块即可，无需单独引入样式。等同于下面手动引入的方式。

   ```jsx
   // babel-plugin-import 会帮助你加载 JS 和 CSS
   import { DatePicker } from 'choerodon-ui';
   ```

- 手动引入

   ```jsx
   import DatePicker from 'choerodon-ui/lib/date-picker';  // 加载 JS
   import 'choerodon-ui/lib/date-picker/style/css';        // 加载 CSS
   // import 'choerodon-ui/lib/date-picker/style';         // 加载 LESS
   ```

## 链接

- [首页](/index)
- [组件库](/docs/react/introduce)
- [更新日志](/changelog)
- [脚手架市场](http://scaffold.ant.design)
- [Ant Design](http://ant.design/)
- [React 底层基础组件](http://react-component.github.io/)
- [移动端组件](http://mobile.ant.design)
- [动效](https://motion.ant.design)
- [设计规范速查手册](https://github.com/ant-design/ant-design/wiki/Ant-Design-%E8%AE%BE%E8%AE%A1%E5%9F%BA%E7%A1%80%E7%AE%80%E7%89%88)
- [开发者说明](https://github.com/ant-design/ant-design/wiki/Development)
- [版本发布规则](https://github.com/ant-design/ant-design/wiki/%E8%BD%AE%E5%80%BC%E8%A7%84%E5%88%99%E5%92%8C%E7%89%88%E6%9C%AC%E5%8F%91%E5%B8%83%E6%B5%81%E7%A8%8B)
- [常见问题](https://github.com/ant-design/ant-design/wiki/FAQ)
- [CodeSandbox 模板](https://u.ant.design/codesandbox-repro) for bug reports
- [Awesome Ant Design](https://github.com/websemantics/awesome-ant-design)
- [定制主题](/docs/react/customize-theme)

> 强烈推荐阅读 [《提问的智慧》](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way)、[《如何向开源社区提问题》](https://github.com/seajs/seajs/issues/545) 和 [《如何有效地报告 Bug》](http://www.chiark.greenend.org.uk/%7Esgtatham/bugs-cn.html)、[《如何向开源项目提交无法解答的问题》](https://zhuanlan.zhihu.com/p/25795393)，更好的问题更容易获得帮助。
