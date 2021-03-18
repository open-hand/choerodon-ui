import componentsLocale from 'choerodon-ui/lib/locale-provider/en_US';
import proComponentsLocale from 'choerodon-ui/pro/lib/locale-context/en_US';

const appLocaleData = require('react-intl/locale-data/en');

export default {
  locale: 'en-US',
  data: appLocaleData,
  componentsLocale,
  proComponentsLocale,
  messages: {
    'app.header.menu.home': 'Home',
    'app.header.menu.gitee': 'Gitee',
    'app.header.menu.doc': 'Document',
    'app.header.menu.components': 'Components',
    'app.header.menu.pro-components': 'Pro Components',
    'app.header.lang': '中文',
    'app.content.edit-page': 'Edit this page on GitHub!',
    'app.component.examples': 'Examples',
    'app.demo.copy': 'Copy code',
    'app.demo.copied': 'Copied!',
    'app.demo.codepen': 'Open in CodePen',
    'app.demo.codesandbox': 'Open in CodeSandbox',
    'app.demo.stackblitz': 'Open in Stackblitz',
    'app.home.based-on-ant-design': '——based on Ant Design@3.4.0',
    'app.home.introduce':
      'Choerodon UI is a set of React components based on Ant Design Components that implement Google\'s material design for developing and serving enterprise back-end products.',
    'app.home.feature': 'Feature',
    'app.home.getting-started': 'Getting Started',
    'app.footer.resources': 'Resources',
    'app.footer.help': 'Help',
    'app.footer.change-log': 'Change Log',
    'app.footer.issues': 'Issues',
    'app.docs.color.pick-primary': 'Pick your primary color',
  },
};
