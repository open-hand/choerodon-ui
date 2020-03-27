---
order: 2
title:
  zh-CN: 跳转
  en-US: QuickJumper
---

## zh-CN

快速跳转到某一页。

## en-US

Quickly jump to a page.

````jsx
import { DataSet, Pagination, Button } from 'choerodon-ui/pro';

function handleChange(page, pageSize) {
  console.log('[pagination]', page, pageSize);
}

class App extends React.Component {

  render() {
    return (
      <Pagination
        showQuickJumper={{goButton: <Button type="button">跳转</Button>}}
        total={90}
        onChange={handleChange}
      />)
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
