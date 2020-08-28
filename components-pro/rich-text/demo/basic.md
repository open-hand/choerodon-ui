---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import { RichText, Switch } from 'choerodon-ui/pro';

const style = { height: 200 };

class App extends React.Component {
  state = { readOnly: true };

  handleChange = (value) => {
    this.setState({ readOnly: value });
  };


  render() {
    const { readOnly, disabled } = this.state;
    return (
      <>
        <RichText readOnly={readOnly} style={style} defaultValue={[{"insert":"readOnly"}]} />
        <Switch style={{ paddingTop: 10 }} onChange={this.handleChange} checked={readOnly}>readOnly</Switch>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
