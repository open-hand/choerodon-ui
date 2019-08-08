const path = require('path');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const deepAssign = require('deep-assign');
const postcssConfig = require('./postcssConfig');

module.exports = function (modules) {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const babelConfig = require('./getBabelCommonConfig')(modules || false);

  const pluginImportOptions = [
    {
      style: true,
      libraryName: pkg.name,
      libraryDirectory: 'components',
    },
    {
      style: true,
      libraryName: pkg.name + '/pro',
      libraryDirectory: 'components-pro',
    },
  ];

  babelConfig.plugins.push([
    require.resolve('babel-plugin-import'),
    pluginImportOptions,
  ]);

  const config = {
    devtool: 'source-map',

    output: {
      path: path.join(process.cwd(), './dist/'),
      filename: '[name].js',
    },

    resolve: {
      modules: ['node_modules'],
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
      ],
      alias: {
        [`${pkg.name}/lib`]: path.join(process.cwd(), 'components'),
        [pkg.name]: process.cwd(),
      },
    },

    node: [
      'child_process',
      'cluster',
      'dgram',
      'dns',
      'fs',
      'module',
      'net',
      'readline',
      'repl',
      'tls',
    ].reduce((acc, name) => Object.assign({}, acc, { [name]: 'empty' }), {}),

    module: {
      noParse: [/moment.js/],
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: babelConfig,
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: babelConfig,
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: Object.assign(
                  {},
                  postcssConfig,
                  { sourceMap: true },
                ),
              },
            ],
          }),
        },
        {
          test: /\.less$/,
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: Object.assign(
                  {},
                  postcssConfig,
                  { sourceMap: true },
                ),
              },
              {
                loader: 'less-loader',
                options: {
                  sourceMap: true,
                  modifyVars: {
                    'c7n-icon-url': JSON.stringify('https://choerodon.github.io/choerodon-ui-font/icomoon'),
                  },
                },
              },
            ],
          }),
        },
      ],
    },

    plugins: [
      new ExtractTextPlugin({
        filename: '[name].css',
        disable: false,
        allChunks: true,
      }),
      new CaseSensitivePathsPlugin(),
      new webpack.BannerPlugin(`
${pkg.name} v${pkg.version}
      `),
      new WebpackBar({
        name: '🚚  Choerodon Tools',
      }),
    ],
  };

  if (process.env.RUN_ENV === 'PRODUCTION') {
    const entry = ['./index'];
    const entryPro = ['./index-pro'];
    config.entry = {
      [`${pkg.name}.min`]: entry,
      [`${pkg.name}-pro.min`]: entryPro,
    };

    config.externals = {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom',
      },
      'mobx': {
        root: 'mobx',
        commonjs2: 'mobx',
        commonjs: 'mobx',
        amd: 'mobx',
      },
    };
    config.output.library = '[name]';
    config.output.libraryTarget = 'umd';

    const uncompressedConfig = deepAssign({}, config);

    config.plugins = config.plugins.concat([
      new webpack.optimize.UglifyJsPlugin({
        output: {
          ascii_only: true,
        },
        compress: {
          warnings: false,
        },
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      }),
    ]);

    uncompressedConfig.entry = {
      [pkg.name]: entry,
      [`${pkg.name}-pro`]: entryPro,
    };

    uncompressedConfig.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }));

    return [config, uncompressedConfig];
  }

  return config;
};
