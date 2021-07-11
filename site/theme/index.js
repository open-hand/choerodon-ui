require('core-js/es6/string');
const path = require('path');

const homeTmpl = './template/Home/index';
const contentTmpl = './template/Content/index';
const iframeTmpl = './template/Iframe/index';
const redirectTmpl = './template/Redirect';

const demoBabelConfig = encodeURIComponent(
  JSON.stringify({
    plugins: [
      ['@babel/plugin-transform-typescript', { isTSX: true }],
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-object-rest-spread',
    ],
  }),
);

function pickerGenerator(module) {
  const tester = new RegExp(`^docs/${module}`);
  return markdownData => {
    const { filename } = markdownData.meta;
    if (tester.test(filename) && !/\/demo$/.test(path.dirname(filename))) {
      return {
        meta: markdownData.meta,
      };
    }
  };
}

module.exports = {
  lazyLoad(nodePath, nodeValue) {
    if (typeof nodeValue === 'string') {
      return true;
    }
    return nodePath.endsWith('/demo');
  },
  pick: {
    components(markdownData) {
      const { filename } = markdownData.meta;
      if (!/^components/.test(filename) || /[/\\]demo$/.test(path.dirname(filename))) {
        return null;
      }
      return {
        meta: markdownData.meta,
      };
    },
    changelog(markdownData) {
      if (/CHANGELOG/.test(markdownData.meta.filename)) {
        return {
          meta: markdownData.meta,
        };
      }
    },
    'docs/react': pickerGenerator('react'),
    'docs/spec': pickerGenerator('spec'),
  },
  plugins: [
    'bisheng-plugin-description',
    'bisheng-plugin-toc?maxDepth=2&keepElem',
    `bisheng-plugin-choerodon-ui?babelConfig=${demoBabelConfig}`,
    'bisheng-plugin-react?lang=__react',
  ],
  routes: [{
    path: '/iframe/:demo/:component/:children/',
    component: iframeTmpl,
  }, {
    path: '/',
    component: './template/Layout/index',
    indexRoute: { component: homeTmpl },
    childRoutes: [
      {
        path: 'index-cn',
        component: homeTmpl,
      },
      {
        path: 'docs/pattern/:children',
        component: redirectTmpl,
      },
      {
        path: 'docs/react/:children',
        component: contentTmpl,
      },
      {
        path: 'changelog',
        component: contentTmpl,
      },
      {
        path: 'changelog-cn',
        component: contentTmpl,
      },
      {
        path: 'components/:children/',
        component: contentTmpl,
      },
      {
        path: 'components-pro/:children/',
        component: contentTmpl,
      },
      {
        path: 'docs/spec/feature',
        component: redirectTmpl,
      },
      {
        path: 'docs/spec/feature-cn',
        component: redirectTmpl,
      },
      {
        path: 'docs/spec/:children',
        component: contentTmpl,
      },
      {
        path: 'docs/resource/:children',
        component: redirectTmpl,
      },
    ],
  }],
};
