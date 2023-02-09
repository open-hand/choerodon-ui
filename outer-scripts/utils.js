const path = require('path');
const fs = require('fs');

// 修改 components\style\themes\default.less 打包后文件中变量入口方式

const c7nPath = __dirname.substring(0,
  __dirname.lastIndexOf('\\') > 0 ? __dirname.lastIndexOf('\\') : __dirname.lastIndexOf('/'));
// 待修改文件路径
const esDefaultLessPath = path.resolve(c7nPath, 'es', 'style', 'themes', 'default.less');
const libDefaultLessPath = path.resolve(c7nPath, 'lib', 'style', 'themes', 'default.less');

function isFileExist(path) {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, error => {
      if (error) {
        resolve(false);
      }
      resolve(true);
    });
  });
}

async function modify(lessPath, c7nRootEntryName) {
  const pathExist = await isFileExist(lessPath);
  if (pathExist) {
    // 修改
    fs.readFile(lessPath, 'utf-8', (error, data) => {
      if (error != null) {
        return;
      }
      const newData = data.replace(/\/\/ 以下被脚本替换[\s\S]*\/\/ 以上被脚本替换/m,
        (c7nRootEntryName === 'variables'
        ? `// 以下被脚本替换
// @c7n-root-entry-name: defaultVars;
@c7n-root-entry-name: variables;

@import './@{c7n-root-entry-name}.less';
// 以上被脚本替换`
        : `// 以下被脚本替换
@c7n-root-entry-name: defaultVars;
// @c7n-root-entry-name: variables;

@import './@{c7n-root-entry-name}.less';
// 以上被脚本替换`));
      fs.writeFile(lessPath, newData, error2 => {
        if (error2 != null) {
          console.log(error2);
        }
      });
    });
  } else {
    console.warn(`${lessPath} is not exist.`);
  }
}

async function modifyEntryVars(c7nRootEntryName) {
  await modify(esDefaultLessPath, c7nRootEntryName);
  await modify(libDefaultLessPath, c7nRootEntryName);
}

module.exports = {
  modifyEntryVars,
};
