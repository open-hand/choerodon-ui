import React from 'react';
import { render, mount } from 'enzyme';
import KeyCode from '../../_util/KeyCode';
import Cascader from '..';
import focusTest from '../../../tests/shared/focusTest';

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
        ],
      },
    ],
  },
];

describe('Cascader', () => {
  focusTest(Cascader);

  it('popup correctly when panel is hidden', () => {
    const wrapper = mount(<Cascader options={options} />);
    expect(
      render(
        wrapper
          .find('Trigger')
          .instance()
          .getComponent(),
      ),
    ).toMatchSnapshot();
  });

  it('popup correctly when panel is open', () => {
    const wrapper = mount(<Cascader options={options} />);
    wrapper.find('input').simulate('click');
    expect(
      render(
        wrapper
          .find('Trigger')
          .instance()
          .getComponent(),
      ),
    ).toMatchSnapshot();
  });

  it('support controlled mode', () => {
    const wrapper = mount(<Cascader options={options} />);
    wrapper.setProps({
      value: ['zhejiang', 'hangzhou', 'xihu'],
    });
    expect(wrapper.render()).toMatchSnapshot();
  });

  it('popup correctly with defaultValue', () => {
    const wrapper = mount(<Cascader options={options} defaultValue={['zhejiang', 'hangzhou']} />);
    wrapper.find('input').simulate('click');
    expect(
      render(
        wrapper
          .find('Trigger')
          .instance()
          .getComponent(),
      ),
    ).toMatchSnapshot();
  });

  it('can be selected', () => {
    const wrapper = mount(<Cascader options={options} />);
    wrapper.find('input').simulate('click');
    let popupWrapper = mount(
      wrapper
        .find('Trigger')
        .instance()
        .getComponent(),
    );
    popupWrapper
      .find('.c7n-cascader-menu')
      .at(0)
      .find('.c7n-cascader-menu-item')
      .at(0)
      .simulate('click');
    expect(
      render(
        wrapper
          .find('Trigger')
          .instance()
          .getComponent(),
      ),
    ).toMatchSnapshot();
    popupWrapper = mount(
      wrapper
        .find('Trigger')
        .instance()
        .getComponent(),
    );
    popupWrapper
      .find('.c7n-cascader-menu')
      .at(1)
      .find('.c7n-cascader-menu-item')
      .at(0)
      .simulate('click');
    expect(
      render(
        wrapper
          .find('Trigger')
          .instance()
          .getComponent(),
      ),
    ).toMatchSnapshot();
    popupWrapper = mount(
      wrapper
        .find('Trigger')
        .instance()
        .getComponent(),
    );
    popupWrapper
      .find('.c7n-cascader-menu')
      .at(2)
      .find('.c7n-cascader-menu-item')
      .at(0)
      .simulate('click');
    expect(
      render(
        wrapper
          .find('Trigger')
          .instance()
          .getComponent(),
      ),
    ).toMatchSnapshot();
  });

  it('backspace should work with `Cascader[showSearch]`', () => {
    const wrapper = mount(<Cascader options={options} showSearch />);
    wrapper.find('input').simulate('change', { target: { value: '123' } });
    expect(wrapper.state('inputValue')).toBe('123');
    wrapper.find('input').simulate('keydown', { keyCode: KeyCode.BACKSPACE });
    // Simulate onKeyDown will not trigger onChange by default, so the value is still '123'
    expect(wrapper.state('inputValue')).toBe('123');
  });

  it('when use single mode you can look only menu items',() => {
    const wrapper = mount(<Cascader options={options} menuMode="single" />)
    wrapper.find('input').simulate('click');
    expect(wrapper.find('.c7n-cascader-menu-single').length).toBe(1);  
  })
});
