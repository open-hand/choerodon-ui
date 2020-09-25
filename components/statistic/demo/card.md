---
order: 2
title:
  zh-CN: 在卡片中使用
  en-US: In Card
---

## zh-CN

在卡片中展示统计数值。

## en-US

Display statistic data in Card.

```jsx
import { Statistic, Card, Row, Col,Icon } from 'choerodon-ui';

ReactDOM.render(
  <div className="site-statistic-demo-card">
    <Row gutter={16}>
      <Col span={12}>
        <Card>
          <Statistic
            title="Active"
            value={11.28}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            prefix={<Icon type="backup-o" />}
            suffix="%"
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card>
          <Statistic
            title="Idle"
            value={9.3}
            precision={2}
            valueStyle={{ color: '#cf1322' }}
            prefix={<Icon type="cloud_download-o" />}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  </div>,
  mountNode,
);
```

```css
.site-statistic-demo-card {
  background: #ececec;
  padding: 30px;
}
```

<style>
  [data-theme="dark"] .site-statistic-demo-card {
    background: #303030;
  }
</style>
