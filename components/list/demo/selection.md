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
import { List, Avatar } from 'choerodon-ui';

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
  {
    id: 5,
    title: 'Choerodon UI Title 5',
  },
];


ReactDOM.render(
  <List
    itemLayout="horizontal"
    dataSource={data}
    rowKey={(record)=> record.id}
    rowSelection={{
      selectedRowKeys: [1,3],
      onChange:(values) => console.log('选中了：', values),
    }}
    renderItem={item => (
      <List.Item>
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