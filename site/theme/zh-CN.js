import componentsLocale from 'choerodon-ui/lib/locale-provider/zh_CN';
import proComponentsLocale from 'choerodon-ui/pro/lib/locale-context/zh_CN';

const appLocaleData = require('react-intl/locale-data/zh');

require('moment/locale/zh-cn');

export default {
  locale: 'zh-CN',
  data: appLocaleData,
  componentsLocale,
  proComponentsLocale,
  messages: {
    'app.header.menu.home': '首页',
    'app.header.menu.gitee': '国内镜像',
    'app.header.menu.doc': '文档',
    'app.header.menu.components': '组件',
    'app.header.menu.pro-components': 'Pro组件',
    'app.header.lang': 'English',
    'app.content.edit-page': '在 Github 上编辑此页！',
    'app.component.examples': '代码演示',
    'app.demo.copy': '复制代码',
    'app.demo.copied': '复制成功',
    'app.demo.codepen': '在 CodePen 中打开',
    'app.demo.codesandbox': '在 CodeSandbox 中打开',
    'app.demo.stackblitz': '在 Stackblitz 中打开',
    'app.home.based-on-ant-design': '——基于Ant Design@3.4.0',
    'app.home.introduce':
      'Choerodon UI 是一组基于 Ant Design Components 实现谷歌的 Material Design 的 React 组件，用于开发和服务于企业级后台产品。',
    'app.home.feature': '特性',
    'app.home.getting-started': '开始使用',
    'app.footer.resources': '相关资源',
    'app.footer.help': '帮助',
    'app.footer.change-log': '更新记录',
    'app.footer.issues': '讨论列表',
    'app.docs.color.pick-primary': '选择你的主色',
  },
};
