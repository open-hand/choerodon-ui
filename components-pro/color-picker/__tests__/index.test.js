import React from 'react';
import { mount } from 'enzyme';
import ColorPicker from '..';
import ColorPickerTest from './ColorPickerTest';

describe('color-picker-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders ColorPicker correctly', () => {
    const wrapper = mount(<ColorPicker />);
    expect(wrapper).toMatchSnapshot();
  });

  it('ColorPicker has the defaultProps clearButton', () => {
    const wrapper = mount(<ColorPicker />);
    expect(wrapper.props().clearButton).toEqual(false);
  });

  it('should has the defaultValue', () => {
    const wrapper = mount(<ColorPicker defaultValue="#f1c7f2" />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('#f1c7f2');
  });

  it('the color will be controlled by the value', () => {
    const wrapper = mount(<ColorPicker value="#f1c7f2" />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('#f1c7f2');
    wrapper.setProps({ value: '#00ff00' });
    wrapper.update();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('#00ff00');
  });

  it('should show expand face when click the input', () => {
    const wrapper = mount(<ColorPicker />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(
      wrapper
        .find('.c7n-pro-color-picker-wrapper')
        .at(0)
        .hasClass('c7n-pro-color-picker-expand'),
    ).toBe(true);
  });

  it('should renders dataset default value correctly', () => {
    const wrapper = mount(<ColorPickerTest />);
    expect(wrapper.find('ColorPicker').props().name).toEqual('color');
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('#00ff12');
  });
});
