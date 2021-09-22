---
order: 2
title:
  zh-CN: 绑定数据源
  en-US: DataSet Binding
---

## zh-CN

绑定数据源

## en-US

````jsx
import { Attachment, DataSet, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(() => new DataSet({
    fields: [{ name: 'attachment', type: 'attachment', label: <span>技术附件</span>, max: 9, required: true }],
  }), []);
  const props = {
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    name: 'attachment',
    dataSet: ds,
    labelLayout: 'float',
  };

  React.useEffect(() => {
    ds.loadData([{ attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472' }]);
setTimeout(() => {
    ds.loadData([{ attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472' }]);
}, 0);
setTimeout(() => {
    ds.loadData([{ attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472' }]);
}, 0);
  }, []);

  return (
    <Row gutter={10}>
      <Col span={12}>
        <Attachment {...props} />
      </Col>
    </Row>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
