---
order: 0
title: Choerodon UI of React
---

Following the Ant Design specification, we developed a React UI library `Choerodon UI` that contains a set of high quality components and demos for building rich, interactive user interfaces.

## Features

- An enterprise-class UI design language for web applications.
- A set of high-quality React components out of the box.
- Written in TypeScript with complete defined types.
- The whole package of development and design resources and tools.

## Environment Support

* Modern browsers and Internet Explorer 9+ (with [polyfills](https://ant.design/docs/react/getting-started#Compatibility))
* Server-side Rendering
* [Electron](http://electron.atom.io/)

## Version

- Stable: [![npm package](https://img.shields.io/npm/v/antd.svg?style=flat-square)](https://www.npmjs.org/package/antd)

You can subscribe to this feed for new version notifications: https://github.com/ant-design/ant-design/releases.atom

## Installation

### Using npm or yarn

**We recommend using npm or yarn to install**，it not only makes development easier，but also allow you to take advantage of the rich ecosystem of Javascript packages and tooling.

```bash
$ npm install choerodon-ui --save
```

```bash
$ yarn add choerodon-ui
```

If you are in a bad network environment，you can try other registries and tools like [cnpm](https://github.com/cnpm/cnpm).

### Import in Browser

Add `script` and `link` tags in your browser and use the global variable `antd`.

We provide `antd.js` `antd.css` and `antd.min.js` `antd.min.css` under `choerodon-ui/dist` in choerodon-ui's npm package. You can also download these files directly from [![CDNJS](https://img.shields.io/cdnjs/v/choerodon-ui.svg?style=flat-square)](https://cdnjs.com/libraries/choerodon-ui) or [unpkg](https://unpkg.com/).

> **We strongly discourage loading the entire files** this will add bloat to your application and make it more difficult to receive bugfixes and updates. Antd is intended to be used in conjunction with a build tool, such as [webpack](https://webpack.github.io/), which will make it easy to import only the parts of antd that you are using.

## Usage

```jsx
import { DatePicker } from 'choerodon-ui';
ReactDOM.render(<DatePicker />, mountNode);
```

And import stylesheets manually:

```jsx
import 'choerodon-ui/dist/antd.css';  // or 'choerodon-ui/dist/antd.less'
```

### Use modularized antd

- Use [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) (Recommended)

   ```json
   // .babelrc or babel-loader option
   {
     "plugins": [
       ["import", { "libraryName": "choerodon-ui", "libraryDirectory": "es", "style": "css" }] // `style: true` for less
     ]
   }
   ```

   > Note: Don't set `libraryDirectory` if you are using webpack 1.

   This allows you to import components from choerodon-ui without having to manually import the corresponding stylesheet. The antd babel plugin will automatically import stylesheets.

   ```jsx
   // import js and css modularly, parsed by babel-plugin-import
   import { DatePicker } from 'choerodon-ui';
   ```

- Manually import

   ```jsx
   import DatePicker from 'choerodon-ui/lib/date-picker';  // for js
   import 'choerodon-ui/lib/date-picker/style/css';        // for css
   // import 'choerodon-ui/lib/date-picker/style';         // that will import less
   ```

### TypeScript

- Don't use @types/antd, as antd provides a built-in ts definition already.

## Links

- [Home Page](/)
- [Components](/docs/react/introduce)
- [Change Log](/changelog)
- [Scaffold Market](http://scaffold.ant.design)
- [Ant Design](http://ant.design/)
- [rc-components](http://react-component.github.io/)
- [Mobile UI](http://mobile.ant.design)
- [Motion](https://motion.ant.design)
- [Developer Instruction](https://github.com/ant-design/ant-design/wiki/Development)
- [Versioning Release Note](https://github.com/ant-design/ant-design/wiki/%E8%BD%AE%E5%80%BC%E8%A7%84%E5%88%99%E5%92%8C%E7%89%88%E6%9C%AC%E5%8F%91%E5%B8%83%E6%B5%81%E7%A8%8B)
- [FAQ](https://github.com/ant-design/ant-design/wiki/FAQ)
- [CodeSandbox template](https://u.ant.design/codesandbox-repro) for bug reports
- [Awesome Ant Design](https://github.com/websemantics/awesome-ant-design)
- [Customize Theme](/docs/react/customize-theme)
