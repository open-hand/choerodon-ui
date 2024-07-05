---
order: 11
title:
  zh-CN: 可选中卡片
  en-US: Selected card
---

## zh-CN

点击可选中，通过 cornerPlacement 属性可以控制角标位置。

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
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <Card title="Title" style={{ width: 300 }} selected={this.state.selected} onSelectChange={this.handleSelect} cornerPlacement="bottomRight">
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card title="Title" style={{ width: 300 }} selected={this.state.selected} onSelectChange={this.handleSelect} cornerPlacement="topRight">
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card title="Title" style={{ width: 300 }} selected={this.state.selected} onSelectChange={this.handleSelect} cornerPlacement="topLeft">
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card title="Title" style={{ width: 300 }} selected={this.state.selected} onSelectChange={this.handleSelect} cornerPlacement="bottomLeft">
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card style={{ height: 50 }} selected={this.state.selected} onSelectChange={this.handleSelect} cornerPlacement="bottomLeft">
          <p>small card</p>
        </Card>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  mountNode);
````
