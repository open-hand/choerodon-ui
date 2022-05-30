---
order: 8
title:
  zh-CN: 绑定数据源
  en-US: Bind DataSet

---

## zh-CN

绑定数据源

## en-US

Bind DataSet

```jsx
import { List, Avatar } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoQuery: true,
    name: 'user',
    pageSize: 5,
    paging: false,
  });

  render(){
    return (
      <div style={{height: 500, overflow: 'auto'}}>
        <List
          dataSet={this.ds}
          renderItem={
            ({dataSet, record, index}) => (
            <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>Choerodon</Avatar>}
                  title={<a href="https://choerodon.github.io/choerodon-ui/">{record.get('name')}</a>}
                  description="Choerodon"
                />
            </List.Item>
            )
          }
        />
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
```
