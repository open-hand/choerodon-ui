import React from 'react';
import { mount } from 'enzyme';
import IconPicker from '..';
import IconItem from '../IconItem';
import IconPickerTest from './IconPicker';
import mountTest from '../../../tests/shared/mountTest';
import focusTest from '../../../tests/shared/focusTest';
import TriggerPopTest from '../../../tests/shared/triggerPopTest';
import { simulateCode } from './utils';

mountTest(IconPicker);
mountTest(IconItem);
mountTest(IconPickerTest);
focusTest(IconPicker);
TriggerPopTest(IconPicker);

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

  it('should show {value} when the property value is existed', () => {
    const wrapper = mount(<IconPicker value="add" />);
    expect(wrapper.props().value).toEqual('add');
    expect(wrapper.props().pageSize).toEqual(100);
  });

  it('the selected click render correctly', () => {
    const wrapper = mount(<IconPicker />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.find('.c7n-pro-icon-picker-item-selected > div').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('the keydown event should render correctly', () => {
    const wrapper = mount(<IconPicker />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    simulateCode(wrapper, 39);
    simulateCode(wrapper, 37);
    simulateCode(wrapper, 40);
    simulateCode(wrapper, 38);
    simulateCode(wrapper, 35);
    simulateCode(wrapper, 36);
    simulateCode(wrapper, 33);
    simulateCode(wrapper, 34);
    simulateCode(wrapper, 13);
    simulateCode(wrapper, 10);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
  it('the keydown event should render keyCode {space} correctly', () => {
    const wrapper = mount(<IconPicker />);
    wrapper.find('input').simulate('keydown', { keyCode: 32 });
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
  it('the keydown event should render keyCode { esc, tab } correctly', () => {
    const wrapper = mount(<IconPicker />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    simulateCode(wrapper, 9);
    wrapper.update();
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    simulateCode(wrapper, 27);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
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
  it('input should render readOnly correctly', () => {
    const wrapper = mount(<IconPicker />);
    expect(wrapper.prop('readOnly')).toBe(false);
    wrapper.setProps({ readOnly: true });
    wrapper.update();
    expect(wrapper.prop('readOnly')).toBe(true);
    expect(wrapper.instance().renderIconCategories()).toMatchSnapshot();
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

  it('should has custom font name ' , () => {
    const wrapper = mount(<IconPicker icons={['clubs']} customFontName="c7ntest1" onChange={() => {}} />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    simulateCode(wrapper, 9);
    wrapper.update();
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    simulateCode(wrapper, 27);
    wrapper.update();
    expect(wrapper.find('IconPicker').props().customFontName).toEqual('c7ntest1');
  })
});
