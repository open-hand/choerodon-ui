const path = require('path');
const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;
const replaceLib = require('antd-tools/lib/replaceLib');
const babelOptions = require('bisheng/lib/config/getBabelCommonConfig').default();

const isDev = process.env.NODE_ENV === 'development';
const usePreact = process.env.REACT_ENV === 'preact';
const rcPath = path.resolve(process.cwd(), 'components', 'rc-components');

function alertBabelConfig(rules) {
  rules.forEach((rule) => {
    if (rule.loader && rule.loader === 'babel-loader') {
      if (rule.options.plugins.indexOf(replaceLib) === -1) {
        rule.options.plugins.push(replaceLib);
      }
      rule.options.plugins = rule.options.plugins.filter(
        plugin => !plugin.indexOf || plugin.indexOf('babel-plugin-add-module-exports') === -1
      );
    } else if (rule.use) {
      alertBabelConfig(rule.use);
    }
  });
}

module.exports = {
  port: 8001,
  source: {
    components: './components',
    docs: './docs',
    changelog: [
      'CHANGELOG.zh-CN.md',
      'CHANGELOG.en-US.md',
    ],
  },
  theme: './site/theme',
  htmlTemplate: './site/theme/static/template.html',
  themeConfig: {
    categoryOrder: {
      'Choerodon UI': 0,
      原则: 1,
      Principles: 1,
      视觉: 2,
      Visual: 2,
      模式: 3,
      Patterns: 3,
      其他: 6,
      Other: 6,
      Components: 100,
    },
    typeOrder: {
      General: 0,
      Layout: 1,
      Navigation: 2,
      'Data Entry': 3,
      'Data Display': 4,
      Feedback: 5,
      Localization: 6,
      Other: 7,
    },
    docVersions: {
    },
  },
  filePathMapper(filePath) {
    if (filePath === '/index.html') {
      return ['/index.html', '/index-cn.html'];
    }
    if (filePath.endsWith('/index.html')) {
      return [filePath, filePath.replace(/\/index\.html$/, '-cn/index.html')];
    }
    if (filePath !== '/404.html' && filePath !== '/index-cn.html') {
      return [filePath, filePath.replace(/\.html$/, '-cn.html')];
    }
    return filePath;
  },
  doraConfig: {
    verbose: true,
    plugins: ['dora-plugin-upload'],
  },
  webpackConfig(config) {
    config.resolve.alias = {
      'choerodon-ui/lib': path.join(process.cwd(), 'components'),
      'choerodon-ui': path.join(process.cwd(), 'index'),
      site: path.join(process.cwd(), 'site'),
      'react-router': 'react-router/umd/ReactRouter',
    };

    config.externals = {
      'react-router-dom': 'ReactRouterDOM',
    };

    if (usePreact) {
      config.resolve.alias = Object.assign({}, config.resolve.alias, {
        react: 'preact-compat',
        'react-dom': 'preact-compat',
        'create-react-class': 'preact-compat/lib/create-react-class',
        'react-router': 'react-router',
      });
    }

    if (isDev) {
      config.devtool = 'source-map';
    }

    config.module.rules.forEach((rule) => {
      if (rule.loader && rule.loader === 'babel-loader') {
        if (rule.exclude) {
          rule.exclude = [rule.exclude, rcPath];
        } else {
          rule.exclude = rcPath;
        }
      }
    });

    const rcComponentsRule = {
      test: /\.jsx?$/,
      include: rcPath,
      loader: 'babel-loader',
      options: babelOptions,
    };

    config.module.rules.unshift(rcComponentsRule);

    alertBabelConfig(config.module.rules);

    rcComponentsRule.options.plugins.push(
      require.resolve('babel-plugin-transform-proto-to-assign'),
      [require.resolve('babel-plugin-transform-es2015-classes'), { loose: true }]
    );

    config.plugins.push(new CSSSplitWebpackPlugin({ size: 4000 }));

    return config;
  },

  htmlTemplateExtraData: {
    isDev,
    usePreact,
  },
};
