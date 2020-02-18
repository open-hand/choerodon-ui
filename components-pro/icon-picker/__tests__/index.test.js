import React from 'react';
import { mount } from 'enzyme';
import IconPicker from '..';
import IconPickerTest from './IconPicker';

describe('Icon-Picker-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders IconPicker correctly', () => {
    const wrapper = mount(<IconPicker />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should show {value} when the property value is existed and pageSize will be 100 ', () => {
    const wrapper = mount(<IconPicker value="add" />);
    expect(wrapper.props().value).toEqual('add');
    expect(wrapper.props().pageSize).toEqual(100);
  });

  it('input should nothing when click firstly  ', () => {
    const wrapper = mount(<IconPicker />);
    wrapper.find('.c7n-pro-icon-picker-wrapper').simulate('click');
    jest.runAllTimers();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('');
  });

  it('should renders dataset correctly', () => {
    const wrapper = mount(<IconPickerTest />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('IconPicker').props().name).toEqual('icon');
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('cancel');
  });
});
