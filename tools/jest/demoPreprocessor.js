const { relative } = require('path');
const crypto = require('crypto');
const markTwain = require('mark-twain');
const JsonML = require('jsonml.js/lib/utils');
const babel = require('babel-core');
const getBabelCommonConfig = require('../../tools/getBabelCommonConfig');
const rewriteSource = require('./rewriteSource');
const pkg = require('../../package.json');

const libDir = process.env.LIB_DIR || 'components';

const libMatchPattern = /choerodon-ui\/lib\/.+/;
const libPattern = /choerodon-ui\/lib/;
const libProMatchPattern = /choerodon-ui\/pro\/lib\/.+/;
const libProPattern = /choerodon-ui\/pro\/lib/;

function getCode(tree) {
  let code;
  const find = (node) => {
    if (code) return;
    if (!JsonML.isElement(node)) return;
    if (JsonML.getTagName(node) !== 'pre') {
      JsonML.getChildren(node).forEach(find);
      return;
    }
    code = JsonML.getChildren(JsonML.getChildren(node)[0] || '')[0] || '';
  };
  find(tree);
  return code;
}

function createDemo({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const importReact = t.ImportDeclaration(
          [
            t.importDefaultSpecifier(t.Identifier('React')),
          ],
          t.StringLiteral('react'),
        );
        path.unshiftContainer('body', importReact);
      },

      CallExpression(path) {
        if (path.node.callee.object &&
          path.node.callee.object.name === 'ReactDOM' &&
          path.node.callee.property.name === 'render') {
          const app = t.VariableDeclaration('const', [
            t.VariableDeclarator(t.Identifier('__Demo'), path.node.arguments[0]),
          ]);
          const exportDefault = t.ExportDefaultDeclaration(t.Identifier('__Demo'));
          path.insertAfter(exportDefault);
          path.insertAfter(app);
          path.remove();
        }
      },

      ImportDeclaration(path) {
        if (libMatchPattern.test(path.node.source.value)) {
          path.node.source.value = path.node.source.value.replace(libPattern, '../../../components');
        } else if (libProMatchPattern.test(path.node.source.value)) {
          path.node.source.value = path.node.source.value.replace(libProPattern, '../../../components-pro');
        }
        rewriteSource(t, path, libDir);
      },
    },
  };
}

module.exports = {
  process(src, path) {
    const markdown = markTwain(src);
    src = getCode(markdown.content);

    // @ @ secret API.
    global.__clearBabelAntdPlugin && global.__clearBabelAntdPlugin(); // eslint-disable-line

    const babelConfig = getBabelCommonConfig();
    babelConfig.plugins = [...babelConfig.plugins];

    babelConfig.plugins.push(createDemo);

    if (libDir !== 'dist') {
      babelConfig.plugins.push([
        require.resolve('babel-plugin-import'),
        [
          {
            libraryName: 'choerodon-ui',
            libraryDirectory: `../../../../${libDir}`,
          },
          {
            libraryName: 'choerodon-ui/pro',
            libraryDirectory: `../../../../pro/${libDir}`,
          },
        ],
      ]);
    }

    babelConfig.filename = path;

    src = babel.transform(src, babelConfig).code;

    return src;
  },

  getCacheKey(fileData, filename, configString, options) {
    const { instrument, rootDir } = options;

    return crypto
      .createHash('md5')
      .update(fileData)
      .update('\0', 'utf8')
      .update(relative(rootDir, filename))
      .update('\0', 'utf8')
      .update(configString)
      .update('\0', 'utf8')
      .update(instrument ? 'instrument' : '')
      .update('\0', 'utf8')
      .update(libDir)
      .update('\0', 'utf8')
      .update(pkg.version)
      .digest('hex');
  },
};
