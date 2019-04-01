---
order: 1
title:
  zh-CN: 受控
  en-US: Controlled
---

## zh-CN

受控。


## en-US

Controlled


````jsx

import { Progress } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      completed: 0,
      status: 'active',
    };
  }

  componentDidMount() {
    this.timer = setTimeout(() => this.progress(5), 1000);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  progress(completed) {
    if (completed > 100) {
      this.setState({
        completed: 100,
        status: 'success',
      });
    } else {
      this.setState({
        completed,
      });
      const diff = Math.round(Math.random() * 10);
      this.timer = setTimeout(() => this.progress(completed + diff), 1000);
    }
  }

  render() {
    return (
      <div>
        <Progress value={this.state.completed} status={this.state.status} />
        <Progress type="circle" value={this.state.completed} status={this.state.status} />
        <Progress type="dashboard" value={this.state.completed} status={this.state.status} />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);

````
