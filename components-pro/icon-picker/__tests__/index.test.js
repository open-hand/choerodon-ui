import React from 'react';
import { mount } from 'enzyme';
import IconPicker from '..';
import IconCategory from '../IconCategory';
import IconItem from '../IconItem';
import IconPickerTest from './IconPicker';
import mountTest from '../../../tests/shared/mountTest';
import focusTest from '../../../tests/shared/focusTest';
import TriggerPopTest from '../../../tests/shared/triggerPopTest';

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
    const wrapper1 = mount(<IconCategory />);
    const wrapper2 = mount(<IconItem />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper1).toMatchSnapshot();
    expect(wrapper2).toMatchSnapshot();
  });

  it('should show {value} when the property value is existed', () => {
    const wrapper = mount(<IconPicker value="add" />);
    expect(wrapper.props().value).toEqual('add');
  });

  it('the property pageSize will be 100 ', () => {
    const wrapper = mount(<IconPicker />);
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
});
