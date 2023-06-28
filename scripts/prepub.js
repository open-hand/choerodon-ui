#!/usr/bin/env node

/* eslint-disable */
'use strict';

const fs = require('fs');
const path = require('path');
const packageInfo = require('../package.json');

process.manualCallModifyEntryVars = true;
const { modifyEntryVars } = require('../outer-scripts/switch-default-less');

if (fs.existsSync(path.join(__dirname, '../lib'))) {
  // Build package.json version to lib/version/index.js
  // prevent json-loader needing in user-side
  const versionFilePath = path.join(process.cwd(), 'lib', 'version', 'index.js');
  fs.writeFileSync(
    versionFilePath,
    `"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = "${packageInfo.version}";
//# sourceMappingURL=index.js.map
`,
  );
  console.log('Wrote version into lib/version/index.js');

  // Build package.json version to lib/version/index.d.ts
  const versionDefPath = path.join(process.cwd(), 'lib', 'version', 'index.d.ts');
  fs.writeFileSync(
    versionDefPath,
    `declare var _default: "${packageInfo.version}";\nexport default _default;\n`,
  );
  console.log('Wrote version into lib/version/index.d.ts');
}

if (fs.existsSync(path.join(__dirname, '../dist'))) {
  const distLess = function distLess(isPro) {
    // Build a entry less file to dist/choerodon-ui.less
    const dir = isPro ? 'components-pro' : 'components';
    const less = isPro ? 'choerodon-ui-pro.less' : 'choerodon-ui.less';
    const relativePath = isPro ? '../../pro/lib/' : '../';
    const componentsPath = path.join(process.cwd(), dir);
    let componentsLessContent = isPro ? '@import "./themes/css-vars.less";\n' : '';

    // Build components in one file: lib/style/components.less
    fs.readdir(componentsPath, function (err, files) {
      files.forEach(function (file) {
        if (fs.existsSync(path.join(componentsPath, file, 'style', 'index.less'))) {
          componentsLessContent += `@import "${relativePath}${file}/style/index.less";\n`;
        }
        if (fs.existsSync(path.join(componentsPath, file, 'combo-customization-settings', 'style', 'index.less'))) {
          componentsLessContent += `@import "${relativePath}${file}/combo-customization-settings/style/index.less";\n`;
        }
        if (fs.existsSync(path.join(componentsPath, file, 'customization-settings', 'style', 'index.less'))) {
          componentsLessContent += `@import "${relativePath}${file}/customization-settings/style/index.less";\n`;
        }
        if (fs.existsSync(path.join(componentsPath, file, 'query-bar', 'style', 'index.less'))) {
          componentsLessContent += `@import "${relativePath}${file}/query-bar/style/index.less";\n`;
        }
      });
      fs.writeFileSync(
        path.join(process.cwd(), 'lib', 'style', `${dir}.less`),
        componentsLessContent,
      );

      // Build less entry file: dist/choerodon-ui.less
      fs.writeFileSync(
        path.join(process.cwd(), 'dist', less),
        `@import "../lib/style/index.less";\n@import "../lib/style/${dir}.less";`,
      );
    });
    console.log(`Built a entry less file to dist/${less}`);
  };

  distLess();
  distLess(true);
}

if (fs.existsSync(path.join(__dirname, '../pro'))) {
  fs.writeFileSync(
    path.join(process.cwd(), 'pro', 'index.js'),
    `'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var pro = require('./lib');

var pro2 = pro && pro.__esModule ? pro : { 'default': pro };

exports['default'] = pro2['default'] || pro2;
module.exports = exports['default'];
`,
  );
  console.log('Built a index file to pro/index.js');

  fs.writeFileSync(
    path.join(process.cwd(), 'pro', 'index.d.ts'),
    `export * from './lib';
`,
  );
  console.log('Built a ts index file to pro/index.d.ts');
}

// 修改打包后的 default.less 文件，默认为 less 变量
modifyEntryVars('defaultVars').then(() => {
  console.log('Modified default.less');
});
