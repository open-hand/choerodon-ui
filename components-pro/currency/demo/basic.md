---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import { Currency, Row, Col } from 'choerodon-ui/pro';
import { ConfigProvider } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <ConfigProvider inputDecimalSeparatorFollowLang>
      <Row gutter={10}>
        <Col span={8}>
          <Currency defaultValue={123456.789} />
        </Col>
        <Col span={8}>
          <Currency currency="CNY" defaultValue={123456.789} precision={3} />
        </Col>
        <Col span={8}>
          <Currency currency="EUR" lang="de-DE" defaultValue={123456.789} />
        </Col>
      </Row>
    </ConfigProvider>
  </div>,
  mountNode
);
````
