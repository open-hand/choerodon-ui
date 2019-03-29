---
order: 1
title:
  zh-CN: 受控输入框
  en-US: Controlled TextField
---

## zh-CN

受控输入框

## en-US

Controlled TextField

````jsx
import { Pagination } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    page: 2,
    pageSize: 20,
  }

  handleChange = (page, pageSize) => {
    console.log('[page]', page, '[pageSize]', pageSize);
    this.setState({
      page,
      pageSize,
    });
  }

  render() {
    const { page, pageSize } = this.state;
    return <Pagination total={50} page={page} pageSize={pageSize} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
