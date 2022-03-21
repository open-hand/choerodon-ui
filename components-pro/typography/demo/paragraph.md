---
order: 5
title:
  zh-CN: 标题与段落
  en-US: Title and Paragraph
debug: true
---

## zh-CN

展示标题与段落的组合。

## en-US

Display the title and paragraph.

```jsx
import React from 'react';
import { Typography } from 'choerodon-ui/pro';

const { Title, Paragraph, Text } = Typography;

ReactDOM.render(
  <>
    <Title>Introduction</Title>
    <Paragraph>
      In the process of internal desktop applications development, many different design specs and
      implementations would be involved, which might cause designers and developers difficulties and
      duplication and reduce the efficiency of development.
    </Paragraph>
    <Paragraph>
      After massive project practice and summaries, Choerodon-ui, a design language for background
      applications, is refined by Choerodon-ui UED Team, which aims to
      <Text strong>
        uniform the user interface specs for internal background projects, lower the unnecessary
        cost of design differences and implementation and liberate the resources of design and
        front-end development
      </Text>.
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
          <a href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/introduce">Principles</a>
        </li>
        <li>
          <a href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/ued-theme">Patterns</a>
        </li>
        <li>
          <a href="https://open-hand.gitee.io/choerodon-ui/zh/docs/other/customize-theme">Resource Download</a>
        </li>
      </ul>
    </Paragraph>

    <Title id="intro">介绍</Title>
    <Paragraph>
      自汉得宣布开源以来，Choerodon猪齿鱼已被上千个组织所使用，帮助企业完成软件的生命周期管理，从而更快、更频繁地交付更稳定的软件。经过一千一百多天的奋战，2021年06月30日，Choerodon猪齿鱼迎来了1.0先行版正式发布，标志着Choerodon猪齿鱼走向的成熟和稳定，欢迎各位升级体验。
    </Paragraph>
    <Paragraph>
      随着商业化的趋势，越来越多的企业级产品对更好的用户体验有了进一步的要求。带着这样的一个终极目标，我们（组件库开发人员）经过大量的项目实践和总结，逐步打磨出一个服务于企业级产品的设计体系
      Choerodon-ui。基于<Text mark>『DataSet』和『抽象组件』</Text>
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
      <ul>
        <li>I am an unordered item</li>
        <li>
          I am an unordered item with an ordered sublist
          <ol>
            <li>I am ordered</li>
          </ol>
          <ul>
            <li>I am unordered</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>
          Ordered list item with unordered sublist
          <ul>
            <li>I am unordered!</li>
            <li>I am also unordered!</li>
          </ul>
        </li>
      </ol>
    </Paragraph>
  </>,
  mountNode,
);
```
