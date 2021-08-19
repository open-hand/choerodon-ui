---
order: 3
title:
  zh-CN: 照片墙
  en-US: Pictures Wall
---

## zh-CN

用户可以上传图片并在列表中显示缩略图。

## en-US

After users upload picture, the thumbnail will be shown in list. The upload button will disappear when count meets limitation.

````jsx
import { Attachment, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const [value, setValue] = React.useState('88888888-fa37-4e92-be9d-5cf726fb1472');
  const props = {
    label: '技术附件',
    labelLayout: 'float',
    accept: ['image/*'],
    listType: 'picture-card',
    max: 9,
    listLimit: 5,
    value,
    onChange: setValue,
    help: '图片支持PNG、JPG、JPEG格式，且不能大于1M',
    fileSize: 1024 * 1024,
  };

  return (
    <Row gutter={10}>
      <Col span={24}>
        <Attachment {...props} />
      </Col>
      <Col span={24}>
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
