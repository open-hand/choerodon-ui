// This config is for building dist files
const chalk = require('chalk');
const RemovePlugin = require('remove-files-webpack-plugin');
const { ReplaceSource } = require('webpack-sources');
const getWebpackConfig = require('./tools/getWebpackConfig');
const pkg = require('./package.json');

const { webpack } = getWebpackConfig;

function injectLessVariables(config, variables) {
  (Array.isArray(config) ? config : [config]).forEach(conf => {
    conf.module.rules.forEach(rule => {
      // filter less rule
      if (rule.test instanceof RegExp && rule.test.test('.less')) {
        const lessRule = rule.use[rule.use.length - 1];
        if (lessRule.options.lessOptions) {
          lessRule.options.lessOptions.modifyVars = {
            ...lessRule.options.lessOptions.modifyVars,
            ...variables,
          };
        } else {
          lessRule.options.modifyVars = {
            ...lessRule.options.modifyVars,
            ...variables,
          };
        }
      }
    });
  });

  return config;
}

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

function processWebpackThemeConfig(themeConfig, theme, vars) {
  themeConfig.forEach(config => {
    ignoreMomentLocale(config);
    externalMoment(config);

    // rename default entry to ${theme} entry
    Object.keys(config.entry).forEach(entryName => {
      const originPath = config.entry[entryName];
      let replacedPath = [...originPath];

      // We will replace `./index` to `./index-style-only`
      // and `./index-pro` to `./index-pro-style-only` since theme dist only use style file
      if (originPath.length === 1 && originPath[0] === './index') {
        replacedPath = ['./index-style-only'];
        config.entry[entryName.replace('choerodon-ui', `choerodon-ui.${theme}`)] = replacedPath;
      } else if (originPath.length === 1 && originPath[0] === './index-pro') {
        replacedPath = ['./index-pro-style-only'];
        config.entry[entryName.replace('choerodon-ui-pro', `choerodon-ui-pro.${theme}`)] = replacedPath;
      } else {
        // eslint-disable-next-line no-console
        console.log(chalk.yellow('🆘 There are other entries here: '), originPath[0]);
      }

      delete config.entry[entryName];
    });

    // apply ${theme} less variables
    injectLessVariables(config, vars);

    // ignore emit ${theme} entry js & js.map file
    config.plugins.push(
      new RemovePlugin({
        after: {
          root: './dist',
          include: [
            `choerodon-ui-pro.${theme}.js`,
            `choerodon-ui-pro.${theme}.js.map`,
            `choerodon-ui-pro.${theme}.min.js`,
            `choerodon-ui-pro.${theme}.min.js.LICENSE.txt`,
            `choerodon-ui-pro.${theme}.min.js.map`,
            `choerodon-ui.${theme}.js`,
            `choerodon-ui.${theme}.js.map`,
            `choerodon-ui.${theme}.min.js`,
            `choerodon-ui.${theme}.min.js.LICENSE.txt`,
            `choerodon-ui.${theme}.min.js.map`,
          ],
          log: false,
          logWarning: false,
        },
      }),
    );
  });
}

const webpackConfig = injectLessVariables(getWebpackConfig(false), {
  'c7n-root-entry-name': 'defaultVars',
});
const webpackVariableConfig = injectLessVariables(getWebpackConfig(false), {
  'c7n-root-entry-name': 'variables',
});
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
                // eslint-disable-next-line no-cond-assign
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

  processWebpackThemeConfig(webpackVariableConfig, 'variables', {});
}

module.exports = [
  ...webpackConfig,
  ...webpackVariableConfig,
];
