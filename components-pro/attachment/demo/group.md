---
order: 5
title:
  zh-CN: 附件组合
  en-US: Attachment Group
---

## zh-CN

附件组合

## en-US

Attachment Group

````jsx
import { Attachment, DataSet, Form } from 'choerodon-ui/pro';

const { Group } = Attachment;

const App = () => {
  const [value, setValue] = React.useState('4c74a34a-fa37-4e92-be9d-5cf726fb1472');
  const props = {
    labelLayout: 'float',
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    max: 9,
    showHistory: true,
    help: '支持文件类型： .deb .txt .pdf image/*',
  };

  const ds = React.useMemo(() => new DataSet({
    data: [{ attachment: '88888888-fa37-4e92-be9d-5cf726fb1472' }],
    fields: [{ name: 'attachment', type: 'attachment', label: <span>管理附件</span>, max: 9, required: true }],
  }), []);

  return (
    <Form columns={3}>
      <Group label="分组1">
        <Attachment label="技术附件" value={value} onChange={setValue} {...props} />
        <Attachment dataSet={ds} name="attachment" {...props} />
      </Group>
      <Group colSpan={2} viewMode="list" label="分组2">
        <Attachment label="技术附件" value={value} onChange={setValue} {...props} />
        <Attachment dataSet={ds} name="attachment" {...props} />
      </Group>
    </Form>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
