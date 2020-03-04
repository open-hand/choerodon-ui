import React from 'react';
import { mount } from 'enzyme';
import Password from '..';
import DataSet from '../../data-set';
import focusTest from '../../../tests/shared/focusTest';

focusTest(Password);

describe('Password input', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders Password correctly', () => {
    const wrapper = mount(<Password />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders Password reveal correctly', () => {
    const wrapper = mount(<Password />);
    expect(wrapper.props().reveal).toEqual(true);
    expect(wrapper.find('.c7n-pro-password-inner-button')).toHaveLength(1);
    wrapper.setProps({ reveal: false });
    wrapper.update();
    expect(wrapper.props().reveal).toEqual(false);
    expect(wrapper.find('.c7n-pro-password-inner-button')).toHaveLength(0);
  });

  it('the value will be controlled', () => {
    const wrapper = mount(<Password value="password" />);
    expect(
      wrapper
        .find('.c7n-pro-password')
        .at(0)
        .prop('value'),
    ).toBe('password');
    wrapper.setProps({ value: 'setPass' });
    wrapper.update();
    expect(
      wrapper
        .find('.c7n-pro-password')
        .at(0)
        .prop('value'),
    ).toBe('setPass');
  });

  it('the icon should be changed when icon can click', () => {
    const wrapper = mount(<Password value="password" />);
    expect(wrapper.find('.icon-visibility_off')).toHaveLength(1);
    expect(wrapper.find('.icon-visibility')).toHaveLength(0);
    wrapper.find('.icon').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.icon-visibility_off')).toHaveLength(0);
    expect(wrapper.find('.icon-visibility')).toHaveLength(1);
  });

  it('the dataset  will be render correctly', () => {
    const handleDataSetChange = jest.fn();
    const ds = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'test',
          type: 'string',
          defaultValue: 'password',
          required: true,
        },
      ],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(<Password dataSet={ds} name="test" />);
    expect(wrapper.find('Password').props().name).toEqual('test');
    expect(
      wrapper
        .find('.c7n-pro-password')
        .at(0)
        .prop('value'),
    ).toBe('password');
  });
});
