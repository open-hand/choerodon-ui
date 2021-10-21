---
order: 2
title:
  zh-CN: 图片附件
  en-US: Basic Usage
---

## zh-CN

图片附件

## en-US

Basic Usage

````jsx
import { Attachment, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const [value, setValue] = React.useState('4c74a34a-fa37-4e92-be9d-5cf726fb1472');
  const props = {
    label: '技术附件',
    labelLayout: 'float',
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    listType: 'picture',
    value,
    onChange: setValue,
  };

  return (
    <Row gutter={10}>
      <Col span={12}>
        <Attachment {...props} />
      </Col>
      <Col span={12}>
        <Attachment readOnly {...props} />
      </Col>
    </Row>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
