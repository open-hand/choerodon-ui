# Choerodon UI

An enterprise-class UI design language and React-based implementation.

[中文 README](README-zh_CN.md)

## Features

- Extracted from the interactive language and visual style of enterprise-level medium and backstage products.
- A set of high-quality React components out of the box.
- Written in TypeScript with predictable static types.
- The whole package of development and design resources and tools.

## Environment Support

- Modern browsers and Internet Explorer 9+ (with [polyfills](https://ant.design/docs/react/getting-started#Compatibility))
- Server-side Rendering
- [Electron](http://electron.atom.io/)

## Install

```bash
npm install choerodon-ui --save
```

## Usage

```jsx
import { DatePicker } from 'choerodon-ui';
import { Table } from 'choerodon-ui/pro';
ReactDOM.render(<><DatePicker /><Table /><>, mountNode);
```

And import style manually:

```jsx
import 'choerodon-ui/dist/choerodon-ui.css'; // or 'choerodon-ui/dist/choerodon-ui.less'
import 'choerodon-ui/dist/choerodon-ui-pro.css'; // or 'choerodon-ui/dist/choerodon-ui-pro.less'
```

Or [import components on demand](https://open-hand.github.io/choerodon-ui/en/docs/other/introduce#%E6%8C%89%E9%9C%80%E5%8A%A0%E8%BD%BD)

### TypeScript

See [Used in TypeScript](https://open-hand.github.io/choerodon-ui/en/docs/other/use-in-typescript)

## Internationalization

See [i18n](https://open-hand.github.io/choerodon-ui/en/docs/other/i18n).

## Links

- [Home page](https://open-hand.github.io/choerodon-ui/en)
- [Components](https://open-hand.github.io/choerodon-ui/en/docs/other/introduce)
- [Change Log](CHANGELOG.en-US.md)
- [Scaffold Market](http://scaffold.ant.design)
- [rc-components](http://react-component.github.io/)
- [Customize Theme](https://open-hand.github.io/choerodon-ui/customize-theme)

## Local Development

```bash
$ git clone https://github.com/open-hand/choerodon-ui.git
$ cd choerodon-ui
$ npm install
$ npm start
```

## Deployment

```bash
$ npm run deploy
```

## publish

```bash
$ npm run pub
```

Open your browser and visit http://127.0.0.1:8001 , see more at https://open-hand.github.io/choerodon-ui/en/tutorials/introduction .
