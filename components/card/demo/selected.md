---
order: 11
title:
  zh-CN: 可选中卡片
  en-US: Selected card
---

## zh-CN

点击可选中

## en-US

A simple card only containing a content area.

````jsx
import { Card } from 'choerodon-ui';

class App extends React.Component {

  state={
    selected: true,
  }

  handleSelect = (val) => {
    this.setState({
      selected: val,
    })
  }

  render(){
    return (
      <Card title="Title" style={{ width: 300 }} selected={this.state.selected} onSelectChange={this.handleSelect}>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
    )
  }
}

ReactDOM.render(
  <App />,
  mountNode);
````
