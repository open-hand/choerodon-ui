---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

基本使用

## en-US

Basic Usage

````jsx
import { configure, Row, Col, Button } from 'choerodon-ui';
import { Attachment, Axios } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import moment from 'moment';

const fetchList = ({ attachmentUUID }) => {
  return Axios.get(`/attachment/${attachmentUUID}`).then(response => {
    return response.map(file => ({
      uid: file.fileId,
      name: file.fileName,
      size: file.fileSize,
      type: file.fileType,
      url: file.fileUrl,
      creationDate: moment(file.creationDate).toDate(),
      status: 'done',
    }));
  });
}
const imgs = ['png', 'gif', 'jpg', 'webp', 'jpeg', 'bmp', 'tif', 'pic', 'svg'];
// 使用附件功能前需要在全局配置中配置如下， 开发者无需配置
configure({
  attachment: {
    defaultFileKey: 'file',
    defaultFileSize: 500 * 1024 * 1024,
    defaultChunkSize: 5 * 1024 * 1024,
    defaultChunkThreads: 3,
    action: {
      url: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    fetchList,
    fetchFileSize: () => Promise.resolve(500 * 1024 * 1024),
    batchFetchCount(uuids){
      return Axios.get(`/attachment-count/${uuids.sort().join(',')}`);
    },
    onRemove() {
      return new Promise((resolve) => setTimeout(() => resolve(Math.random() >= 0.1), 1000));
    },
    onOrderChange() {
      return Promise.resolve();
    },
    getAttachmentUUID() {
      return uuid();
    },
    getPreviewUrl({ attachment }) {
      const { ext, type, url } = attachment;
      const isPicture = type.startsWith('image') || imgs.includes(ext)
      if (isPicture) {
        return url;
      }
      // 可以异步获取一些认证信息再跳转预览
      return () => Promise.resolve(url);
    },
    getDownloadAllUrl({ attachmentUUID }) {
      return `/${attachmentUUID}`;
    },
    getTemplateDownloadUrl({ attachmentUUID }) {
      return fetchList({ attachmentUUID }).then((res) => {
        if (res && res.length > 0) {
          return res[0].url;
        }
      });
    },
    onBeforeUploadChunk(chunk) {
      if (chunk) {
        // do chunk upload check
      }
    },
    onUploadSuccess(resp, attachment, useChunk) {
      if (useChunk) {
        // do chunks upload complete
      } else if (resp) {
        attachment.load({
          name: resp.name,
          uid: uuid(),
          // url: resp.url,
        });
      }
    },
    renderHistory() {
      return 'empty';
    }
  }
});
const attachmentUUID1 = '4c74a34a-fa37-4e92-be9d-5cf726fb1472';
const attachmentUUID2 = '88888888-fa37-4e92-be9d-5cf726fb1472';
const App = () => {

  const [value, setValue] = React.useState(attachmentUUID1);
  const props = {
    label: '技术附件',
    labelLayout: 'float',
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    max: 9,
    value,
    onChange: setValue,
    showHistory: true,
    useChunk: true,
    chunkSize: 1024,
    help: '支持文件类型： .deb .txt .pdf image/*',
  };
  
  const getPreviewUrl = (props) => {
    console.log('getPreviewUrl', props);
    return undefined;
  };

  return (
    <Row gutter={10}>
      <Col span={12}>
        <Attachment {...props} />
        <Button onClick={() => setValue((pre)=> pre === attachmentUUID1 ? attachmentUUID2 : attachmentUUID1)}>切换附件</Button>
        <Button onClick={() => setValue()}>置空</Button>
      </Col>
      <Col span={12}>
        <Attachment readOnly getPreviewUrl={getPreviewUrl} {...props} />
      </Col>
    </Row>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
