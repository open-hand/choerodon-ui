const path = require('path');
const webpack = require('webpack');
const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;
const babelOptions = require('bisheng/lib/config/getBabelCommonConfig').default();
const replaceLib = require('../tools/replaceLib');

const isDev = process.env.NODE_ENV === 'development';
const rcPath = path.resolve(process.cwd(), 'components', 'rc-components');

function alertBabelConfig(rules) {
  rules.forEach(rule => {
    if (rule.loader && rule.loader === 'babel-loader') {
      if (rule.options.plugins.indexOf(replaceLib) === -1) {
        rule.options.plugins.push(replaceLib);
      }
      rule.options.plugins = rule.options.plugins.filter(
        plugin => !plugin.indexOf || plugin.indexOf('babel-plugin-add-module-exports') === -1,
      );
    } else if (rule.use) {
      alertBabelConfig(rule.use);
    }
  });
}

module.exports = {
  port: 8001,
  hash: true,
  root: '/choerodon-ui/',
  source: {
    components: './components',
    'components-pro': './components-pro',
    docs: './docs',
    changelog: ['CHANGELOG.zh-CN.md', 'CHANGELOG.en-US.md'],
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
      'Pro Components': 99,
      Components: 100,
    },
    typeOrder: {
      Abstract: 0,
      General: 1,
      Layout: 2,
      Navigation: 3,
      'Data Entry': 4,
      'Data Display': 5,
      Feedback: 6,
      Localization: 7,
      Other: 8,
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
  },
  lessConfig: {
    javascriptEnabled: true,
    // modifyVars: {
    //   // 'c7n-root-entry-name': 'variables',
    // },
  },
  webpackConfig(config) {
    config.resolve.alias = {
      'choerodon-ui/dataset': path.resolve('components-dataset'),
      'choerodon-ui/shared': path.resolve('components-shared'),
      'choerodon-ui/pro/lib': path.resolve('components-pro'),
      'choerodon-ui/pro': path.resolve('index-pro'),
      'choerodon-ui/lib': path.resolve('components'),
      'choerodon-ui': path.resolve('index'),
      site: path.resolve('site'),
      'react-router': 'react-router/umd/ReactRouter',
    };

    config.externals = {
      'react-router-dom': 'ReactRouterDOM',
    };

    config.module.rules.forEach(rule => {
      if (rule.loader && rule.loader === require.resolve('babel-loader')) {
        if (rule.exclude) {
          rule.exclude = [rule.exclude, rcPath];
        } else {
          rule.exclude = rcPath;
        }
      }
    });

    const rcComponentsRule = {
      test: /\.jsx?$/,
      include: [rcPath],
      loader: require.resolve('babel-loader'),
      options: babelOptions,
    };

    config.module.rules.unshift(rcComponentsRule);

    alertBabelConfig(config.module.rules);

    rcComponentsRule.options.plugins.push(
      require.resolve('@babel/plugin-transform-proto-to-assign'),
      // [require.resolve('@babel/plugin-transform-classes'), { loose: true }],
    );

    config.plugins.push(
      new CSSSplitWebpackPlugin({ size: 4000 }),
      new webpack.DefinePlugin({
        'process.env.LOGGER_LEVEL': JSON.stringify('info'),
      }),
    );

    if (isDev) {
      config.devtool = '#source-map';
    }

    return config;
  },
};
