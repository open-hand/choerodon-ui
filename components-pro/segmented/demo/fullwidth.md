---
order: 5
title:
  zh-CN: 适应父级宽度
  en-US: fullWidth
---

## zh-CN

适应父级宽度。

## en-US

Fit width to its parent\'s width.

```jsx
import { Segmented } from 'choerodon-ui/pro';

const { Option } = Segmented;

function handleChange(value, oldValue) {
  console.log('[fullWidth new]', value, '[fullWidth old]', oldValue);
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Segmented onChange={handleChange} fullWidth>
          <Option value="react">React</Option>
          <Option value="angular">Augular</Option>
          <Option value="vue">Vue</Option>
        </Segmented>
        <br />
        <Segmented onChange={handleChange} vertical fullWidth>
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
