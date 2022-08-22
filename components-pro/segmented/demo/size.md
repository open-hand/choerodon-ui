---
order: 6
title:
  zh-CN: 大小
  en-US: Size
---

## zh-CN

具有 small default large 三种大小。

## en-US

There are three sizes: `small` `default` `large`.

```jsx
import { Segmented, Icon } from 'choerodon-ui/pro';

const { Option } = Segmented;

function handleChange(value, oldValue) {
  console.log('[optionRenderer new]', value, '[optionRenderer old]', oldValue);
}

class App extends React.Component {
  optionRenderer = ({ text }) => {
    return (
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {text && <Icon type="flag-o" />} {text}
      </div>
    );
  };

  render() {
    return (
      <div>
        <Segmented onChange={handleChange} optionRenderer={this.optionRenderer} size="large">
          <Option value="react">React</Option>
          <Option value="angular">Augular</Option>
          <Option value="vue">Vue</Option>
        </Segmented>
        <br />
        <Segmented onChange={handleChange} optionRenderer={this.optionRenderer}>
          <Option value="react">React</Option>
          <Option value="angular">Augular</Option>
          <Option value="vue">Vue</Option>
        </Segmented>
        <br />
        <Segmented onChange={handleChange} optionRenderer={this.optionRenderer} size="small">
          <Option value="react">React</Option>
          <Option value="angular">Augular</Option>
          <Option value="vue">Vue</Option>
        </Segmented>
        <br />
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
