---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

基本使用

## en-US

````jsx
import { configure, Row, Col } from 'choerodon-ui';
import { Attachment, Axios } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import moment from 'moment';

// 使用附件功能前需要在全局配置中配置如下， 开发者无需配置
configure({
  attachment: {
    defaultFileKey: 'file',
    defaultFileSize: 500 * 1024 * 1024,
    action: {
      url: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    fetchList({ attachmentUUID }) {
      return Axios.get(`/attachment/${attachmentUUID}`).then(reponse => {
        return reponse.map(file => ({
          uid: file.fileId,
          name: file.fileName,
          size: file.fileSize,
          type: file.fileType,
          url: file.fileUrl,
          creationDate: moment(file.creationDate).toDate(),
          status: 'done',
        }));
      });
    },
    batchFetchCount(uuids){
      return Axios.get(`/attachment-count/${uuids.sort().join(',')}`);
    },
    onRemove() {
      return new Promise((resolve) => setTimeout(() => resolve(Math.random() >= 0.3), 1000));
    },
    onOrderChange() {
      return Promise.resolve();
    },
    getAttachmentUUID() {
      return uuid();
    },
    getPreviewUrl({ attachment }) {
      return attachment.url;
    },
    getDownloadAllUrl({ attachmentUUID }) {
      return `/${attachmentUUID}`;
    },
    onUploadSuccess(resp, attachment) {
      attachment.load({
        name: resp.name,
        uid: uuid(),
        // url: resp.url,
      });
    },
    renderHistory() {
      return 'empty';
    }
  }
});

const App = () => {
  const [value, setValue] = React.useState('4c74a34a-fa37-4e92-be9d-5cf726fb1472');
  const props = {
    label: '技术附件',
    labelLayout: 'float',
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    max: 9,
    value,
    onChange: setValue,
    showHistory: true,
    help: '支持文件类型： .deb .txt .pdf image/*',
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
