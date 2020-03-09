import React from 'react';
import { mount } from 'enzyme';
import ColorPicker from '..';
import mountTest from '../../../tests/shared/mountTest';
import focusTest from '../../../tests/shared/focusTest';
import triggerTest from '../../../tests/shared/triggerPopTest';
import ColorPickerTest from './ColorPicker';

mountTest(ColorPicker);
focusTest(ColorPicker);
triggerTest(ColorPicker);

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
    expect(wrapper.props().triggerHiddenDelay).toEqual(50);
    expect(wrapper.props().triggerShowDelay).toEqual(150);
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
    const handleChange = jest.fn();
    const wrapper = mount(<ColorPicker value="#f1c7f2" onChange={handleChange} />);
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

  it('can not click or input when the readOnly true and default false', () => {
    const handleChange = jest.fn();
    const wrapper = mount(<ColorPicker onChange={handleChange} />);
    expect(wrapper.prop('readOnly')).toBe(false);
    wrapper.setProps({ readOnly: true });
    wrapper.update();
    expect(wrapper.prop('readOnly')).toBe(true);

    wrapper.find('input').simulate('change');
    jest.runAllTimers();
    wrapper.update();
    expect(handleChange).not.toHaveBeenCalled();
  });
  it('should trigger dataset default value correctly', () => {
    const wrapper = mount(<ColorPicker />);
    expect(
      wrapper
        .find('.c7n-pro-color-picker-popup')
        .at(0)
        .prop('hidden'),
    ).toEqual(true);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(
      wrapper
        .find('.c7n-pro-color-picker-popup')
        .at(0)
        .prop('hidden'),
    ).toEqual(false);
  });

  it('footer-slider click event render correctly', () => {
    const wrapper = mount(<ColorPicker />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.find('.hue').simulate('click');
    jest.runAllTimers();
    expect(wrapper).toMatchSnapshot();
  });

  it('the change event trigger when the body popup clicked', () => {
    const handleChange = jest.fn();
    const wrapper = mount(<ColorPicker onChange={handleChange} />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.find('.c7n-pro-color-picker-popup-body-gradient').simulate('click');
    jest.runAllTimers();
    expect(handleChange).toHaveBeenCalled();
  });

  it('the panel body click event render correctly', () => {
    const wrapper = mount(<ColorPicker />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.find('.c7n-pro-color-picker-popup-body-selector').simulate('mousedown');
    expect(wrapper).toMatchSnapshot();
  });

  it('the sliderPointer of footer click event render correctly', () => {
    const wrapper = mount(<ColorPicker />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper
      .find('.c7n-pro-color-picker-popup-footer-slider-pointer')
      .at(0)
      .simulate('mousedown');
    jest.runAllTimers();
    wrapper.instance().setColor('#ff00ee');
    jest.runAllTimers();
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders dataset default value correctly', () => {
    const wrapper = mount(<ColorPickerTest />);
    expect(wrapper.find('ColorPicker').props().name).toEqual('color');
    expect(wrapper.find('input').prop('value')).toBe('#00ff12');
    expect(wrapper).toMatchSnapshot();
  });
});
