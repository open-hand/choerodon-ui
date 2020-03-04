import React from 'react';
import { mount } from 'enzyme';
import Dropdown from '..';
import { Menu, Icon, Button } from '../..';

const SubMenu = Menu.SubMenu;

describe('Dropdown-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const onClick = jest.fn();
  const menu = (
    <Menu onClick={onClick}>
      <Menu.Item key="1">1st menu item</Menu.Item>
      <Menu.Item key="2">2nd memu item</Menu.Item>
      <SubMenu key="3" title="sub menu">
        <Menu.Item>3rd menu item</Menu.Item>
        <Menu.Item>4th menu item</Menu.Item>
      </SubMenu>
    </Menu>
  );

  it('render Dropdown Icon type arrow_drop_down', () => {
    const wrapper = mount(
      <Dropdown overlay={menu}>
        <Button>
          Click me, Click menu item <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
    );
    expect(wrapper.find('Icon').prop('type')).toBe('arrow_drop_down');
  });

  it('click the Dropdown the SubMenu show', () => {
    const wrapper = mount(
      <Dropdown trigger={['click']} overlay={menu}>
        <Button>
          Click me, Click menu item <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
    );
    expect(wrapper.find('SubMenu').length).toBe(0);
    wrapper.simulate('click');
    wrapper
      .find('Menu')
      .at(1)
      .simulate('click');
    expect(wrapper.find('SubMenu').length).toBe(2);
  });

  it('click the Dropdown show MenuItem 4 ', () => {
    const wrapper = mount(
      <Dropdown trigger={['click']} overlay={menu}>
        <Button>
          Click me, Click menu item <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
    );
    wrapper.simulate('click');
    wrapper
      .find('Menu')
      .at(1)
      .simulate('click');
    expect(wrapper.find('MenuItem').length).toBe(4);
  });
});
