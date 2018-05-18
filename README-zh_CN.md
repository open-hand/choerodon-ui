# Choerodon UI

一套企业级的 UI 设计语言和 React 实现。

[README in English](README.md)

## 特性

- 提炼自企业级中后台产品的交互语言和视觉风格。
- 开箱即用的高质量 React 组件。
- 使用 TypeScript 构建，提供完整的类型定义文件。
- 全链路开发和设计工具体系。

## 支持环境

* 现代浏览器和 IE9 及以上。
* 支持服务端渲染。
* [Electron](http://electron.atom.io/)

## 安装

```bash
npm install choerodon-ui --save
```

## 示例

```jsx
import { DatePicker } from 'choerodon-ui';
ReactDOM.render(<DatePicker />, mountNode);
```

引入样式：

```jsx
import 'choerodon-ui/dist/choerodon-ui.css';  // or 'choerodon-ui/dist/choerodon-ui.less'
```

你也可以[按需加载组件](http://ant-design.gitee.io/docs/react/getting-started-cn#按需加载)。

## TypeScript

参考 [在 TypeScript 中使用](http://ant-design.gitee.io/docs/react/use-in-typescript-cn)

## 国际化

参考 [国际化文档](http://ant-design.gitee.io/docs/react/i18n)。

## 链接

- [首页]
- [组件库]
- [更新日志](CHANGELOG.en-US.md)
- [脚手架市场](http://scaffold.ant.design)
- [Ant Design](http://ant-design.gitee.io)
- [React 底层基础组件](http://react-component.github.io/)
- [动效](https://motion.ant.design)
- [设计规范速查手册](https://github.com/ant-design/ant-design/wiki/Ant-Design-%E8%AE%BE%E8%AE%A1%E5%9F%BA%E7%A1%80%E7%AE%80%E7%89%88)
- [开发者说明](https://github.com/ant-design/ant-design/wiki/Development)
- [版本发布规则](https://github.com/ant-design/ant-design/wiki/%E8%BD%AE%E5%80%BC%E8%A7%84%E5%88%99%E5%92%8C%E7%89%88%E6%9C%AC%E5%8F%91%E5%B8%83%E6%B5%81%E7%A8%8B)
- [常见问题](https://github.com/ant-design/ant-design/wiki/FAQ)
- [CodeSandbox 模板](https://u.ant.design/codesandbox-repro) for bug reports
- [Awesome Ant Design](https://github.com/websemantics/awesome-ant-design)
- [定制主题](http://ant-design.gitee.io/docs/react/customize-theme-cn)

## 本地开发

```bash
$ git clone https://github.com/choerodon/choerodon-ui.git
$ cd choerodon-ui
$ npm install
$ npm start
```

打开浏览器访问 http://127.0.0.1:8001 ，更多本地开发文档参见: https://github.com/ant-design/ant-design/wiki/Development 。
