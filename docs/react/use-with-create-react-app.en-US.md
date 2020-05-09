---
order: 4
title: Use in create-react-app
---

[create-react-app](https://github.com/facebookincubator/create-react-app) is one of the best React application development tools. We are going to use `choerodon-ui` within it and modify the webpack config for some customized needs.

---

## Install and Initialization

We need to install `create-react-app` first, you may need install [yarn](https://github.com/yarnpkg/yarn/) too.

```bash
$ npm install -g create-react-app yarn
```

Create a new project named `choerodon-ui-demo`.

```bash
$ create-react-app choerodon-ui-demo
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

Modify `src/App.js`, import Button component from `choerodon-ui`.

```jsx
import React, { Component } from 'react';
import Button from 'choerodon-ui/lib/button';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Button type="primary">Button</Button>
      </div>
    );
  }
}

export default App;
```

Add `choerodon-ui/dist/choerodon-ui.css` at the top of `src/App.css` and when you need the pro components you should add `choerodon-ui/dist/choerodon-ui-pro.css`.

```css
@import '~choerodon-ui/dist/choerodon-ui.css';
@import '~choerodon-ui/dist/choerodon-ui-pro.css';

.App {
  text-align: center;
}

...
```

Ok, you should now see a blue primary button displayed on the page. Next you can choose any components of `choerodon-ui` to develop your application. Visit other workflows of `create-react-app` at its [User Guide ](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).


## Advanced Guides

We are successfully running choerodon-ui components now but in the real world, there are still lots of problems about choerodon-ui-demo.
For instance, we actually import all styles of components in the project which may be a network performance issue.

Now we need to customize the default webpack config. We can achieve that by using [react-app-rewired](https://github.com/timarney/react-app-rewired) which is one of create-react-app's custom config solutions.

Import react-app-rewired and modify the `scripts` field in package.json. Due to new [react-app-rewired@2.x](https://github.com/timarney/react-app-rewired#alternatives) issue, you shall need [customize-cra](https://github.com/arackaf/customize-cra) along with react-app-rewired.

```
$ yarn add react-app-rewired customize-cra
```

```diff
/* package.json */
"scripts": {
-   "start": "react-scripts start",
+   "start": "react-app-rewired start",
-   "build": "react-scripts build",
+   "build": "react-app-rewired build",
-   "test": "react-scripts test",
+   "test": "react-app-rewired test",
}
```

Then create a `config-overrides.js` at root directory of your project for further overriding.

```js
module.exports = function override(config, env) {
  // do stuff with the webpack config...
  return config;
};
```

### Use babel-plugin-import

[babel-plugin-import](https://github.com/ant-design/babel-plugin-import) is a babel plugin for importing components on demand ([How does it work?](/docs/react/getting-started#Import-on-Demand)). We are now trying to install it and modify `config-overrides.js`.Due to we set the style to true,so we need install less and less-loader

```bash
$ yarn add babel-plugin-import --dev
$ yarn add less less-loader
```

```diff
const { override, fixBabelImports, addLessLoader } = require('customize-cra');

- module.exports = function override(config, env) {
-   // do stuff with the webpack config...
-   return config;
- };
+ module.exports = override(
+   fixBabelImports('import', {
+     libraryName: 'choerodon-ui',
+     libraryDirectory: 'lib',
+     style: true,
+   }),
+   fixBabelImports('import', {
+     libraryName: 'choerodon-ui/pro',
+     libraryDirectory: 'lib',
+     style: true,
+   }),
+   addLessLoader()
+ );
```

Remove the `@import '~choerodon-ui/dist/choerodon-ui.css';` and `choerodon-ui/dist/choerodon-ui-pro.css` statement added before because `babel-plugin-import` will import styles and import components like below:

```diff
  // src/App.js
  import React, { Component } from 'react';
- import Button from 'choerodon-ui/lib/button';
+ import { Button } from 'choerodon-ui';
  import './App.css';

  class App extends Component {
    render() {
      return (
        <div className="App">
          <Button type="primary">Button</Button>
        </div>
      );
    }
  }

  export default App;
```

Then reboot with `yarn start` and visit the demo page, you should not find any [warning messages](https://zos.alipayobjects.com/rmsportal/vgcHJRVZFmPjAawwVoXK.png) in the console, which prove that the `import on demand` config is working now. You will find more info about it in [this guide](/docs/react/getting-started#Import-on-Demand).

### Customize Theme

According to the [Customize Theme documentation](/docs/react/customize-theme), to customize the theme, we need to modify `less` variables with tools such as [less-loader](https://github.com/webpack/less-loader). We can also use [addLessLoader](https://github.com/arackaf/customize-cra#addlessloaderloaderoptions) to achieve this. Import it and modify `config-overrides.js` like below.If addLessLoader makes an error, you can refer to the corresponding [issue](https://github.com/arackaf/customize-cra/issues).


```diff
const { override, fixBabelImports, addLessLoader } = require('customize-cra');

module.exports = override(
   fixBabelImports('import', {
     libraryName: 'choerodon-ui',
     libraryDirectory: 'lib',
     style: true,
   }),
   fixBabelImports('import', {
     libraryName: 'choerodon-ui/pro',
     libraryDirectory: 'lib',
     style: true,
   }),
-  addLessLoader()
+ addLessLoader({
+   lessOptions: { // If you are using less-loader@5 please spread the lessOptions to options directly
+     javascriptEnabled: true,
+     modifyVars: { '@primary-color': '#1DA57A' },
+   },
+ }),
);
```

We use `modifyVars` option of [less-loader](https://github.com/webpack/less-loader#less-options) here, you can see a green button rendered on the page after rebooting the start server.

## eject

You can also could try [yarn run eject](https://github.com/facebookincubator/create-react-app#converting-to-a-custom-setup)  for a custom setup of create-react-app, although you should dig into it by yourself.
