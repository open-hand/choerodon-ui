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
