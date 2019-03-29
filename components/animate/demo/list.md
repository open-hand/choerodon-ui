---
order: 1
title:
  zh-CN: 数组成员
  en-US: List member
---

## zh-CN

数组成员。


## en-US

List member.


````jsx
import { Animate, Button } from 'choerodon-ui';

class App extends React.PureComponent {
  state = { list: [1, 2, 3, 4] };

  start = 5;

  insert = () => {
    const list = this.state.list.slice();
    list.splice(2, 0, this.start += 1);
    this.setState({ list });
  }

  remove = (value) => {
    const list = this.state.list.slice();
    const index = list.indexOf(value);
    if (index !== -1) {
      list.splice(index, 1);
      this.setState({ list });
    }
  }

  renderItems() {
    const { list } = this.state;
    return list.map(value => (
      <li key={value} style={{ border: '1px solid #000' }}>
        <div onClick={() => this.remove(value)}>{value}</div>
      </li>
    ));
  }

  render() {
    return (
      <div>
        <Button onClick={this.insert}>添加</Button>
        <Animate
          component="ul"
          transitionName="fade"
        >
          {this.renderItems()}
        </Animate>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);

````
