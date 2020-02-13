const $ = require('dekko');
const chalk = require('chalk');

$('dist')
  .isDirectory()
  .hasFile('choerodon-ui.css')
  .hasFile('choerodon-ui.min.css')
  .hasFile('choerodon-ui.js')
  .hasFile('choerodon-ui.min.js')
  .hasFile('choerodon-ui-pro.css')
  .hasFile('choerodon-ui-pro.min.css')
  .hasFile('choerodon-ui-pro.js')
  .hasFile('choerodon-ui-pro.min.js')
  .hasFile('choerodon-ui-demo-data-mock.js')
  .hasFile('choerodon-ui-demo-data-mock.min.js');
// eslint-disable-next-line
console.log(chalk.green('✨ `dist` directory is valid.'));
