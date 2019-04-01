const c7n = require('./components');
const req = require.context('./components', true, /^\.\/locale-provider\/.+_.+\.tsx$/);

c7n.locales = {};

req.keys().forEach((mod) => {
  const match = mod.match(/\/([^/]+).tsx$/);
  c7n.locales[match[1]] = req(mod).default;
});

module.exports = c7n;
