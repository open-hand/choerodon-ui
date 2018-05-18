const $ = require('dekko');

$('dist')
  .isDirectory()
  .hasFile('choerodon-ui.css')
  .hasFile('choerodon-ui.min.css')
  .hasFile('choerodon-ui.js')
  .hasFile('choerodon-ui.min.js');

// eslint-disable-next-line
console.log('`dist` directory is valid.');

