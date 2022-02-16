---
order: 2
title:
  zh-CN: 自定义触发字符
  en-US: Customize Trigger Token
---

## zh-CN

通过 `mentionsKey` 属性自定义触发字符。默认为 `@`, 可以定义为数组。

## en-US

Customize Trigger Token by `mentionsKey` props. Default to `@`, `Array<string>` also supported.

```jsx
import { Mentions } from 'choerodon-ui/pro';

const { Option } = Mentions;

const MOCK_DATA = {
  '@': ['mike', 'jason', 'Kevin'],
  '#': ['1.0', '2.0', '3.0'],
};

class App extends React.Component {
  state = {
    mentionsKey: '@',
  };

  onSearch = (_, mentionsKey) => {
    this.setState({ mentionsKey });
  };

  render() {
    const { mentionsKey } = this.state;

    return (
      <Mentions
        style={{ width: '100%' }}
        placeholder="input @ to mention people, # to mention tag"
        mentionsKey={['@', '#']}
        onSearch={this.onSearch}
      >
        {(MOCK_DATA[mentionsKey] || []).map(value => (
          <Option key={value} value={value}>
            {value}
          </Option>
        ))}
      </Mentions>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
