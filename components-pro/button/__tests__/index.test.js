import React from 'react';
import { render, mount } from 'enzyme';
import Button from '..';
import Icon from '../../icon';

describe('Button', () => {
  it('renders components-pro correctly', () => {
    const wrapper = render(<Button> Button-Pro </Button>);
    expect(wrapper).toMatchSnapshot();
  });

  it('have static property for components-pro type detecting', () => {
    const wrapper = mount(<Button>Button-Pro Text</Button>);
    // eslint-disable-next-line
    expect(wrapper.type().__PRO_BUTTON).toBe(true);
  });

  it('renders Chinese characters correctly', () => {
    const wrapper = render(<Button>按钮</Button>);
    expect(wrapper).toMatchSnapshot();
    // should not insert space when there is icon
    const wrapper1 = render(<Button icon="search">按钮</Button>);
    expect(wrapper1).toMatchSnapshot();
    // should not insert space when there is icon
    const wrapper2 = render(
      <Button>
        <Icon type="search" />
        按钮
      </Button>,
    );
    expect(wrapper2).toMatchSnapshot();
  });

  it('renders color correctly', () => {
    const wrapper = mount(<Button>按钮</Button>);
    expect(wrapper.props().color).toEqual(undefined);
    expect(wrapper.find('button.c7n-pro-btn-default')).toHaveLength(1);
    
    wrapper.setProps({ color: 'default', children: 'default' });
    wrapper.update();
    expect(wrapper.props().color).toEqual('default');
    expect(wrapper.find('button.c7n-pro-btn-default')).toHaveLength(1);

    wrapper.setProps({ color: 'primary', children: 'primary' });
    wrapper.update();
    expect(wrapper.props().color).toEqual('primary');
    expect(wrapper.find('button.c7n-pro-btn-primary')).toHaveLength(1);
  });

  it('renders funcType of button color and background correctly', () => {
    const wrapper = mount(<Button color="red">Red</Button>);
    expect(wrapper.props().color).toEqual('red');

    const wrapper1 = mount(
      <Button funcType="flat" color="primary">
        Blue
      </Button>,
    );
    expect(wrapper1.props().funcType).toEqual('flat');
  });

  it('button-pro should support link button', () => {
    const wrapper = mount(
      <Button target="_blank" href="https://choerodon.github.io/choerodon-ui/">
        button-pro link
      </Button>,
    );
    expect(wrapper.render()).toMatchSnapshot();
  });
});
