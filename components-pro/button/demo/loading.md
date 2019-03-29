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

  componentWillMount() {
    runInAction(() => {
      this.ds.status = 'submitting';
    });
  }

  handleClick = () => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  render() {
    return (
      <div>
        <Button icon="save" loading>保存</Button>
        <Button funcType="flat" color="blue" icon="save" loading>保存</Button>
        <Button icon="save" loading />
        <Button funcType="flat" icon="save" color="blue" loading />
        <Button dataSet={this.ds} type="submit">数据源状态</Button>
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
