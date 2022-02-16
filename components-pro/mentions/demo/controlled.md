---
order: 6
title:
  zh-CN: 受控模式
  en-US: Controlled
---

## zh-CN

受控模式。

## en-US

Controlled mode.

```jsx
import { Mentions } from 'choerodon-ui/pro';

const { Option, getMentions } = Mentions;

class App extends React.Component {
  state = {
    value: '@afc163',
  };

  handleChange = editorState => {
    console.log('getMentions: ', getMentions(editorState, { prefix: '@', split: ' ' }));

    this.setState({
      value: editorState,
    });
  };

  render() {
    return (
      <Mentions
        style={{ width: '100%' }}
        onChange={this.handleChange}
        value={this.state.value}
      >
        <Option value="afc163">afc163</Option>
        <Option value="zombieJ">zombieJ</Option>
        <Option value="yesmeck">yesmeck</Option>
      </Mentions>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
