---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

基本使用。

## en-US

Basic Usage

```jsx
import { Responsive, Button } from 'choerodon-ui';

class App extends React.Component {
  state = { disabled: true };

  handleClick = () => {
    this.setState({ disabled: !this.state.disabled });
  }

  handleChange = items => {
    console.log('responsive change', items);
  };

  renderResponsive = ([size, color], disabled) => {
    const style = disabled ? { width: 100, height: 100, backgroundColor: 'gray' } : { width: size, height: size, backgroundColor: color };
    return <div style={style} />;
  };

  render() {
    const { disabled } = this.state;
    const items = [
      { xs: 100, sm: 150, md: 200, lg: 250, xl: 300, xxl: 350 }, // responsive size
      { xs: 'red', sm: 'green', md: 'blue', lg: 'black', xl: 'yellow', xxl: 'pink' }, // responsive color
      new Date(), // static object
      [1, 2, 3], // static array
      [
        { xs: 100, sm: 150, md: 200, lg: 250, xl: 300, xxl: 350 },
        { xs: 'red', sm: 'green', md: 'blue', lg: 'black', xl: 'yellow', xxl: 'pink' },
        function() {}, // static function
      ],
    ];
    return (
      <>
        <Responsive items={items} onChange={this.handleChange}>
          {this.renderResponsive}
        </Responsive>
        <Button onClick={this.handleClick}>switch disabled</Button>
        <Responsive disabled={disabled} items={items} onChange={this.handleChange}>
          {this.renderResponsive}
        </Responsive>
      </>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
