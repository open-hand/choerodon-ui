# Choerodon UI

[![React](https://img.shields.io/badge/React-UI%20Framework-61DAFB)](#usage)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178C6)](#features)
[![npm](https://img.shields.io/npm/v/choerodon-ui)](https://www.npmjs.com/package/choerodon-ui)

An enterprise-class UI design language and React-based implementation. Choerodon UI provides a large set of components, Pro tables, theming support, and enterprise-oriented patterns for modern frontend applications.

## Table of Contents
- [Features](#features)
- [Environment support](#environment-support)
- [Install](#install)
- [Usage](#usage)
- [Project links](#project-links)
- [Local development](#local-development)
- [Deployment](#deployment)
- [Publishing](#publishing)

## Features

- Enterprise-oriented React component system
- TypeScript-friendly API surface
- Standard components plus `pro` packages for richer data-heavy UIs
- Documentation, scaffold resources, and theming support

## Environment support

- Modern browsers
- Internet Explorer 9+ with required polyfills
- Server-side rendering
- Electron

## Install

```bash
npm install choerodon-ui --save
```

## Usage

```jsx
import { DatePicker } from 'choerodon-ui';
import { Table } from 'choerodon-ui/pro';

ReactDOM.render(
  <>
    <DatePicker />
    <Table />
  </>,
  mountNode,
);
```

Import styles manually:

```jsx
import 'choerodon-ui/dist/choerodon-ui.css';
import 'choerodon-ui/dist/choerodon-ui-pro.css';
```

You can also [import components on demand](https://open-hand.github.io/choerodon-ui/en/docs/other/introduce#%E6%8C%89%E9%9C%80%E5%8A%A0%E8%BD%BD).

## Project links

- [Home page](https://open-hand.github.io/choerodon-ui/en)
- [Component docs](https://open-hand.github.io/choerodon-ui/en/docs/other/introduce)
- [Internationalization](https://open-hand.github.io/choerodon-ui/en/docs/other/i18n)
- [Change log](CHANGELOG.en-US.md)
- [Customize theme](https://open-hand.github.io/choerodon-ui/customize-theme)
- [rc-components](http://react-component.github.io/)

## Local development

```bash
git clone https://github.com/open-hand/choerodon-ui.git
cd choerodon-ui
npm install
npm start
```

Then open `http://127.0.0.1:8001` in your browser.

## Deployment

```bash
npm run deploy
```

## Publishing

```bash
npm run pub
```

## License

See the repository for license details.
