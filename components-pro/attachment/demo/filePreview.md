---
order: 8
title:
  zh-CN: 文件预览
  en-US: File preview
---

## zh-CN

设置 getPreviewUrl 可以设置预览地址，默认使用 AttachmentFile.url 预览

示例展示了 同步 和 异步 设置预览地址

## en-US

File preview

```jsx
import { Row, Col } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';

// 视频文件类型
const attachmentUUID1 = 'qwera34a-fa37-4e92-be9d-5cf726fb1472';
// 图片文件类型
const attachmentUUID2 = '4c74a34a-fa37-4e92-be9d-5cf726fb1472';
const App = () => {
  const [value, setValue] = React.useState(attachmentUUID1);
  const [value2, setValue2] = React.useState(attachmentUUID2);
  const props = {
    label: '技术附件',
    labelLayout: 'float',
    max: 9,
    showHistory: true,
  };

  const getPreviewUrl = (props) => {
    console.log('getPreviewUrl', props);
    // 返回具体预览地址
    // return 'https://www.bilibili.com/video/BV1tg411Q7Wk/?spm_id_from=333.999.0.0&vd_source=320c615b96f3210ef81bd881e5041647';
    return props.attachment.url;
  };

  // 异步请求预览地址示例
  const getPreviewUrlAsync = (props) => {
    return () => {
      console.log('getPreviewUrlAsync', props);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(props.attachment.url);
        }, 1000);
      });
    }
  };

  return (
    <Row gutter={10}>
      <Col span={12}>
        <div>视频文件自定义预览：</div>
        <Attachment
          {...props}
          value={value}
          onChange={setValue}
          accept={['.mp4']}
          help='支持文件类型： .mp4'
          getPreviewUrl={getPreviewUrl}
        />
      </Col>
      <Col span={12}>
        <div>图片文件自定义异步预览：</div>
        <Attachment
          {...props}
          value={value2}
          onChange={setValue2}
          accept={['image/*']}
          help='支持文件图片类型'
          getPreviewUrl={getPreviewUrlAsync}
        />
      </Col>
    </Row>
  );
};

ReactDOM.render(
  <App />,
  mountNode,
);
```
