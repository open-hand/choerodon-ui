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

  describe('Button funcType', () => {
    it('funType defalut value is raised', () => {
      const wrapper = mount(<Button>Raised</Button>);

      expect(wrapper.find('.c7n-pro-btn-raised').length).toBe(1);
    });

    it('set funType value is flat', () => {
      const wrapper = mount(<Button funcType='flat'>flat</Button>);

      expect(wrapper.find('.c7n-pro-btn-flat').length).toBe(1);
    });

    it('set funType value is link', () => {
      const wrapper = mount(<Button funcType='link'>link</Button>);

      expect(wrapper.find('.c7n-pro-btn-link').length).toBe(1);
    });
  })

  describe('Button loading', () => {
    it('loading defalut value is false', () => {
      const wrapper = mount(<Button>has loading?</Button>);

      expect(wrapper.find('.c7n-pro-btn-loading').length).toBe(0);
    });

    it('set loading value is false', () => {
      const wrapper = mount(<Button loading={false}>has loading?</Button>);

      expect(wrapper.find('.c7n-pro-btn-loading').length).toBe(0);
    });

    it('set loading value is true', () => {
      const wrapper = mount(<Button loading>has loading?</Button>);

      expect(wrapper.find('.c7n-pro-btn-loading').length).toBe(1);
    });
  })

  describe('Button href', () => {
    it('validator href is accuracy', () => {
      const wrapper = mount(<Button href="https://choerodon.io">https://choerodon.io</Button>);

      expect(wrapper.find('a').props().href).toBe('https://choerodon.io');
    });

    it('not set href and set target will invalid', () => {
      const wrapper = mount(<Button target="_top">https://choerodon.io</Button>);

      // 没有 href 都不会生成 a 标签
      expect(wrapper.find('a').length).toBe(0);
    });

    it('validator target is accuracy', () => {
      const wrapper = mount(<Button href="https://choerodon.io" target="_top">https://choerodon.io</Button>);

      expect(wrapper.find('a').props().href).toBe('https://choerodon.io');
      expect(wrapper.find('a').props().target).toBe('_top');
    });
  })

});
