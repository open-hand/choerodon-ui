---
order: 4
title: Use in create-react-app
---

[create-react-app](https://github.com/facebookincubator/create-react-app) is one of the best React application development tools. We are going to use `choerodon-ui` within it and modify the webpack config for some customized needs.

---

## Install and Initialization

We need to install `create-react-app` first, you may need install [yarn](https://github.com/yarnpkg/yarn/) too.

```bash
$ yarn create react-app choerodon-ui-demo

# or

$ npx create-react-app choerodon-ui-demo
```

The tool will create and initialize environment and dependencies automatically,
please try config your proxy setting or use another npm registry if any network errors happen during it.

Then we go inside `choerodon-ui-demo` and start it.

```bash
$ cd choerodon-ui-demo
$ yarn start
```

Open the browser at http://localhost:3000/. It renders a header saying "Welcome to React" on the page.

## Import choerodon-ui

Below is the default directory structure.

```
├── README.md
├── package.json
├── public
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   └── logo.svg
└── yarn.lock
```

Now we install `choerodon-ui` and related dependencies from yarn or npm.

```bash
$ yarn add choerodon-ui mobx react-mobx axios
```

> Please pay attention to the waring during installation. If an unknown error occurs, please make sure that mobx and mobx-react are the correct version


Modify `src/App.js`, import Button component from `choerodon-ui`.

```jsx
import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Button color="primary">Button</Button>
      </div>
    );
  }
}

export default App;
```

Add `choerodon-ui/dist/choerodon-ui.css` and `choerodon-ui/dist/choerodon-ui-pro.css` at the top of `src/App.css`.

```css
@import '~choerodon-ui/dist/choerodon-ui.css';
@import '~choerodon-ui/dist/choerodon-ui-pro.css';

.App {
  text-align: center;
}

...
```

Ok, you should now see a blue primary button displayed on the page. Next you can choose any components of `choerodon-ui` to develop your application. Visit other workflows of `craco` at its [User Guide ](https://github.com/gsoft-inc/craco).

## Advanced Guides

In the real world, we usually have to modify default webpack config for custom needs such as themes. We can achieve that by using [craco](https://github.com/gsoft-inc/craco) which is one of create-react-app's custom config solutions.

Install craco and modify the `scripts` field in `package.json`.

```bash
$ yarn add @craco/craco
```

```diff
/* package.json */
"scripts": {
-   "start": "react-scripts start",
-   "build": "react-scripts build",
-   "test": "react-scripts test",
+   "start": "craco start",
+   "build": "craco build",
+   "test": "craco test",
}
```

### Use babel-plugin-import

[babel-plugin-import](https://github.com/ant-design/babel-plugin-import) is a babel plugin for importing components on demand ([How does it work?](/docs/react/getting-started#Import-on-Demand)). We are now trying to install it and modify `craco.config.js`.Due to we set the style to true,so we need install less and less-loader and craco-less. Note that the url in cssLoaderOptions must be set to false.


```bash
$ yarn add babel-plugin-import --dev
$ yarn add less less-loader craco-less
```

modify `craco.config.js`

```js
const CracoLessPlugin = require('craco-less');

module.exports = {
  babel: {
    plugins: [
      [
        'import', {
          libraryName: 'choerodon-ui',
          style: true,
        }, 'c7n',
      ],
      [
        'import', {
          libraryName: 'choerodon-ui/pro',
          style: true,
        }, 'c7n-pro',
      ],
    ],
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
        cssLoaderOptions: {
          url: false,
        },
      },
    },
  ],
};
```


Remove the `@import '~choerodon-ui/dist/choerodon-ui.css';` and `choerodon-ui/dist/choerodon-ui-pro.css` statement added before because `babel-plugin-import` will import styles.


Then reboot with `yarn start` and visit the demo page, you should not find any [warning messages](https://zos.alipayobjects.com/rmsportal/vgcHJRVZFmPjAawwVoXK.png) in the console, which prove that the `import on demand` config is working now. You will find more info about it in [this guide](/docs/react/getting-started#Import-on-Demand).

### Customize Theme


According to the [Customize Theme documentation](/docs/react/customize-theme), we need to modify less variables via loader like [less-loader](https://github.com/webpack/less-loader).We can modify `lessOptions` in `craco.config.js`

```diff
const CracoLessPlugin = require('craco-less');

module.exports = {
  babel: {
    plugins: [
      [
        'import', {
          libraryName: 'choerodon-ui',
          style: true,
        }, 'c7n'
      ],
      [
        'import', {
          libraryName: 'choerodon-ui/pro',
          style: true,
        }, 'c7n-pro'
      ]
    ]
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
+            modifyVars: {
+              '@primary-color': '#1DA57A'
+            },
          },
        },
        cssLoaderOptions: {
          url: false
        }
      },
    },
  ],
};
```

We use `modifyVars` option of [less-loader](https://github.com/webpack/less-loader#less-options) here, you can see a green button rendered on the page after rebooting the start server.

## eject

You can also could try [yarn run eject](https://github.com/facebookincubator/create-react-app#converting-to-a-custom-setup) for a custom setup of create-react-app, although you should dig into it by yourself.
