const libPattern = /^choerodon-ui$/;
const libProPattern = /^choerodon-ui\/pro$/;

function rewriteSource(t, path, libDir) {
  if (libDir === 'dist') {
    if (path.node.source.value.match(libPattern)) {
      path.node.source.value = '../../../dist/choerodon-ui';
    } else if (path.node.source.value.match(libProPattern)) {
      path.node.source.value = '../../../dist/choerodon-ui-pro';
    }
  }
}

module.exports = rewriteSource;
