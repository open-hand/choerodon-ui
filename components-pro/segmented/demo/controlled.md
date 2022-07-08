---
order: 1
title:
  zh-CN: 受控模式
  en-US: Controlled Segmented
---

## zh-CN

受控模式。

## en-US

Controlled Segmented.

````jsx
import { Segmented } from 'choerodon-ui/pro';

const { Option } = Segmented;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'wu',
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[constrolled]', 'newValue', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  render() {
    const { value } = this.state;
    return (
      <div>
        <Segmented value={value} onChange={this.handleChange}>
          <Option value="react">React</Option>
          <Option value="angular">Augular</Option>
          <Option value="vue">Vue</Option>
        </Segmented>
        <p
          style={{
            width: '200px',
            height: '100px',
            textAlign: 'center',
            marginTop: '10px',
            padding: '10px',
            background: '#cdc8c8',
          }}
        >
          {value == 'angular'
            ? '无信息'
            : `这是 ${value} 框架`}
        </p>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
