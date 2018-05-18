/* eslint-disable */
const program = require('commander');
const path = require('path');
const fs = require('fs');

const output = './_site';

program
  .option('-c, --config <path>', 'set config path. defaults to ./bisheng.config.js')
  .option('-p, --push-only [dir]', 'push the directory to gh-pages directly without build. defaults to ./_site')
  .option('--ssr', 'whether to enable ssr while building pages.')
  .option('-r, --remote <name>', 'The name of the remote', 'origin')
  .option('-b, --branch <branch>', 'name of the branch you\'ll be pushing to', 'gh-pages')
  .parse(process.argv);

function copy(srcDir, src, dist) {
  const srcPath = path.join(srcDir, src);
  const distPath = path.join(process.cwd(), dist, src);
  console.log(srcPath, '--------->', distPath);
  if (fs.statSync(srcPath).isDirectory()) {
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }
    fs.readdirSync(srcPath).forEach(function (file) {
      copy(srcDir, path.join(src, file), dist);
    });
  } else {
    fs.writeFileSync(distPath, fs.readFileSync(srcPath));
  }
}

copy(process.cwd(), 'auto_devops', output);
copy(process.cwd(), 'gitlab-ci.yml', output);
copy(process.cwd(), 'Dockerfile', output);
// copy(path.join(process.cwd(), 'components', 'icon'), 'fonts', output);
