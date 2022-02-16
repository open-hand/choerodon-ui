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
    value: '@mike',
  };

  handleChange = editorState => {
    console.log('getMentions: ', getMentions(editorState, { mentionsKey: '@', split: ' ' }));

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
        <Option value="mike">mike</Option>
        <Option value="jason">jason</Option>
        <Option value="Kevin">Kevin</Option>
      </Mentions>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
