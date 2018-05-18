const path = require('path');
const getBabelCommonConfig = require('antd-tools/lib/getBabelCommonConfig');
const replaceLib = require('antd-tools/lib/replaceLib');
const babel = require('gulp-babel');
const through2 = require('through2');
const gulp = require('gulp');

const cwd = process.cwd();
const libDir = path.join(cwd, 'lib/rc-components');
const esDir = path.join(cwd, 'es/rc-components');

function babelify(js, modules) {
  const babelConfig = getBabelCommonConfig(modules);
  delete babelConfig.cacheDirectory;
  if (modules === false) {
    babelConfig.plugins.push(replaceLib);
  } else {
    babelConfig.plugins.push(require.resolve('babel-plugin-add-module-exports'));
  }
  babelConfig.plugins.push(
    require.resolve('babel-plugin-transform-proto-to-assign'),
    [require.resolve('babel-plugin-transform-es2015-classes'), { loose: true }]
  );
  const stream = js.pipe(babel(babelConfig))
    .pipe(through2.obj(function z(file, encoding, next) {
      this.push(file.clone());
      next();
    }));
  return stream.pipe(gulp.dest(modules === false ? esDir : libDir));
}

const source = [
  'components/rc-components/**/*.jsx',
  'components/rc-components/**/*.js',
];
const resultJs = gulp.src(source);
babelify(resultJs, false);
babelify(resultJs);
