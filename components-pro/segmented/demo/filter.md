---
order: 3
title:
  zh-CN: 过滤
  en-US: Filter
---

## zh-CN

通过属性`optionsFilter`过滤选项。

## en-US

Through the property `optionsFilter` the options will be filtered.

```jsx
import { Segmented } from 'choerodon-ui/pro';

const { Option } = Segmented;

function handleChange(value, oldValue) {
  console.log('[filter new]', value, '[filter old]', oldValue);
}

class App extends React.Component {
  optionsFilter = (record) => {
    return record.get('value') !== 'angular';
  };

  render() {
    return (
      <Segmented onChange={handleChange} optionsFilter={this.optionsFilter}>
        <Option value="react">React</Option>
        <Option value="angular">Augular</Option>
        <Option value="vue">Vue</Option>
      </Segmented>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
