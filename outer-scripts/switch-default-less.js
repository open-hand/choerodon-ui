const { modifyEntryVars } = require('./utils');

const args = process.argv.slice(2);
// 如果不是某一处 js 调用，则直接调用修改
if (!process.manualCallModifyEntryVars) {
  modifyEntryVars(args[0]);
}

module.exports = {
  modifyEntryVars,
};
