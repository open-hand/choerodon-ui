const gulp = require('gulp');

function copyFont(dir) {
  gulp.src('node_modules/choerodon-ui-font/fonts/*')
    .pipe(gulp.dest(dir));
}

copyFont('lib/style/core/fonts');
copyFont('es/style/core/fonts');
copyFont('components/style/core/fonts');
