---
order: 1
title:
  zh-CN: 基础列表
  en-US: Basic list
---

## zh-CN

基础列表。

## en-US

Basic list.

```jsx
import { List, Avatar } from 'choerodon-ui';

const data = [
  {
    title: 'Choerodon UI Title 1',
  },
  {
    title: 'Choerodon UI Title 2',
  },
  {
    title: 'Choerodon UI Title 3',
  },
  {
    title: 'Choerodon UI Title 4',
  },
];

ReactDOM.render(
  <List
    itemLayout="horizontal"
    dataSource={data}
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
