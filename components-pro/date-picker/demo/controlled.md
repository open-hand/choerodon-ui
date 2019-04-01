---
order: 1
title:
  zh-CN: 受控日期控件
  en-US: Controlled DatePicker
---

## zh-CN

最简单的用法。

## en-US

The most basic usage.

````jsx
import { DatePicker } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {}

  handleChange = (moment) => {
    console.log('[controlled]', moment && moment.format());
    this.setState({
      moment,
    });
  }

  render() {
    return (
      <DatePicker value={this.state.moment} placeholder="controlled" onChange={this.handleChange} />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
