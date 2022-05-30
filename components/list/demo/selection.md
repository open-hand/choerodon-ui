---
order: 9
title:
  zh-CN: 可选择
  en-US: Seletion List

---

## zh-CN

可选择列表

## en-US

Seletion List

```jsx
import { List, Card, Avatar } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

const data = [
  {
    id: 1,
    title: 'Choerodon UI Title 1',
  },
  {
    id: 2,
    title: 'Choerodon UI Title 2',
  },
  {
    id: 3,
    title: 'Choerodon UI Title 3',
  },
  {
    id: 4,
    title: 'Choerodon UI Title 4',
  },
];

ReactDOM.render(
  <List
    itemLayout="horizontal"
    dataSource={data}
    rowSelection={{
      selectedRowKeys: [1,3],
      onChange:(selectedRowKeys, record)=> console.log('选中了：', selectedRowKeys),
    }}
    renderItem={item => (
      <List.Item value={item.id}>
        <List.Item.Meta
          avatar={<Avatar>Choerodon</Avatar>}
          title={<a href="https://choerodon.github.io/choerodon-ui/">{item.title}</a>}
          description="Choerodon"
        />
      </List.Item>
    )}
  />,
  mountNode,
);
```