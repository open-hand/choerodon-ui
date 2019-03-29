---
order: 5
title:
  zh-CN: 主题
  en-US: Theme
---

## zh-CN

通过`theme`属性控制Tooltip的主题颜色。

显示红色错误信息时，建议使用亮色主题。

## en-US

Control a Tooltip's theme color via setting `theme` property.

When dealing with red error message, light theme is recommended.

````jsx
import { Tooltip, Button, Icon } from 'choerodon-ui/pro';

class Demo extends React.Component {
  state = {
    theme: 'dark',
  };

  handleLighten = () => {
    this.setState({
      theme: 'light',
    });
  }

  handleDarken = () => {
    this.setState({
      theme: 'dark',
    });
  }

  render() {
    return (
      <div>
        <Button onClick={this.handleLighten}>Light</Button>
        <Button onClick={this.handleDarken} color="dark">Dark</Button>
        <Tooltip
          theme={this.state.theme}
          title={<span style={{ color: 'red' }}><Icon type="error" />Prompt Text</span>}
          hidden={false}
        >
          <span>Change Theme</span>
        </Tooltip>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, mountNode);
````
