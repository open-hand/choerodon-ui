import React from 'react';
import { mount } from 'enzyme';
import DatePicker from '..';

const { RangePicker } = DatePicker;

describe('DatePicker with showTime', () => {
  it('should trigger onChange when select value', () => {
    const onChangeFn = jest.fn();
    const onOpenChangeFn = jest.fn();
    const wrapper = mount(
      <DatePicker showTime open onChange={onChangeFn} onOpenChange={onOpenChangeFn} />
    );

    const calendarWrapper = mount(wrapper.find('Trigger').instance().getComponent());
    calendarWrapper.find('.c7n-calendar-date').at(0).simulate('click');
    expect(onChangeFn).toHaveBeenCalled();
    expect(onOpenChangeFn).not.toHaveBeenCalled();
  });

  it('should trigger onOk when press ok button', () => {
    const onOkFn = jest.fn();
    const onOpenChangeFn = jest.fn();
    const onChangeFn = jest.fn();

    const wrapper = mount(
      <DatePicker showTime open onChange={onChangeFn} onOk={onOkFn} onOpenChange={onOpenChangeFn} />
    );

    const calendarWrapper = mount(wrapper.find('Trigger').instance().getComponent());
    calendarWrapper.find('.c7n-calendar-ok-btn').simulate('click');
    expect(onOkFn).toHaveBeenCalled();
    expect(onOpenChangeFn).toHaveBeenCalledWith(false);
    expect(onChangeFn).not.toHaveBeenCalled();
  });

  it('should trigger onChange when click Now link', () => {
    const onOpenChangeFn = jest.fn();
    const onChangeFn = jest.fn();

    const wrapper = mount(
      <DatePicker showTime open onChange={onChangeFn} onOpenChange={onOpenChangeFn} />
    );

    const calendarWrapper = mount(wrapper.find('Trigger').instance().getComponent());
    calendarWrapper.find('.c7n-calendar-today-btn').simulate('click');
    expect(onOpenChangeFn).toHaveBeenCalledWith(false);
    expect(onChangeFn).toHaveBeenCalled();
  });

  it('should have correct className when use12Hours is true', () => {
    const wrapper = mount(
      <DatePicker showTime={{ use12Hours: true }} open />
    );
    const calendarWrapper = mount(wrapper.find('Trigger').instance().getComponent());
    expect(calendarWrapper.find('.c7n-calendar-time-picker-column-4').length).toBe(0);
    calendarWrapper.find('.c7n-calendar-time-picker-btn').at(0).simulate('click');
    expect(calendarWrapper.find('.c7n-calendar-time-picker-column-4').hostNodes().length).toBe(1);
  });
});

describe('RangePicker with showTime', () => {
  it('should trigger onChange when select value', () => {
    const onChangeFn = jest.fn();
    const onOpenChangeFn = jest.fn();
    const wrapper = mount(
      <RangePicker showTime open onChange={onChangeFn} onOpenChange={onOpenChangeFn} />
    );

    const calendarWrapper = mount(wrapper.find('Trigger').instance().getComponent());
    expect(calendarWrapper.find('.c7n-calendar-time-picker-btn').hasClass('c7n-calendar-time-picker-btn-disabled')).toBe(true);
    expect(calendarWrapper.find('.c7n-calendar-ok-btn').hasClass('c7n-calendar-ok-btn-disabled')).toBe(true);
    calendarWrapper.find('.c7n-calendar-date').at(10).simulate('click');
    calendarWrapper.find('.c7n-calendar-date').at(11).simulate('click');
    expect(calendarWrapper.find('.c7n-calendar-time-picker-btn').hasClass('c7n-calendar-time-picker-btn-disabled')).toBe(false);
    expect(calendarWrapper.find('.c7n-calendar-ok-btn').hasClass('c7n-calendar-ok-btn-disabled')).toBe(false);
    expect(onChangeFn).toHaveBeenCalled();
    expect(onOpenChangeFn).not.toHaveBeenCalled();
  });

  it('hould trigger onOk when press ok button', () => {
    const onOkFn = jest.fn();
    const onChangeFn = jest.fn();
    const onOpenChangeFn = jest.fn();
    const wrapper = mount(
      <RangePicker showTime open onOk={onOkFn} onChange={onChangeFn} onOpenChange={onOpenChangeFn} />
    );

    const calendarWrapper = mount(wrapper.find('Trigger').instance().getComponent());
    calendarWrapper.find('.c7n-calendar-date').at(10).simulate('click');
    calendarWrapper.find('.c7n-calendar-date').at(11).simulate('click');
    onChangeFn.mockClear();
    calendarWrapper.find('.c7n-calendar-ok-btn').simulate('click');
    expect(onOkFn).toHaveBeenCalled();
    expect(onOpenChangeFn).toHaveBeenCalledWith(false);
    expect(onChangeFn).not.toHaveBeenCalled();
  });
});
