const crypto = require('crypto');
const fs = require('fs');
const { createTransformer } = require('babel-jest');
const getBabelCommonConfig = require('../getBabelCommonConfig');
const rewriteSource = require('./rewriteSource');
const pkg = require('../../package.json');

const libDir = process.env.LIB_DIR || 'components';

function processDemo({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        rewriteSource(t, path, libDir);
      },
    },
  };
}

module.exports = {
  process(src, path, config, transformOptions) {
    const babelConfig = getBabelCommonConfig();
    babelConfig.plugins = [...babelConfig.plugins];
    babelConfig.plugins[0] = [babelConfig.plugins[0][0], { ...babelConfig.plugins[0][1], allowDeclareFields: true }];

    if (/[\\/]demo[\\/]/.test(path)) {
      babelConfig.plugins.push(processDemo);
    }

    babelConfig.plugins.push([
      require.resolve('babel-plugin-import'),
      {
        libraryName: 'choerodon-ui/pro',
        libraryDirectory: '../../../../components-pro',
      },
    ], require.resolve('@babel/plugin-transform-modules-commonjs'));

    const babelSupport =
      path.endsWith('.ts') ||
      path.endsWith('.tsx') ||
      path.endsWith('.js') ||
      path.endsWith('.jsx');

    const babelJest = createTransformer(babelConfig);
    const fileName = babelSupport ? path : 'file.js';
    return babelJest.process(src, fileName, config, transformOptions);
  },

  getCacheKey(fileData, filename, configString, options) {
    return crypto
      .createHash('md5')
      .update(fileData)
      .update('\0', 'utf8')
      .update(filename)
      .update('\0', 'utf8')
      .update(configString)
      .update('\0', 'utf8')
      .update(options.instrument ? 'instrument' : '')
      .update('\0', 'utf8')
      .update(fs.readFileSync(__filename))
      .update('\0', 'utf8')
      .update(libDir)
      .update('\0', 'utf8')
      .update(pkg.version)
      .digest('hex');
  },
};
