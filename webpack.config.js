// This config is for building dist files
const { ReplaceSource } = require('webpack-sources');
const getWebpackConfig = require('./tools/getWebpackConfig');
const pkg = require('./package.json');

const { webpack } = getWebpackConfig;

// noParse still leave `require('./locale' + name)` in dist files
// ignore is better
// http://stackoverflow.com/q/25384360
function ignoreMomentLocale(webpackConfig) {
  delete webpackConfig.module.noParse;
  webpackConfig.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
}

function addLocales(webpackConfig) {
  let packageName = `${pkg.name}-with-locales`;
  let packageNamePro = `${pkg.name}-pro-with-locales`;
  if (webpackConfig.entry[`${pkg.name}.min`]) {
    packageName += '.min';
  }
  if (webpackConfig.entry[`${pkg.name}-pro.min`]) {
    packageNamePro += '.min';
  }
  webpackConfig.entry[packageName] = './index-with-locales.js';
  webpackConfig.entry[packageNamePro] = './index-pro-with-locales.js';
  webpackConfig.output.filename = '[name].js';
}

function externalMoment(config) {
  config.externals.moment = {
    root: 'moment',
    commonjs2: 'moment',
    commonjs: 'moment',
    amd: 'moment',
  };
}

const webpackConfig = getWebpackConfig(false);
if (process.env.RUN_ENV === 'PRODUCTION') {
  webpackConfig.forEach(config => {
    ignoreMomentLocale(config);
    externalMoment(config);
    addLocales(config);
    config.plugins.push({
      apply: compiler => {
        const replaceLibraryConfigList = [
          {
            from: /choerodon-ui(-with-locales(\.min)?)/gi,
            to: 'choerodon-ui',
          },
          {
            from: /choerodon-ui-pro(-with-locales(\.min)?)/gi,
            to: 'choerodon-ui/pro',
          },
        ];
        compiler.hooks.compilation.tap('compilation', compilation => {
          const { mainTemplate, chunkTemplate } = compilation;
          // eslint-disable-next-line no-restricted-syntax
          for (const template of [mainTemplate, chunkTemplate]) {
            template.hooks.renderWithEntry.tap('UmdMainTemplatePlugin', (source, entry) => {
              const entryName = entry.name;
              const findReplaceCfg = replaceLibraryConfigList.find(replaceCfg => {
                return replaceCfg.from.test(entryName);
              });
              if (findReplaceCfg) {
                let newSource = source;
                let startPos = -1;
                while (
                  // eslint-disable-next-line no-cond-assign
                  (startPos = newSource
                    .source()
                    .indexOf(entryName, startPos > 0 ? startPos : undefined)) !== -1
                ) {
                  newSource = new ReplaceSource(newSource);
                  newSource.replace(startPos, startPos + entryName.length - 1, findReplaceCfg.to);
                }
                return newSource;
              }
              return source;
            });
          }
        });
      },
    });
  });
}

module.exports = webpackConfig;
