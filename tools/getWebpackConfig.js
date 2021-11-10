const { getProjectPath, resolve, injectRequire } = require('./utils/projectHelper'); // eslint-disable-line import/order

injectRequire();

// Show warning for webpack
process.traceDeprecation = true;

// Normal requirement
const path = require('path');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const webpackMerge = require('webpack-merge');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const postcssConfig = require('./postcssConfig');
const CleanUpStatsPlugin = require('./utils/CleanUpStatsPlugin');

const limit = 10000;
const svgRegex = /\.svg(\?v=\d+\.\d+\.\d+)?$/;
const svgOptions = {
  limit,
  minetype: 'image/svg+xml',
};

const imageOptions = {
  limit,
};

function getAssetLoader(props) {
  return {
    loader: 'url-loader',
    options: {
      ...props,
      name: '[name].[hash:8].[ext]',
    },
  };
}

function getWebpackConfig(modules) {
  const pkg = require(getProjectPath('package.json'));
  const babelConfig = require('./getBabelCommonConfig')(modules || false);

  // babel import for components
  babelConfig.plugins.push(
    [
      resolve('babel-plugin-import'),
      {
        style: true,
        libraryName: pkg.name,
        libraryDirectory: 'components',
      },
      'c7n',
    ],
    [
      resolve('babel-plugin-import'),
      {
        style: true,
        libraryName: pkg.name + '/pro',
        libraryDirectory: 'components-pro',
      },
      'c7n-pro',
    ],
  );

  const config = {
    devtool: 'source-map',

    output: {
      path: getProjectPath('./dist/'),
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
        [`${pkg.name}/dataset`]: getProjectPath('components-dataset'),
        [`${pkg.name}/shared`]: getProjectPath('components-shared'),
        [`${pkg.name}/pro/lib`]: getProjectPath('components-pro'),
        [`${pkg.name}/pro`]: getProjectPath('index-pro'),
        [`${pkg.name}/lib`]: getProjectPath('components'),
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
          loader: resolve('babel-loader'),
          options: babelConfig,
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: resolve('babel-loader'),
              options: babelConfig,
            },
            {
              loader: resolve('ts-loader'),
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: Object.assign({}, postcssConfig, { sourceMap: true }),
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: Object.assign({}, postcssConfig, { sourceMap: true }),
            },
            {
              loader: resolve('less-loader'),
              options: {
                javascriptEnabled: true,
                sourceMap: true,
                // modifyVars: {
                //   'c7n-icon-url': JSON.stringify(
                //     'https://choerodon.github.io/choerodon-ui-font/icomoon',
                //   ),
                // },
              },
            },
          ],
        },
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader({
            limit,
            mimetype: 'application/font-woff',
          }),
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader({
            limit,
            mimetype: 'application/font-woff',
          }),
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader({
            limit,
            mimetype: 'application/octet-stream',
          }),
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader({
            limit,
            mimetype: 'application/vnd.ms-fontobject',
          }),
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader(svgOptions),
        },
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          use: getAssetLoader(imageOptions),
        },
      ],
    },

    plugins: [
      new CaseSensitivePathsPlugin(),
      new webpack.BannerPlugin(`
${pkg.name} v${pkg.version}
      `),
      new WebpackBar({
        name: '🚚  Choerodon Tools',
        color: '#3f51b5',
      }),
      new CleanUpStatsPlugin(),
      new FilterWarningsPlugin({
        // suppress conflicting order warnings from mini-css-extract-plugin.
        // ref: https://github.com/ant-design/ant-design/issues/14895
        // see https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
        exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
      }),
    ],

    performance: {
      hints: false,
    },
  };

  if (process.env.RUN_ENV === 'PRODUCTION') {
    const entry = ['./index'];
    const entryPro = ['./index-pro'];
    const entryDemoDataMock = ['./site/theme/mock/browser-online-demo'];

    // Common config
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
      mobx: {
        root: 'mobx',
        commonjs2: 'mobx',
        commonjs: 'mobx',
        amd: 'mobx',
      },
    };
    config.output.library = '[name]';
    config.output.libraryTarget = 'umd';
    config.optimization = {
      minimizer: [
        new TerserJSPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
        }),
      ],
    };

    // Development
    const uncompressedConfig = webpackMerge({}, config, {
      entry: {
        [pkg.name]: entry,
        [`${pkg.name}-pro`]: entryPro,
        [`${pkg.name}-demo-data-mock`]: entryDemoDataMock,
      },
      mode: 'development',
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
      ],
    });

    // Production
    const prodConfig = webpackMerge({}, config, {
      entry: {
        [`${pkg.name}.min`]: entry,
        [`${pkg.name}-pro.min`]: entryPro,
        [`${pkg.name}-demo-data-mock.min`]: entryDemoDataMock,
      },
      mode: 'production',
      plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.LoaderOptionsPlugin({
          minimize: true,
        }),
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
      ],
      optimization: {
        minimizer: [new OptimizeCSSAssetsPlugin({})],
      },
    });

    return [prodConfig, uncompressedConfig];
  }

  return config;
}

getWebpackConfig.webpack = webpack;
getWebpackConfig.svgRegex = svgRegex;
getWebpackConfig.svgOptions = svgOptions;
getWebpackConfig.imageOptions = imageOptions;

module.exports = getWebpackConfig;
