---
order: 0
title:
  zh-CN: 总数
  en-US: showTotal
---

## zh-CN

通过设置 showTotal 展示总共有多少数据

## en-US

Show how much data there is by setting showTotal.

```jsx
import { Form, Switch, DataSet, Pagination, NumberField, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function handleChange(page, pageSize) {
  console.log('[pagination]', page, pageSize);
}

class App extends React.Component {

  render() {
    return (
      <div>
        <Pagination
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} 页`}
          total={90}
          onChange={handleChange}
        />
        <br />
        <Pagination
          total={95}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
