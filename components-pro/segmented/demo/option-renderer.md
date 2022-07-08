---
order: 4
title:
  zh-CN: optionRenderer 输入属性
  en-US: optionRenderer Input Property
---

## zh-CN

使用`optionRenderer`属性。

## en-US

Use `optionRenderer` input property.

```jsx
import { Segmented, Tooltip, Icon } from 'choerodon-ui/pro';

const { Option } = Segmented;

function handleChange(value, oldValue) {
  console.log('[optionRenderer new]', value, '[optionRenderer old]', oldValue);
}

class App extends React.Component {
  renderer = ({ text }) => {
    return (
      <div style={{ width: '100%' }}>
        {text && <Icon type="flag-o" />} {text}
      </div>
    );
  };

  optionRenderer = ({ text }) => {
    return (
      <Tooltip title={text} placement="left" placement="top">
        {this.renderer({ text })}
      </Tooltip>
    );
  };

  render() {
    return (
      <div>
        <Segmented onChange={handleChange} optionRenderer={this.optionRenderer}>
          <Option value="react">React</Option>
          <Option value="angular">Augular</Option>
          <Option value="vue">Vue</Option>
        </Segmented>
        <br />
        <Segmented onChange={handleChange} vertical optionRenderer={this.optionRenderer}>
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
