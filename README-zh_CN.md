# Choerodon UI

一套企业级的 UI 设计语言和 React 实现。

[README in English](README.md)

## 特性

- 提炼自企业级中后台产品的交互语言和视觉风格。
- 开箱即用的高质量 React 组件。
- 使用 TypeScript 构建，提供完整的类型定义文件。
- 全链路开发和设计工具体系。

## 支持环境

- 现代浏览器和 IE9 及以上。
- 支持服务端渲染。
- [Electron](http://electron.atom.io/)

## 安装

```bash
npm install choerodon-ui --save
```

## 示例

```jsx
import { DatePicker } from 'choerodon-ui';
import { Table } from 'choerodon-ui/pro';
ReactDOM.render(<><DatePicker /><Table /><>, mountNode);
```

引入样式：

```jsx
import 'choerodon-ui/dist/choerodon-ui.css'; // or 'choerodon-ui/dist/choerodon-ui.less'
import 'choerodon-ui/dist/choerodon-ui-pro.css'; // or 'choerodon-ui/dist/choerodon-ui-pro.less'
```

你也可以[按需加载组件](https://choerodon.github.io/choerodon-ui/zh/docs/other/introduce#%E6%8C%89%E9%9C%80%E5%8A%A0%E8%BD%BD)。

## TypeScript

参考 [在 TypeScript 中使用](https://choerodon.github.io/choerodon-ui/zh/docs/other/use-in-typescript)

## 国际化

参考 [国际化文档](https://choerodon.github.io/choerodon-ui/zh/docs/other/i18n)。

## 链接

- [首页]
- [组件库](https://choerodon.github.io/choerodon-ui/)
- [更新日志](CHANGELOG.en-US.md)
- [脚手架市场](http://scaffold.ant.design)
- [React 底层基础组件](http://react-component.github.io/)
- [定制主题](https://choerodon.github.io/choerodon-ui/docs/react/customize-theme-cn)

## 本地开发

```bash
$ git clone https://github.com/choerodon/choerodon-ui.git
$ cd choerodon-ui
$ npm install
$ npm start
```

## 部署

```bash
$ npm run deploy
```

## 发布

```bash
$ npm run pub
```

打开浏览器访问 http://127.0.0.1:8001 ，更多本地开发文档参见: https://choerodon.github.io/choerodon-ui/zh/tutorials/introduction 。
