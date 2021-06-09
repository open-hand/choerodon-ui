---
order: 1
title:
  zh-CN: 按钮颜色
  en-US: color
---

## zh-CN

按钮的颜色，当 funcType 为 flat 时，color 为字体颜色。

## en-US

Button background color or font color.

```jsx
import { Button, Switch } from 'choerodon-ui/pro';

class App extends React.PureComponent {
  state = {
    loading: true,
  };

  handleChange = (value) => this.setState({ loading: value });

  render() {
    const { loading } = this.state;
    return (
      <div>
        <Switch checked={loading} onChange={this.handleChange} value>Loading</Switch>
        <div>
          <div style={{ margin: '20px 0' }}>Background Color(With raised funcType)</div>
          <Button loading={loading} color="primary">Primary</Button>
          <Button loading={loading} color="default">Default</Button>
          <Button loading={loading} color="gray">Gray</Button>
          <Button loading={loading} color="blue">Blue</Button>
          <Button loading={loading} color="green">Green</Button>
          <Button loading={loading} color="red">Red</Button>
          <br />
          <br />
          <Button loading={loading} color="yellow">Yellow</Button>
          <Button loading={loading} color="purple">Purple</Button>
          <Button loading={loading} color="dark">Dark</Button>
        </div>
        <div>
          <div style={{ margin: '20px 0' }}>Font Color(With flat funcType)</div>
          <Button loading={loading} funcType="flat" color="primary">Primary</Button>
          <Button loading={loading} funcType="flat" color="default">Default</Button>
          <Button loading={loading} funcType="flat" color="gray">
            Gray
          </Button>
          <Button loading={loading} funcType="flat" color="blue">
            Blue
          </Button>
          <Button loading={loading} funcType="flat" color="green">
            Green
          </Button>
          <Button loading={loading} funcType="flat" color="red">
            Red
          </Button>
          <br />
          <br />
          <Button loading={loading} funcType="flat" color="yellow">
            Yellow
          </Button>
          <Button loading={loading} funcType="flat" color="purple">
            Purple
          </Button>
          <Button loading={loading} funcType="flat" color="dark">
            Dark
          </Button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
