import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import DatePicker from '..';
import DatePickerTest from './DatePicker';
import { openPanel, nextYear, nextMonth, simulateCode } from './utils';
import focusTest from '../../../tests/shared/focusTest';
import TriggerPopTest from '../../../tests/shared/triggerPopTest';

describe('date-picker-pro', () => {
  focusTest(DatePicker);
  TriggerPopTest(DatePicker);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it('renders dataSet date correctly', () => {
    const wrapper = mount(<DatePickerTest />);
    expect(wrapper.find('DatePicker').props().name).toEqual('date');
    expect(
      wrapper
        .find('.c7n-pro-calendar-picker-wrapper')
        .at(0)
        .hasClass('c7n-pro-calendar-picker-multiple'),
    ).toBe(false);
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

  it('the onChange event only triggers when date was selected or changed', () => {
    const handleChange = jest.fn();
    const wrapper = mount(<DatePicker onChange={handleChange} />);
    openPanel(wrapper);
    nextYear(wrapper);
    expect(handleChange).not.toHaveBeenCalled();
    nextMonth(wrapper);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('the keydown event should render correctly', () => {
    const wrapper = mount(<DatePicker mode="date" multiple={false} />);
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
  });

  it('the keyDown event {space} keyCode should render correctly', () => {
    const wrapper = mount(<DatePicker />);
    wrapper.find('input').simulate('keydown', { keyCode: 32 });
    jest.runAllTimers();
    wrapper.update();
  });

  it('the mode { decade } should render correctly', () => {
    const wrapper = mount(<DatePicker mode="decade" />);
    wrapper.find('input').simulate('keydown', { keyCode: 32 });
    jest.runAllTimers();
    wrapper.update();
  });

  it('the keyDown event { esc, enter } keyCode should render correctly', () => {
    const wrapper = mount(<DatePicker />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    simulateCode(wrapper, 9);
    wrapper.update();
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    simulateCode(wrapper, 27);
    wrapper.update();
  });

  it('the { multiple, min, max } property should render correctly', () => {
    const wrapper = mount(
      <DatePicker mode="month" multiple min={moment('2019-02-10')} max={moment('2021-02-10')} />,
    );
    wrapper
      .find('input')
      .at(0)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
    wrapper
      .find('input')
      .at(0)
      .simulate('keydown', { keyCode: 13 });
    jest.runAllTimers();
    wrapper.update();
  });

  it('the { min, max } property should render month-picker correctly', () => {
    const wrapper = mount(
      <DatePicker mode="month" min={moment('2019-02-10')} max={moment('2021-02-10')} />,
    );
    wrapper
      .find('input')
      .at(0)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
  });

  it('read only when setting read-only', () => {
    const wrapper = mount(
      <DatePicker readOnly />,
    );
    const isReadOnly = wrapper.find('input')
      .at(0)
      .prop('readOnly');
    expect(isReadOnly).toBe(true);
  });

  it('the { min, max } property should render year-picker correctly', () => {
    const wrapper = mount(
      <DatePicker mode="year" min={moment('2019-02-10')} max={moment('2021-02-10')} />,
    );
    wrapper
      .find('input')
      .at(0)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
  });
  it('the { min, max } property should render date-time-picker correctly', () => {
    const wrapper = mount(
      <DatePicker mode="dateTime" min={moment('2019-02-10')} max={moment('2021-02-10')} />,
    );
    wrapper
      .find('input')
      .at(0)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
  });

  it('the { min, max } property should render decadeYear-picker correctly', () => {
    const wrapper = mount(
      <DatePicker mode="decade" min={moment('2019-02-10')} max={moment('2021-02-10')} />,
    );
    wrapper
      .find('input')
      .at(0)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
  });

  it('the renderExtraFooter is correct rendered ', () => {
    const wrapper = mount(
      <DatePicker renderExtraFooter={() => 'extra footer'} />,
    );
    wrapper
      .find('input')
      .at(0)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(
      wrapper
      .find('.c7n-pro-calendar-footer-extra')
      .length,
    ).toBe(1);
  });
});
