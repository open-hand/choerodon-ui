---
order: 5
title:
  zh-CN: 切换菜单类型
  en-US: Switch the menu type
---

## zh-CN

展示动态切换模式。

## en-US

Show the dynamic switching mode (between 'inline' and 'vertical').

````jsx
import { Menu, Icon, Switch } from 'choerodon-ui';
const { SubMenu } = Menu;

class Sider extends React.Component {
  state = {
    mode: 'inline',
  }
  changeMode = (value) => {
    this.setState({
      mode: value ? 'vertical' : 'inline',
    });
  }
  render() {
    return (
      <div>
        <Switch onChange={this.changeMode} /> Change Mode
        <span className="ant-divider" style={{ margin: '0 1em' }} />
        <br />
        <br />
        <Menu
          style={{ width: 256 }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode={this.state.mode}
        >
          <Menu.Item key="1">
            <Icon type="mail_outline" />
            Navigation One
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="perm_contact_calendar" />
            Navigation Two
          </Menu.Item>
          <SubMenu key="sub1" title={<span><Icon type="apps" /><span>Navigation Three</span></span>}>
            <Menu.Item key="3">Option 3</Menu.Item>
            <Menu.Item key="4">Option 4</Menu.Item>
            <SubMenu key="sub1-2" title="Submenu">
              <Menu.Item key="5">Option 5</Menu.Item>
              <Menu.Item key="6">Option 6</Menu.Item>
            </SubMenu>
          </SubMenu>
          <SubMenu key="sub2" title={<span><Icon type="settings" /><span>Navigation Four</span></span>}>
            <Menu.Item key="7">Option 7</Menu.Item>
            <Menu.Item key="8">Option 8</Menu.Item>
            <Menu.Item key="9">Option 9</Menu.Item>
            <Menu.Item key="10">Option 10</Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    );
  }
}

ReactDOM.render(<Sider />, mountNode);
````
