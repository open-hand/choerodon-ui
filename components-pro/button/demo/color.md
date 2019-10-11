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
import { Button } from 'choerodon-ui/pro';

class App extends React.PureComponent {
  render() {
    return (
      <div>
        <div>
          <div style={{ margin: '20px 0' }}>Background Color(With raised funcType)</div>
          <Button color="gray">Gray</Button>
          <Button color="primary">Blue</Button>
          <Button color="green">Green</Button>
          <Button color="red">Red</Button>
          <Button color="yellow">Yellow</Button>
          <Button color="purple">Purple</Button>
          <Button color="dark">Dark</Button>
        </div>
        <div>
          <div style={{ margin: '20px 0' }}>Font Color(With flat funcType)</div>
          <Button funcType="flat" color="gray">
            Gray
          </Button>
          <Button funcType="flat" color="primary">
            Blue
          </Button>
          <Button funcType="flat" color="green">
            Green
          </Button>
          <Button funcType="flat" color="red">
            Red
          </Button>
          <Button funcType="flat" color="yellow">
            Yellow
          </Button>
          <Button funcType="flat" color="purple">
            Purple
          </Button>
          <Button funcType="flat" color="dark">
            Dark
          </Button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
