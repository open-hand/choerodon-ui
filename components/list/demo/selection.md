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

class App extends React.Component {

  state={
    keys: [1, 3],
  }

  render(){
    return (
      <List
        itemLayout="horizontal"
        dataSource={data}
        rowKey={(record)=> record.id}
        pagination={{
          pageSize: 3,
        }}
        rowSelection={{
          selectedRowKeys: this.state.keys,
          onChange:(values) => this.setState({ keys: values }),
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
      />
    )
  }
}


ReactDOM.render(
  <App />,
  mountNode,
);
```