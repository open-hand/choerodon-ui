---
order: 4
title:
  zh-CN: 气泡显示
  en-US: Popup
---

## zh-CN

气泡显示

## en-US

Popup

````jsx
import { Attachment, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const [value, setValue] = React.useState();
  const props = {
    label: '技术附件',
    labelLayout: 'float',
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    max: 9,
    value,
    onChange: setValue,
    help: '支持文件类型： .deb .txt .pdf image/*',
    viewMode: 'popup',
  };

  React.useEffect(() => {
    setValue('4c74a34a-fa37-4e92-be9d-5cf726fb1472');
  }, []);

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
