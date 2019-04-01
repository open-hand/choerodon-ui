---
order: 1
title:
  zh-CN: 受控图标选择器
  en-US: Controlled Icon Picker
---

## zh-CN

受控图标选择器

## en-US

Controlled Icon Picker

````jsx
import { IconPicker } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'add',
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[newValue]', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  render() {
    return <IconPicker value={this.state.value} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
