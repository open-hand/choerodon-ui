---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN

展示文档样例。

## en-US

Display the document sample.

```jsx
import React from 'react';
import { Typography } from 'choerodon-ui/pro';

const { Title, Paragraph, Text, Link } = Typography;

const blockContent = `自汉得宣布开源以来，Choerodon猪齿鱼已被上千个组织所使用，帮助企业完成软件的生命周期管理，从而更快、更频繁地交付更稳定的软件。经过一千一百多天的奋战，2021年06月30日，Choerodon猪齿鱼迎来了1.0先行版正式发布，标志着Choerodon猪齿鱼走向的成熟和稳定，欢迎各位升级体验。`;

ReactDOM.render(
  <Typography>
    <Title>Introduction</Title>
    <Paragraph>
      In the process of internal desktop applications development, many different design specs and
      implementations would be involved, which might cause designers and developers difficulties and
      duplication and reduce the efficiency of development.
    </Paragraph>
    <Paragraph>
      After massive project practice and summaries, Choerodon-ui Design, a design language for background
      applications, is refined by Choerodon-ui UED Team, which aims to <Text strong>
        uniform the user interface specs for internal background projects, lower the unnecessary
        cost of design differences and implementation and liberate the resources of design and
        front-end development</Text>.
    </Paragraph>
    <Title level={2}>Guidelines and Resources</Title>
    <Paragraph>
      We supply a series of design principles, practical patterns and high quality design resources
      (<Text code>Sketch</Text> and <Text code>Axure</Text>), to help people create their product
      prototypes beautifully and efficiently.
    </Paragraph>

    <Paragraph>
      <ul>
        <li>
          <Link href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/introduce">Principles</Link>
        </li>
        <li>
          <Link href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/ued-theme">Patterns</Link>
        </li>
        <li>
          <Link href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/customize-theme">Resource Download</Link>
        </li>
      </ul>
    </Paragraph>

    <Paragraph>
      Press <Text keyboard>Esc</Text> to exit...
    </Paragraph>

    <br />

    <Title>介绍</Title>
    <Paragraph>
      自汉得宣布开源以来，Choerodon猪齿鱼已被上千个组织所使用，帮助企业完成软件的生命周期管理，从而更快、更频繁地交付更稳定的软件。经过一千一百多天的奋战，2021年06月30日，Choerodon猪齿鱼迎来了1.0先行版正式发布，标志着Choerodon猪齿鱼走向的成熟和稳定，欢迎各位升级体验。
    </Paragraph>
    <Paragraph>
     拥有开箱即用的高质量 React 组件，全链路开发和设计工具体系，帮助企业级中后台产品提升开发效率。自V 0.1.0就开始支撑Choerodon猪齿鱼的前端组件，并在2021年2月4日发布稳定开发正式版 V 1.0，支持平滑升级，目前除了Choerodon猪齿鱼还支撑着HZERO、飞搭等产品的前端组件。
      Choerodon-ui 基于<Text mark>『DataSet』和『抽象组件』</Text>
      的设计，通过模块化的解决方案，降低冗余的生产成本，让设计者专注于
      <Text strong>更好的用户体验</Text>。
    </Paragraph>
    <Title level={2}>设计资源</Title>
    <Paragraph>
      我们提供完善的设计原则、最佳实践和设计资源文件（<Text code>Sketch</Text> 和
      <Text code>Axure</Text>），来帮助业务快速设计出高质量的产品原型。
    </Paragraph>

    <Paragraph>
      <ul>
        <li>
          <a href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/introduce">设计原则</a>
        </li>
        <li>
          <a href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/ued-theme">主题切换</a>
        </li>
        <li>
          <a href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/customize-theme">定制主题</a>
        </li>
      </ul>
    </Paragraph>

    <Paragraph>
      <blockquote>{blockContent}</blockquote>
      <pre>{blockContent}</pre>
    </Paragraph>

    <Paragraph>
      按<Text keyboard>Esc</Text>键退出阅读……
    </Paragraph>
  </Typography>,
  mountNode,
);
```
