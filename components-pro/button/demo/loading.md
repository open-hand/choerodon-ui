---
order: 4
title:
  zh-CN: 图标加载中
  en-US: loading
---

## zh-CN

图标是否加载中（加载中无法点击）。


## en-US

Buttons display mode, flat and raised, default raised.


````jsx
import { DataSet, Button } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';

class App extends React.Component {
  ds = new DataSet();

  state = {
    loading: true,
  };

  componentWillMount() {
    runInAction(() => {
      this.ds.status = 'submitting';
    });
  }

  handleClick = () => {
    this.setState({ loading: !this.state.loading });
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  render() {
    return (
      <div>
        <Button icon="save" loading={this.state.loading}>保存</Button>
        <Button funcType="flat" color="primary" icon="save" loading>保存</Button>
        <Button icon="save" loading />
        <Button funcType="flat" icon="save" color="primary" loading />
        <Button dataSet={this.ds} type="submit">数据源状态</Button>
        <br />
        <br />
        <Button onClick={this.handleClick}>wait promise</Button>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
