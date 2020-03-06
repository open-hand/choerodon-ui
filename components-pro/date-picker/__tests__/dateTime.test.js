import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import DateTimePicker from '../../date-time-picker';
import DateTimesTest from './DateTimeTest';
import focusTest from '../../../tests/shared/focusTest';
import { disableWrapper, simulateCode } from './utils';

describe('dateTimes-picker-pro', () => {
  focusTest(DateTimePicker);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('the dateTime will be controlled by the value', () => {
    const wrapper = mount(<DateTimePicker value={moment('2020-02-19')} />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2020-02-19 00:00:00');
    wrapper.setProps({ value: moment('2021-01-01 19:19:19') });
    wrapper.update();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2021-01-01 19:19:19');
  });

  it('should has disabled property can not do anything', () => {
    const wrapper = mount(<DateTimePicker />);
    disableWrapper(wrapper);
  });

  it('the keyDown event { right } keyCode should render correctly', () => {
    const wrapper = mount(<DateTimePicker mode="dateTime" />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    simulateCode(wrapper, 39);
    wrapper.update();
  });

  it('should renders dataset default value correctly', () => {
    const wrapper = mount(<DateTimesTest />);
    expect(wrapper.find('DateTimePicker').props().name).toEqual('creationTime');
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2020-01-22 19:19:19');
  });
});
