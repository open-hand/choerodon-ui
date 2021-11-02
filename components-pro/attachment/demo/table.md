---
order: 6
title:
  zh-CN: 在表格中显示
  en-US: Display in Table
---

## zh-CN

在表格中显示

## en-US

Display in Table

````jsx
import { Attachment, Table, DataSet, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(() => new DataSet({
    fields: [
      { name: 'attachment', type: 'attachment', label: '技术附件', max: 9, accept: ['.deb', '.txt', '.pdf', 'image/*'], required: true },
      { name: 'attachment2', type: 'attachment', label: '管理附件' },
      { name: 'attachment3', type: 'attachment', label: '项目附件' },
    ],
    data: [{
      attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472',
      attachment2: '88888888-fa37-4e92-be9d-5cf726fb1472',
    }, {}, {}],
  }), []);
  const columns = React.useMemo(() => [
    { name: 'attachment', editor: <Attachment viewMode="popup" funcType="link" /> },
    { name: 'attachment2' },
    { name: 'attachment3', editor: true },
  ], []);

  return (
    <Table dataSet={ds} columns={columns} />
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
