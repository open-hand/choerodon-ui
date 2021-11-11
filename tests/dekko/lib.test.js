const $ = require('dekko');
const chalk = require('chalk');

function check(dir, onlyRoot) {
  $(dir)
    .isDirectory()
    .hasFile('index.js')
    .hasFile('index.d.ts');
  if (!onlyRoot) {
    $(`${dir}/*`)
      .filter(
        filename =>
          !filename.endsWith('index.js') &&
          !filename.endsWith('index.d.ts') &&
          !filename.endsWith('.map'),
      )
      .isDirectory()
      .filter(
        filename =>
          !filename.endsWith('style') &&
          !filename.endsWith('rc-components') &&
          !filename.endsWith('_util'),
      )
      .hasFile('index.js')
      .hasFile('index.d.ts')
      .hasDirectory('style');

    $(`${dir}/*/style`)
      .hasFile('css.js')
      .hasFile('index.js');

    if (dir === 'lib') {
      $(`${dir}/style`).hasFile('v2-compatible-reset.css');
    }
  }

  // eslint-disable-next-line
  console.log(chalk.green(`✨ \`${dir}\` directory is valid.`));
}

check('dataset', true);
check('shared', true);
check('lib');
check('pro/lib');
