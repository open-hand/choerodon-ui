---
order: 11
title:
  zh-CN: 导航步骤条
  en-US: Navigation
---

## zh-CN

导航条样式的步骤条

## en-US

Style of navigation

```jsx
import { Steps, Button, message } from 'choerodon-ui';

const Step = Steps.Step;

const stepsList = [];

for (let i = 1; i <= 15; i++) {
  stepsList.push({
    title: `导航-${i}`,
    content: `${i}`,
  })
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
    };
  }

  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  onChange = current => {
    this.setState({
      current,
    });
  };

  onClickItem = e => {
    console.log(e);
  };

  render() {
    const { current } = this.state;
    return (
      <div>
        <div>
          <Steps
            current={current}
            type="navigation"
            onClick={this.onClickItem}
            onChange={this.onChange}
          >
            {stepsList.map(item => (
              <Step
                key={item.title}
                title={item.title}
                onClick={() => message.success(item.title)}
              />
            ))}
          </Steps>
        </div>
        <div className="steps-content">{stepsList[this.state.current].content}</div>
        <div className="steps-action">
          {this.state.current < stepsList.length - 1 && (
            <Button type="primary" onClick={() => this.next()}>
              Next
            </Button>
          )}
          {this.state.current === stepsList.length - 1 && (
            <Button type="primary" onClick={() => message.success('Processing complete!')}>
              Done
            </Button>
          )}
          {this.state.current > 0 && (
            <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
              Previous
            </Button>
          )}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```

```css
.steps-content {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: center;
  padding-top: 80px;
}

.steps-action {
  margin-top: 24px;
}
```
