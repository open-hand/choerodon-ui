import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import MockDate from 'mockdate';
import DatePicker from '..';
import DatePickerTest from './DatePicker';
import { openPanel, clearInput, nextYear, nextMonth } from './utils';
import focusTest from '../../../tests/shared/focusTest';

describe('date-picker-pro', () => {
  focusTest(DatePicker);

  beforeEach(() => {
    MockDate.set(moment('2020-01-22'));
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('renders datePicker correctly', () => {
    const wrapper = mount(<DatePicker />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders multiple correctly', () => {
    const wrapper = mount(<DatePicker defaultValue="2020-02-10 18:18:18" />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2020-02-10');
    wrapper.setProps({ multiple: true });
    wrapper.update();
    expect(
      wrapper
        .find('.c7n-pro-calendar-picker-wrapper')
        .at(0)
        .hasClass('c7n-pro-calendar-picker-multiple'),
    ).toBe(true);
  });

  it('renders dataSet multiple correctly', () => {
    const wrapper = mount(<DatePickerTest />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('DatePicker').props().name).toEqual('date');
    expect(
      wrapper
        .find('.c7n-pro-calendar-picker-wrapper')
        .at(0)
        .hasClass('c7n-pro-calendar-picker-multiple'),
    ).toBe(true);
    expect(
      wrapper
        .find('.c7n-pro-calendar-picker-range-end')
        .at(0)
        .prop('value'),
    ).toBe('2020-02-09');
    expect(
      wrapper
        .find('.c7n-pro-calendar-picker-range-start')
        .at(0)
        .prop('value'),
    ).toBe('1984-11-22');
  });

  it('the onChange event only triggers when date was selected or change', () => {
    const handleChange = jest.fn();
    const wrapper = mount(<DatePicker onChange={handleChange} />);
    openPanel(wrapper);
    nextYear(wrapper);
    expect(handleChange).not.toHaveBeenCalled();
    nextMonth(wrapper);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('the clear button will clear the input value', () => {
    const wrapper = mount(<DatePicker value={moment('2019-11-23')} />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2019-11-23');
    clearInput(wrapper);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('');
  });
});
