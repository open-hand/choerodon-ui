---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

基本使用。

## en-US

Basic Usage.

```jsx
import { Segmented } from 'choerodon-ui/pro';

const { Option } = Segmented;

function handleChange(value, oldValue) {
  console.log('[basic new]', value, '[basic old]', oldValue);
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Segmented onChange={handleChange}>
          <Option value="react">React</Option>
          <Option value="angular">Augular</Option>
          <Option value="vue">Vue</Option>
        </Segmented>
        <br />
        <Segmented onChange={handleChange} vertical>
          <Option value="react">React</Option>
          <Option value="angular">Augular</Option>
          <Option value="vue">Vue</Option>
        </Segmented>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
