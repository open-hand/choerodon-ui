---
order: 7
title:
  zh-CN: 菜单隐藏方式
  en-US: The way of hiding menu.
---

## zh-CN

默认是点击关闭菜单，可以关闭此功能。

## en-US

The default is to close the menu when you click on menu items, this feature can be turned off.

````jsx
import { Menu, Dropdown, Icon, Button } from 'choerodon-ui/pro';

class OverlayVisible extends React.Component {
  state = {
    hidden: true,
    disabled: true,
  };

  handleMenuClick = (e) => {
    if (e.key === '3') {
      this.setState({ hidden: true });
    }
    if (e.key === '1') {
      this.setState({ disabled: false });
    }
  }

  handleToggleDropdown = () => {
    this.setState({ hidden: !this.state.hidden });
  }

  render() {
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="1">Clicking me will not close the menu.</Menu.Item>
        <Menu.Item key="2" disabled={this.state.disabled}>Clicking me will not close the menu also.</Menu.Item>
        <Menu.Item key="3">Clicking me will close the menu</Menu.Item>
      </Menu>
    );
    return (
      <Dropdown
        overlay={menu}
        hidden={this.state.hidden}
      >
        <Button onClick={this.handleToggleDropdown}>
          Click me <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>
    );
  }
}

ReactDOM.render(<OverlayVisible />, mountNode);
````
