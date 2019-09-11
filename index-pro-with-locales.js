const c7n = require('./components-pro');

const req = require.context('./components-pro', true, /^\.\/locale-context\/.+_.+\.tsx$/);

c7n.locales = {};

req.keys().forEach(mod => {
  const match = mod.match(/\/([^/]+).tsx$/);
  c7n.locales[match[1]] = req(mod).default;
});

module.exports = c7n;
