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
import { Attachment, DataSet } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(() => new DataSet({
    fields: [{ name: 'attachment', type: 'attachment', label: '技术附件', max: 9, required: true }],
    data: [{
      attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472',
    }],
  }), []);
  const props = {
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    name: 'attachment',
    dataSet: ds,
  };

  return <Attachment {...props} />;
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
